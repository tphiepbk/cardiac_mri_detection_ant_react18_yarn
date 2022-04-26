import numpy as np
import matplotlib.pyplot as plt
import cv2
import os
import sys
from pathlib import Path

NPY_LIST_FILEDIR = list(sys.argv)[2:]
NPY_LIST_FILENAME = list(map(lambda element : Path(element).stem, NPY_LIST_FILEDIR))
NUMBER_OF_SLICES = len(NPY_LIST_FILEDIR)
VIDEO_NAME = sys.argv[1]

for filedir, filename in zip(NPY_LIST_FILEDIR, NPY_LIST_FILENAME):

    os.mkdir('./temp/{}_frames/'.format(filename))

    # * GENERATE IMAGES FROM NUMPY ARRAYS
    videoArr = np.load(filedir)

    expandDim_videoArr = np.expand_dims(videoArr, axis=0)
    videoArr = np.transpose(expandDim_videoArr, [0, 3, 1, 2])

    videoArr = videoArr[0]

    for i in range(len(videoArr)):
        plt.imsave('./temp/{}_frames/{}.png'.format(filename, i), videoArr[i], cmap='gray')

os.mkdir('./temp/{}'.format(VIDEO_NAME))

if NUMBER_OF_SLICES == 10:
    for i in range(30):
        firstRow = cv2.imread('./temp/0_frames/{}.png'.format(i))
        for j in range (1, 4):
            path = './temp/{}_frames/{}.png'.format(j, i)
            img = cv2.imread(path)
            firstRow = np.concatenate((firstRow, img), axis=1)

        secondRow = cv2.imread('./temp/4_frames/{}.png'.format(i))
        for j in range (5, 8):
            path = './temp/{}_frames/{}.png'.format(j, i)
            img = cv2.imread(path)
            secondRow = np.concatenate((secondRow, img), axis=1)

        blank_image = np.zeros((128,96,3), np.uint8)
        thirdRow = cv2.imread('./temp/8_frames/{}.png'.format(i))
        for j in range (9, 10):
            path = './temp/{}_frames/{}.png'.format(j, i)
            img = cv2.imread(path)
            thirdRow = np.concatenate((thirdRow, img), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)

        final = np.concatenate((firstRow, secondRow, thirdRow), axis=0)

        cv2.imwrite('./temp/{}/{}.png'.format(VIDEO_NAME, i), final)

elif NUMBER_OF_SLICES == 11:
    for i in range(30):
        firstRow = cv2.imread('./temp/0_frames/{}.png'.format(i))
        for j in range (1, 4):
            path = './temp/{}_frames/{}.png'.format(j, i)
            img = cv2.imread(path)
            firstRow = np.concatenate((firstRow, img), axis=1)

        secondRow = cv2.imread('./temp/4_frames/{}.png'.format(i))
        for j in range (5, 8):
            path = './temp/{}_frames/{}.png'.format(j, i)
            img = cv2.imread(path)
            secondRow = np.concatenate((secondRow, img), axis=1)

        blank_image = np.zeros((128,96,3), np.uint8)
        thirdRow = cv2.imread('./temp/8_frames/{}.png'.format(i))
        for j in range (9, 11):
            path = './temp/{}_frames/{}.png'.format(j, i)
            img = cv2.imread(path)
            thirdRow = np.concatenate((thirdRow, img), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)

        final = np.concatenate((firstRow, secondRow, thirdRow), axis=0)

        cv2.imwrite('./temp/{}/{}.png'.format(VIDEO_NAME, i), final)

elif NUMBER_OF_SLICES == 12:
    for i in range(30):
        firstRow = cv2.imread('./temp/0_frames/{}.png'.format(i))
        for j in range (1, 5):
            path = './temp/{}_frames/{}.png'.format(j, i)
            img = cv2.imread(path)
            firstRow = np.concatenate((firstRow, img), axis=1)

        secondRow = cv2.imread('./temp/5_frames/{}.png'.format(i))
        for j in range (6, 10):
            path = './temp/{}_frames/{}.png'.format(j, i)
            img = cv2.imread(path)
            secondRow = np.concatenate((secondRow, img), axis=1)

        blank_image = np.zeros((128,96,3), np.uint8)
        thirdRow = cv2.imread('./temp/10_frames/{}.png'.format(i))
        for j in range (11, 12):
            path = './temp/{}_frames/{}.png'.format(j, i)
            img = cv2.imread(path)
            thirdRow = np.concatenate((thirdRow, img), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)

        final = np.concatenate((firstRow, secondRow, thirdRow), axis=0)

        cv2.imwrite('./temp/{}/{}.png'.format(VIDEO_NAME, i), final)

else:
    for i in range(30):
        firstRow = cv2.imread('./temp/0_frames/{}.png'.format(i))
        for j in range (1, 5):
            path = './temp/{}_frames/{}.png'.format(j, i)
            img = cv2.imread(path)
            firstRow = np.concatenate((firstRow, img), axis=1)

        secondRow = cv2.imread('./temp/5_frames/{}.png'.format(i))
        for j in range (6, 10):
            path = './temp/{}_frames/{}.png'.format(j, i)
            img = cv2.imread(path)
            secondRow = np.concatenate((secondRow, img), axis=1)

        blank_image = np.zeros((128,96,3), np.uint8)
        thirdRow = cv2.imread('./temp/10_frames/{}.png'.format(i))
        for j in range (11, 13):
            path = './temp/{}_frames/{}.png'.format(j, i)
            img = cv2.imread(path)
            thirdRow = np.concatenate((thirdRow, img), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)
        thirdRow = np.concatenate((thirdRow, blank_image), axis=1)

        final = np.concatenate((firstRow, secondRow, thirdRow), axis=0)

        cv2.imwrite('./temp/{}/{}.png'.format(VIDEO_NAME, i), final)

# * GENERATE VIDEO FROM IMAGES
images_folder = './temp/{}/'.format(VIDEO_NAME)

output_video_name_avi = './temp/{}.avi'.format(VIDEO_NAME)

images = [img for img in os.listdir(images_folder) if img.endswith(".png")]

images.sort(key = lambda x: int(x[:-4]))

frame = cv2.imread(os.path.join(images_folder, images[0]))

height, width, layers = frame.shape

video_avi = cv2.VideoWriter(output_video_name_avi, 0, 30, (width,height))
for image in images:
    video_avi.write(cv2.imread(os.path.join(images_folder, image)))
video_avi.release()