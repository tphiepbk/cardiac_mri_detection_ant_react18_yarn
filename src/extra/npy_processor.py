import numpy as np
import glob
import matplotlib.pyplot as plt
import cv2
import os
import sys
import torch
from pathlib import Path
from functools import reduce
from sklearn.cluster import KMeans

import sklearn.utils._typedefs
import sklearn.neighbors._partition_nodes
import yaml
import PIL.ExifTags
import seaborn

DETECTOR_PATH = os.path.abspath(sys.argv[1])
TEMP_FOLDER_PATH = os.path.abspath(sys.argv[2])
VIDEO_NAME = sys.argv[3]
NPY_FOLDER_PATH = os.path.abspath(sys.argv[4])

NPY_LIST_FILEDIR = glob.glob(os.path.abspath(NPY_FOLDER_PATH + '/*.npy'))

NPY_LIST_FILENAME = list(map(lambda element : Path(element).stem, NPY_LIST_FILEDIR))
NUMBER_OF_SLICES = len(NPY_LIST_FILEDIR)

NUMBER_OF_FRAMES = 0

# * =============================================== BOUNDING BOX TOOLS ===============================================
def load_detection_model(path):
    detector = torch.hub.load('ultralytics/yolov5', 'custom', path=path)
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

bbox = get_bounding_box(NPY_FOLDER_PATH, os.path.abspath(DETECTOR_PATH))
color = (0, 255, 0)
thickness = 2

if (not os.path.exists(TEMP_FOLDER_PATH)):
    os.mkdir(TEMP_FOLDER_PATH)

for filedir, filename in zip(NPY_LIST_FILEDIR, NPY_LIST_FILENAME):

    temp_path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/'.format(filename))
    if (not os.path.exists(temp_path)):
        os.mkdir(temp_path)

    # * GENERATE IMAGES FROM NUMPY ARRAYS
    videoArr = np.load(filedir)

    expandDim_videoArr = np.expand_dims(videoArr, axis=0)
    videoArr = np.transpose(expandDim_videoArr, [0, 3, 1, 2])

    videoArr = videoArr[0]

    NUMBER_OF_FRAMES = len(videoArr)

    for i in range(NUMBER_OF_FRAMES):
        plt.imsave(os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(filename, i)), videoArr[i], cmap='gray')

temp_path = TEMP_FOLDER_PATH + '/{}_concatenated'.format(VIDEO_NAME, VIDEO_NAME)
if (not os.path.exists(temp_path)):
    os.mkdir(temp_path)

temp_path_bbox = TEMP_FOLDER_PATH + '/{}_bbox_concatenated'.format(VIDEO_NAME, VIDEO_NAME)
if (not os.path.exists(temp_path_bbox)):
    os.mkdir(temp_path_bbox)

