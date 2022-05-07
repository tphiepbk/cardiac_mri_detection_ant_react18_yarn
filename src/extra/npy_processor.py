import numpy as np
import matplotlib.pyplot as plt
import cv2
import os
import sys
from pathlib import Path

TEMP_FOLDER_PATH = os.path.abspath(sys.argv[1])
VIDEO_NAME = sys.argv[2]
NPY_LIST_FILEDIR_RAW = list(sys.argv)[3:]
NPY_LIST_FILEDIR = list(map(lambda element : os.path.abspath(element), NPY_LIST_FILEDIR_RAW))

NPY_LIST_FILENAME = list(map(lambda element : Path(element).stem, NPY_LIST_FILEDIR))
NUMBER_OF_SLICES = len(NPY_LIST_FILEDIR)

NUMBER_OF_FRAMES = 0

for filedir, filename in zip(NPY_LIST_FILEDIR, NPY_LIST_FILENAME):

    temp_path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/'.format(filename))
    if (not os.path.exists(temp_path)):
        os.mkdir(temp_path)

    # * GENERATE IMAGES FROM NUMPY ARRAYS
    videoArr = np.load(filedir)
    # ! Lấy model của Đạt predict ra bounding box, truyền filedir vào để lấy ra bbox, lưu vô biến

    expandDim_videoArr = np.expand_dims(videoArr, axis=0)
    videoArr = np.transpose(expandDim_videoArr, [0, 3, 1, 2])

    videoArr = videoArr[0]

    NUMBER_OF_FRAMES = len(videoArr)

    for i in range(NUMBER_OF_FRAMES):
        plt.imsave(os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(filename, i)), videoArr[i], cmap='gray')

temp_path = TEMP_FOLDER_PATH + '/{}_concatenated'.format(VIDEO_NAME, VIDEO_NAME)
if (not os.path.exists(temp_path)):
    os.mkdir(temp_path)

if NUMBER_OF_SLICES == 10:
    for i in range(NUMBER_OF_FRAMES):
        firstRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/0_frames/{}.png'.format(i)))
        # ! Lấy toạ độ bbox vẽ lên image dùng cv2

        for j in range (1, 4):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            firstRow = np.concatenate((firstRow, img), axis=1)

        secondRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/4_frames/{}.png'.format(i)))
        for j in range (5, 8):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            secondRow = np.concatenate((secondRow, img), axis=1)

        thirdRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/8_frames/{}.png'.format(i)))
        blank_image = np.zeros(thirdRow.shape, np.uint8)
        for j in range (9, 10):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            thirdRow = np.concatenate((thirdRow, img), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)

        final = np.concatenate((firstRow, secondRow, thirdRow), axis=0)

        cv2.imwrite(os.path.abspath(TEMP_FOLDER_PATH + '/{}_concatenated/{}.png'.format(VIDEO_NAME, i)), final)

elif NUMBER_OF_SLICES == 11:
    for i in range(NUMBER_OF_FRAMES):
        firstRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/0_frames/{}.png'.format(i)))
        for j in range (1, 4):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            firstRow = np.concatenate((firstRow, img), axis=1)

        secondRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/4_frames/{}.png'.format(i)))
        for j in range (5, 8):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            secondRow = np.concatenate((secondRow, img), axis=1)

        thirdRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/8_frames/{}.png'.format(i)))
        blank_image = np.zeros(thirdRow.shape, np.uint8)
        for j in range (9, 11):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            thirdRow = np.concatenate((thirdRow, img), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)

        final = np.concatenate((firstRow, secondRow, thirdRow), axis=0)

        cv2.imwrite(os.path.abspath(TEMP_FOLDER_PATH + '/{}_concatenated/{}.png'.format(VIDEO_NAME, i)), final)

elif NUMBER_OF_SLICES == 12:
    for i in range(NUMBER_OF_FRAMES):
        firstRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/0_frames/{}.png'.format(i)))
        for j in range (1, 5):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            firstRow = np.concatenate((firstRow, img), axis=1)

        secondRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/5_frames/{}.png'.format(i)))
        for j in range (6, 10):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            secondRow = np.concatenate((secondRow, img), axis=1)

        thirdRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/10_frames/{}.png'.format(i)))
        blank_image = np.zeros(thirdRow.shape, np.uint8)
        for j in range (11, 12):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            thirdRow = np.concatenate((thirdRow, img), axis=1)

        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)

        final = np.concatenate((firstRow, secondRow, thirdRow), axis=0)

        cv2.imwrite(os.path.abspath(TEMP_FOLDER_PATH + '/{}_concatenated/{}.png'.format(VIDEO_NAME, i)), final)

else:
    for i in range(NUMBER_OF_FRAMES):
        firstRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/0_frames/{}.png'.format(i)))
        for j in range (1, 5):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            firstRow = np.concatenate((firstRow, img), axis=1)

        secondRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/5_frames/{}.png'.format(i)))
        for j in range (6, 10):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            secondRow = np.concatenate((secondRow, img), axis=1)

        thirdRow = cv2.imread(os.path.abspath(TEMP_FOLDER_PATH + '/10_frames/{}.png'.format(i)))
        blank_image = np.zeros(thirdRow.shape, np.uint8)
        for j in range (11, 13):
            path = os.path.abspath(TEMP_FOLDER_PATH + '/{}_frames/{}.png'.format(j, i))
            img = cv2.imread(path)
            thirdRow = np.concatenate((thirdRow, img), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)

        final = np.concatenate((firstRow, secondRow, thirdRow), axis=0)

        cv2.imwrite(os.path.abspath(TEMP_FOLDER_PATH + '/{}_concatenated/{}.png'.format(VIDEO_NAME, i)), final)

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