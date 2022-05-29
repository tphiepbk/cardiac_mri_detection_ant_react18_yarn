from genericpath import exists
from importlib.resources import path
import numpy as np
import glob
import cv2
import os
import sys
import torch
from functools import reduce
from sklearn.cluster import KMeans

ULTRALYTICS_YOLOV5_PATH = os.path.abspath(sys.argv[1])

DETECTOR_PATH = os.path.abspath(sys.argv[2])

TEMP_FOLDER_PATH = os.path.abspath(sys.argv[3])

NPY_FOLDER_PATHS = list(map(lambda folder_path: os.path.abspath(folder_path), sys.argv[4:]))

# * =============================================== BOUNDING BOX TOOLS ===============================================

def load_detection_model(path):
    detector = torch.hub.load(ULTRALYTICS_YOLOV5_PATH, 'custom', path=path, source='local')
    detector.max_det = 1
    return detector

def load_and_detect(path, detector, frame_idx=0):
    arr = np.load(path)
    num_frame = arr.shape[-1]
    start = num_frame // 2 - 5
    end = start + 10
    bboxs = []
    for i in range(start, end):
        bbox = detector(arr[:,:,i], 256).pred[0]
        if bbox.numel():
            bbox = bbox.cpu().detach().numpy()[0]
            bboxs += [bbox]
    return bboxs

def IoU(boxA, boxB):
	xA = max(boxA[0], boxB[0])
	yA = max(boxA[1], boxB[1])
	xB = min(boxA[2], boxB[2])
	yB = min(boxA[3], boxB[3])
	interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)
	boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1)
	boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1)
	iou = interArea / float(boxAArea + boxBArea - interArea)
	return iou

def RevertNonMaxSuppression(bboxs, thresh=0.75, n=5):
    bboxs = sorted(bboxs, key=lambda box: box[4], reverse=True)
    bboxs = list(filter(lambda box: IoU(box, bboxs[0]) >= thresh, bboxs))
    return bboxs

def getGroupOfBBoxMax(bboxs, thresh):
    max_count = 0
    group_of_box = []
    n = len(bboxs)
    for i in range(n):
        ref_bbox = bboxs[i]
        count = 0
        cur_group_of_box = []
        for j in range(n):
            iou = IoU(ref_bbox, bboxs[j])
            if iou >= thresh:
                count += 1
                cur_group_of_box += [bboxs[j]]
            if max_count < count:
                max_count = count
                group_of_box = cur_group_of_box
    return group_of_box

def get_final_bbox(sample_path, detector, frame_idx=0):
    n = len(glob.glob(sample_path + '/*.npy'))
    start = int(n*0.3)
    end = n - int(n*0.2)
    paths = [os.path.join(sample_path, str(i) + '.npy') for i in range(start, end)]
    bboxs = reduce(lambda acc, path: acc + load_and_detect(path, detector, frame_idx), paths, [])
    bboxs = [box for box in bboxs if len(box) != 0]
    bboxs = getGroupOfBBoxMax(bboxs, 0.6)
    hs, ws, _ = np.load(paths[0]).shape
    if len(bboxs) == 0: return [0, hs, 0, ws]
    max_size = reduce(lambda acc, ele: max(max(acc, ele[3] - ele[1]), ele[2] - ele[0]), bboxs, 0)
    max_size = int(max_size)
    final_bbox = combine_bboxs(bboxs, hs, ws, max_size)
    return final_bbox

def getCenterOfBox(box):
    return (box[0]+box[2])/2, (box[1] + box[3])/2