if NUMBER_OF_SLICES == 10:
    for i in range(NUMBER_OF_FRAMES):
        firstRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/9_frames/{}.png'.format(i)))
        firstRow_bbox = firstRow.copy()
        firstRow_bbox = cv2.rectangle(firstRow_bbox, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
        for j in range (8, 5, -1):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            firstRow = np.concatenate((firstRow, img), axis=1)
            img_bbox = cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            firstRow_bbox = np.concatenate((firstRow_bbox, img_bbox), axis=1)

        secondRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/5_frames/{}.png'.format(i)))
        secondRow_bbox = secondRow.copy()
        secondRow_bbox = cv2.rectangle(secondRow_bbox, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
        for j in range (4, 1, -1):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            secondRow = np.concatenate((secondRow, img), axis=1)
            img_bbox = cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            secondRow_bbox = np.concatenate((secondRow_bbox, img_bbox), axis=1)

        thirdRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/1_frames/{}.png'.format(i)))
        thirdRow_bbox = thirdRow.copy()
        thirdRow_bbox = cv2.rectangle(thirdRow_bbox, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
        blank_image = np.zeros(thirdRow.shape, np.uint8)
        for j in range (0, -1, -1):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            thirdRow = np.concatenate((thirdRow, img), axis=1)
            img_bbox = cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            thirdRow_bbox = np.concatenate((thirdRow_bbox, img_bbox), axis=1)

        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)

        thirdRow_bbox = np.concatenate((thirdRow_bbox, blank_image), axis=1)
        thirdRow_bbox = np.concatenate((thirdRow_bbox, blank_image), axis=1)

        final = np.concatenate((firstRow, secondRow, thirdRow), axis=0)
        final_bbox = np.concatenate((firstRow_bbox, secondRow_bbox, thirdRow_bbox), axis=0)

        cv2.imwrite(os.path.abspath(TEMP_FOLDER_PATH + '/{}_concatenated/{}.png'.format(VIDEO_NAME, i)), final)
        cv2.imwrite(os.path.abspath(TEMP_FOLDER_PATH + '/{}_bbox_concatenated/{}.png'.format(VIDEO_NAME, i)), final_bbox)

elif NUMBER_OF_SLICES == 11:
    for i in range(NUMBER_OF_FRAMES):
        firstRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/10_frames/{}.png'.format(i)))
        firstRow_bbox = firstRow.copy()
        firstRow_bbox = cv2.rectangle(firstRow_bbox, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
        for j in range (9, 6, -1):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            firstRow = np.concatenate((firstRow, img), axis=1)
            img_bbox = cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            firstRow_bbox = np.concatenate((firstRow_bbox, img_bbox), axis=1)

        secondRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/6_frames/{}.png'.format(i)))
        secondRow_bbox = secondRow.copy()
        secondRow_bbox = cv2.rectangle(secondRow_bbox, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
        for j in range (5, 2, -1):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            secondRow = np.concatenate((secondRow, img), axis=1)
            img_bbox = cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            secondRow_bbox = np.concatenate((secondRow_bbox, img_bbox), axis=1)

        thirdRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/2_frames/{}.png'.format(i)))
        thirdRow_bbox = thirdRow.copy()
        thirdRow_bbox = cv2.rectangle(thirdRow_bbox, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
        blank_image = np.zeros(thirdRow.shape, np.uint8)
        for j in range (1, -1, -1):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            thirdRow = np.concatenate((thirdRow, img), axis=1)
            img_bbox = cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            thirdRow_bbox = np.concatenate((thirdRow_bbox, img_bbox), axis=1)

        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)

        thirdRow_bbox = np.concatenate((thirdRow_bbox, blank_image), axis=1)

        final = np.concatenate((firstRow, secondRow, thirdRow), axis=0)

        final_bbox = np.concatenate((firstRow_bbox, secondRow_bbox, thirdRow_bbox), axis=0)

        cv2.imwrite(os.path.abspath(TEMP_FOLDER_PATH + '/{}_concatenated/{}.png'.format(VIDEO_NAME, i)), final)
        cv2.imwrite(os.path.abspath(TEMP_FOLDER_PATH + '/{}_bbox_concatenated/{}.png'.format(VIDEO_NAME, i)), final_bbox)

elif NUMBER_OF_SLICES == 12:
    for i in range(NUMBER_OF_FRAMES):
        firstRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/11_frames/{}.png'.format(i)))
        firstRow_bbox = firstRow.copy()
        firstRow_bbox = cv2.rectangle(firstRow_bbox, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
        for j in range (10, 6, -1):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            firstRow = np.concatenate((firstRow, img), axis=1)
            img_bbox = cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            firstRow_bbox = np.concatenate((firstRow_bbox, img_bbox), axis=1)

        secondRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/6_frames/{}.png'.format(i)))
        secondRow_bbox = secondRow.copy()
        secondRow_bbox = cv2.rectangle(secondRow_bbox, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
        for j in range (5, 1, -1):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            secondRow = np.concatenate((secondRow, img), axis=1)
            img_bbox = cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            secondRow_bbox = np.concatenate((secondRow_bbox, img_bbox), axis=1)

        thirdRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/1_frames/{}.png'.format(i)))
        thirdRow_bbox = thirdRow.copy()
        thirdRow_bbox = cv2.rectangle(thirdRow_bbox, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
        blank_image = np.zeros(thirdRow.shape, np.uint8)
        for j in range (0, -1, -1):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            thirdRow = np.concatenate((thirdRow, img), axis=1)
            img_bbox = cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            thirdRow_bbox = np.concatenate((thirdRow_bbox, img_bbox), axis=1)

        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)

        thirdRow_bbox = np.concatenate((thirdRow_bbox, blank_image), axis=1)
        thirdRow_bbox = np.concatenate((thirdRow_bbox, blank_image), axis=1)
        thirdRow_bbox = np.concatenate((thirdRow_bbox, blank_image), axis=1)

        final = np.concatenate((firstRow, secondRow, thirdRow), axis=0)

        final_bbox = np.concatenate((firstRow_bbox, secondRow_bbox, thirdRow_bbox), axis=0)

        cv2.imwrite(os.path.abspath(TEMP_FOLDER_PATH + '/{}_concatenated/{}.png'.format(VIDEO_NAME, i)), final)
        cv2.imwrite(os.path.abspath(TEMP_FOLDER_PATH + '/{}_bbox_concatenated/{}.png'.format(VIDEO_NAME, i)), final_bbox)

else:
    for i in range(NUMBER_OF_FRAMES):
        firstRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/12_frames/{}.png'.format(i)))
        firstRow_bbox = firstRow.copy()
        firstRow_bbox = cv2.rectangle(firstRow_bbox, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
        for j in range (11, 7, -1):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            firstRow = np.concatenate((firstRow, img), axis=1)
            img_bbox = cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            firstRow_bbox = np.concatenate((firstRow_bbox, img_bbox), axis=1)

        secondRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/7_frames/{}.png'.format(i)))
        secondRow_bbox = secondRow.copy()
        secondRow_bbox = cv2.rectangle(secondRow_bbox, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
        for j in range (6, 2):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            secondRow = np.concatenate((secondRow, img), axis=1)
            img_bbox = cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            secondRow_bbox = np.concatenate((secondRow_bbox, img_bbox), axis=1)

        thirdRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/2_frames/{}.png'.format(i)))
        thirdRow_bbox = thirdRow.copy()
        thirdRow_bbox = cv2.rectangle(thirdRow_bbox, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
        blank_image = np.zeros(thirdRow.shape, np.uint8)
        for j in range (1, -1, -1):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            thirdRow = np.concatenate((thirdRow, img), axis=1)
            img_bbox = cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            thirdRow_bbox = np.concatenate((thirdRow_bbox, img_bbox), axis=1)

        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)

        thirdRow_bbox = np.concatenate((thirdRow_bbox, blank_image), axis=1)
        thirdRow_bbox = np.concatenate((thirdRow_bbox, blank_image), axis=1)

        final = np.concatenate((firstRow, secondRow, thirdRow), axis=0)

        final_bbox = np.concatenate((firstRow_bbox, secondRow_bbox, thirdRow_bbox), axis=0)

        cv2.imwrite(os.path.abspath(TEMP_FOLDER_PATH + '/{}_concatenated/{}.png'.format(VIDEO_NAME, i)), final)
        cv2.imwrite(os.path.abspath(TEMP_FOLDER_PATH + '/{}_bbox_concatenated/{}.png'.format(VIDEO_NAME, i)), final_bbox)

# * GENERATE VIDEO FROM IMAGES
images_folder = os.path.abspath(TEMP_FOLDER_PATH + '/{}_concatenated/'.format(VIDEO_NAME))

output_video_name_avi = os.path.abspath(TEMP_FOLDER_PATH + '/{}.avi'.format(VIDEO_NAME))

images = [img for img in os.listdir(images_folder) if img.endswith(".png")]

images.sort(key = lambda x: int(x[:-4]))

frame = cv2.imread(os.path.join(images_folder, images[0]))

height, width, layers = frame.shape

video_avi = cv2.VideoWriter(output_video_name_avi, 0, NUMBER_OF_FRAMES, (width,height))
for image in images:
    video_avi.write(cv2.imread(os.path.join(images_folder, image)))
video_avi.release()

# * GENERATE VIDEO FROM IMAGES WITH BOUNDING BOX
images_folder = os.path.abspath(TEMP_FOLDER_PATH + '/{}_bbox_concatenated/'.format(VIDEO_NAME))

output_video_name_avi = os.path.abspath(TEMP_FOLDER_PATH + '/{}_bbox.avi'.format(VIDEO_NAME))

images = [img for img in os.listdir(images_folder) if img.endswith(".png")]

images.sort(key = lambda x: int(x[:-4]))

frame = cv2.imread(os.path.join(images_folder, images[0]))

height, width, layers = frame.shape

video_avi = cv2.VideoWriter(output_video_name_avi, 0, NUMBER_OF_FRAMES, (width,height))
for image in images:
    video_avi.write(cv2.imread(os.path.join(images_folder, image)))
video_avi.release()