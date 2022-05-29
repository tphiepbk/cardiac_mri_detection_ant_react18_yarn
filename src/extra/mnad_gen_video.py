import glob
import cv2
import os 
import sys

MNAD_GENERATED_FRAMES_FOLDER = os.path.abspath(sys.argv[1])

MNAD_OUTPUT_VIDEO_PATH = os.path.abspath(sys.argv[2])

def create_video(img_folder, save_name):
    img_array = []

    for i, filename in enumerate(sorted(glob.glob(os.path.join(img_folder, '*.jpg')))):
        img = cv2.imread(filename)
        img_array.append(img)

    height, width, layers = img_array[0].shape
    number_of_frames = len(img_array)
    out = cv2.VideoWriter(save_name, 0, number_of_frames, (width, height))

    for i in range(len(img_array)):
        out.write(img_array[i])
    out.release()

create_video(MNAD_GENERATED_FRAMES_FOLDER, MNAD_OUTPUT_VIDEO_PATH)