def combine_bboxs(bboxs, hs, ws, max_size):
    bbox_size = max_size
    max_size *= 1.1
    max_size = int(max_size)
    centers = [getCenterOfBox(box) for box in bboxs]
    kmeans = KMeans(n_clusters=1, random_state=0).fit(centers)
    final_center = kmeans.cluster_centers_[0]
    x, y = final_center
    if bbox_size < 40:
        xmin, ymin = int(x-max_size//2) + (max_size - bbox_size), int(y-max_size//2)
    else:
        xmin, ymin = int(x-max_size//2) + (max_size - bbox_size)*1//3, int(y-max_size//2)
    xmax, ymax = xmin + max_size, ymin + max_size
    if xmin < 0:
        xmin = 0
        xmax = max_size
    if ymin < 0:
        ymin = 0
        ymax = max_size
    if xmax > ws:
        xmax = ws
        xmin = ws - max_size
    if ymax > hs:
        ymax = hs
        ymin = ymax - max_size
    return [xmin, ymin, xmax, ymax]

def get_bounding_box(npy_sample_path, detection_model_path):
    detector = load_detection_model(detection_model_path)
    return get_final_bbox(npy_sample_path, detector)

# * ==================================================================================================================

for NPY_FOLDER_PATH in NPY_FOLDER_PATHS:
    VIDEO_NAME = os.path.basename(NPY_FOLDER_PATH)

    TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE = os.path.abspath(TEMP_FOLDER_PATH + '/' + VIDEO_NAME + '/')

    if not os.path.exists(TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE):
        os.mkdir(TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE)

    TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE_CROPPED_NPY = os.path.abspath(TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE + '/cropped_npy/')

    if not os.path.exists(TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE_CROPPED_NPY):
        os.mkdir(TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE_CROPPED_NPY)

    TEMP_FILE_NAME = os.path.abspath(TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE + '/' + '{}_temp.png'.format(VIDEO_NAME))

    NPY_LIST_FILEDIR = glob.glob(os.path.abspath(NPY_FOLDER_PATH + '/*.npy'))
    NPY_LIST_FILEDIR.sort(key = lambda x: int(os.path.basename(x).split('.')[0]))
    NPY_LIST_FILEDIR = NPY_LIST_FILEDIR[::-1]

    NPY_LIST_FILENAME = list(map(lambda element : os.path.basename(element).split('.')[0], NPY_LIST_FILEDIR))

    NUMBER_OF_SLICES = len(NPY_LIST_FILEDIR)

    bbox = get_bounding_box(NPY_FOLDER_PATH, os.path.abspath(DETECTOR_PATH))
    color = (0, 255, 0)
    thickness = 2

    npy_slices = []

    concatenated_npy_sample = []

    for filedir, filename in zip(NPY_LIST_FILEDIR, NPY_LIST_FILENAME):

        videoArr = np.load(filedir)

        np.save(os.path.abspath('{}/{}_cropped.npy'.format(TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE_CROPPED_NPY, filename)), videoArr[bbox[1]:bbox[3], bbox[0]:bbox[2], :])

        concatenated_npy_sample += [videoArr[bbox[1]:bbox[3], bbox[0]:bbox[2], :]]

        expandDim_videoArr = np.expand_dims(videoArr, axis=0)
        videoArr = np.transpose(expandDim_videoArr, [0, 3, 1, 2])

        videoArr = videoArr[0]

        npy_slices += [videoArr]

        current_slice_temp_path = os.path.abspath(TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE + '/' + 'slice_{}/'.format(filename))

        current_slice_temp_path_cropped = os.path.abspath(TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE + '/' + 'cropped_slice_{}/'.format(filename))

        if not os.path.exists(current_slice_temp_path):
            os.mkdir(current_slice_temp_path)

        if not os.path.exists(current_slice_temp_path_cropped):
            os.mkdir(current_slice_temp_path_cropped)

        for i in range(len(videoArr)):
            cv2.imwrite(os.path.abspath('{}/{}.png'.format(current_slice_temp_path, i)), videoArr[i])
            cv2.imwrite(os.path.abspath('{}/{}.png'.format(current_slice_temp_path_cropped, i)), videoArr[i][bbox[1]:bbox[3], bbox[0]:bbox[2]])

    concatenated_npy_sample = np.moveaxis(np.array(concatenated_npy_sample), 3, 1)
    np.save(os.path.abspath('{}/{}.npy'.format(TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE, VIDEO_NAME)), concatenated_npy_sample)

    NUMBER_OF_FRAMES = len(npy_slices[0])

    blank_image = np.zeros(npy_slices[0][0].shape + (3,), np.uint8)

    concatenated_frames = []
    concatenated_frames_bbox = []

    for i in range(NUMBER_OF_FRAMES):

        current_frame_slices = [element[i] for element in npy_slices]

        current_frame_converted_slices = []
        current_frame_converted_slices_bbox = []

        for current_frame_current_slice in current_frame_slices:
            cv2.imwrite(TEMP_FILE_NAME, current_frame_current_slice)
            img = cv2.imread(TEMP_FILE_NAME)
            current_frame_converted_slices += [img]
            current_frame_converted_slices_bbox += [cv2.rectangle(img.copy(), (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)]

        first_row, second_row, third_row = None, None, None
        first_row_bbox, second_row_bbox, third_row_bbox = None, None, None

        if NUMBER_OF_SLICES == 10:
            first_row = np.concatenate(tuple(current_frame_converted_slices[0:4]), axis=1)
            second_row = np.concatenate(tuple(current_frame_converted_slices[4:8]), axis=1)
            third_row = np.concatenate(tuple(current_frame_converted_slices[8:10] + [blank_image, blank_image]), axis=1)

            final = np.concatenate((first_row, second_row, third_row), axis=0)

            concatenated_frames += [final]

            first_row_bbox = np.concatenate(tuple(current_frame_converted_slices_bbox[0:4]), axis=1)
            second_row_bbox = np.concatenate(tuple(current_frame_converted_slices_bbox[4:8]), axis=1)
            third_row_bbox = np.concatenate(tuple(current_frame_converted_slices_bbox[8:10] + [blank_image, blank_image]), axis=1)

            final_bbox = np.concatenate((first_row_bbox, second_row_bbox, third_row_bbox), axis=0)

            concatenated_frames_bbox += [final_bbox]

        elif NUMBER_OF_SLICES == 11:
            first_row = np.concatenate(tuple(current_frame_converted_slices[0:4]), axis=1)
            second_row = np.concatenate(tuple(current_frame_converted_slices[4:8]), axis=1)
            third_row = np.concatenate(tuple(current_frame_converted_slices[8:11] + [blank_image]), axis=1)

            final = np.concatenate((first_row, second_row, third_row), axis=0)

            concatenated_frames += [final]

            first_row_bbox = np.concatenate(tuple(current_frame_converted_slices_bbox[0:4]), axis=1)
            second_row_bbox = np.concatenate(tuple(current_frame_converted_slices_bbox[4:8]), axis=1)
            third_row_bbox = np.concatenate(tuple(current_frame_converted_slices_bbox[8:11] + [blank_image]), axis=1)

            final_bbox = np.concatenate((first_row_bbox, second_row_bbox, third_row_bbox), axis=0)

            concatenated_frames_bbox += [final_bbox]

        elif NUMBER_OF_SLICES == 12:
            first_row = np.concatenate(tuple(current_frame_converted_slices[0:5]), axis=1)
            second_row = np.concatenate(tuple(current_frame_converted_slices[5:10]), axis=1)
            third_row = np.concatenate(tuple(current_frame_converted_slices[10:12] + [blank_image, blank_image, blank_image]), axis=1)

            final = np.concatenate((first_row, second_row, third_row), axis=0)

            concatenated_frames += [final]

            first_row_bbox = np.concatenate(tuple(current_frame_converted_slices_bbox[0:5]), axis=1)
            second_row_bbox = np.concatenate(tuple(current_frame_converted_slices_bbox[5:10]), axis=1)
            third_row_bbox = np.concatenate(tuple(current_frame_converted_slices_bbox[10:12] + [blank_image, blank_image, blank_image]), axis=1)

            final_bbox = np.concatenate((first_row_bbox, second_row_bbox, third_row_bbox), axis=0)

            concatenated_frames_bbox += [final_bbox]

        else:
            first_row = np.concatenate(tuple(current_frame_converted_slices[0:5]), axis=1)
            second_row = np.concatenate(tuple(current_frame_converted_slices[5:10]), axis=1)
            third_row = np.concatenate(tuple(current_frame_converted_slices[10:13] + [blank_image, blank_image]), axis=1)

            final = np.concatenate((first_row, second_row, third_row), axis=0)

            concatenated_frames += [final]

            first_row_bbox = np.concatenate(tuple(current_frame_converted_slices_bbox[0:5]), axis=1)
            second_row_bbox = np.concatenate(tuple(current_frame_converted_slices_bbox[5:10]), axis=1)
            third_row_bbox = np.concatenate(tuple(current_frame_converted_slices_bbox[10:13] + [blank_image, blank_image]), axis=1)

            final_bbox = np.concatenate((first_row_bbox, second_row_bbox, third_row_bbox), axis=0)

            concatenated_frames_bbox += [final_bbox]

    height, width, layers = concatenated_frames[0].shape

    video_avi = cv2.VideoWriter(os.path.abspath('{}/{}.avi'.format(TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE, VIDEO_NAME)), 0, NUMBER_OF_FRAMES, (width,height))

    for frame in concatenated_frames:
        cv2.imwrite(TEMP_FILE_NAME, frame)
        video_avi.write(cv2.imread(TEMP_FILE_NAME))
    video_avi.release()

    video_avi_bbox = cv2.VideoWriter(os.path.abspath('{}/{}_bbox.avi'.format(TEMP_FOLDER_PATH_FOR_CURRENT_SAMPLE, VIDEO_NAME)), 0, NUMBER_OF_FRAMES, (width,height))

    for frame in concatenated_frames_bbox:
        cv2.imwrite(TEMP_FILE_NAME, frame)
        video_avi_bbox.write(cv2.imread(TEMP_FILE_NAME))
    video_avi_bbox.release()
