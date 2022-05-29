import cv2
import numpy as np
import matplotlib.pyplot as plt
import os
import math
from collections import namedtuple
import numpy as np
import sys

NPY_SLICE_PATH = os.path.abspath(sys.argv[1])

ED_FRAME_INDEX = int(sys.argv[2])
ES_FRAME_INDEX = int(sys.argv[3])

TEMP_FOLDER_PATH_CURRENT_SAMPLE = os.path.abspath(os.path.join(NPY_SLICE_PATH, os.pardir))
TEMP_FOLDER_PATH_CURRENT_SAMPLE = os.path.abspath(os.path.join(TEMP_FOLDER_PATH_CURRENT_SAMPLE, os.pardir))
SAMPLE_NAME = os.path.basename(TEMP_FOLDER_PATH_CURRENT_SAMPLE)

SLICE_NUMBER = os.path.basename(NPY_SLICE_PATH)[:-12]

def ifftshift(grid):
    return np.fft.ifftshift(grid)

def ndgrid(ymid, ymax, xmid, xmax):
    x = np.arange(-ymid, ymax+1)
    y = np.arange(-xmid, xmax+1)
    xGrid, yGrid = np.meshgrid(y, x)
    return yGrid, xGrid

def freqgrid2(ysize, xsize):
    ymid = ysize//2
    xmid = xsize//2

    if ysize%2 == 0:
        ymax = ymid - 1
    else:
        ymax = ymid

    if xsize%2 == 0:
        xmax = xmid - 1
    else:
        xmax = xmid
    yGrid, xGrid = ndgrid(ymid, ymax, xmid, xmax)
    yGrid = ifftshift(yGrid)/ysize
    xGrid = ifftshift(xGrid)/ysize
    return yGrid, xGrid

def createMonogenicFilters(ysize, xsize, wavelengths, typ='dop', parameter=None):
    yGrid, xGrid = freqgrid2(ysize, xsize)
    w = np.sqrt(yGrid**2 + xGrid**2)
    w[0, 0] = 1
    numFilt = len(wavelengths)

    if parameter is not None:
        if parameter < 0.0 or parameter > 1.0:
            raise('Parameter must be between 0.0 and 1.0')
        sigmaOnf = parameter
        ratio = parameter
    else:
        sigmaOnf = 0.5
        ratio = 0.98

    bpFilt = np.zeros((ysize, xsize, 1, numFilt))

    for flt in range(numFilt):
        fo = 1.0/wavelengths[flt]
        w0 = fo

        # DoP
        if typ == 'dop':
            s2 = wavelengths[flt]/((ratio-1))*np.log(ratio)
            s1 = ratio*s2
            bpFilt[:, :, 0, flt] = np.exp(-w*s1) - np.exp(-w*s2)

        # log gabo
        else:
          bpFilt[:,:,0,flt] = np.exp((-(np.log(w/w0))**2) / (2 * np.log(sigmaOnf)**2)); 

        bpFilt[0, 0, 0, flt] = 0
        if ysize%2 == 0:
            bpFilt[int(ysize/2), :, 0, flt] = 0
        if xsize%2 == 0:
            bpFilt[:, int(xsize/2), 0, flt] = 0

    sumFilt = np.sum(bpFilt, -1)
    filtStruct = namedtuple('filtStruct', 'bpFilt numFilt ReiszFilt diffFilt wavelength sigmaOnf ratio')
    res = filtStruct(bpFilt/np.max(sumFilt), numFilt, -xGrid/w +  yGrid*1j/w, -2*math.pi*xGrid + math.pi*yGrid*2j, wavelengths, sigmaOnf, ratio)
    return res

def monogenicSignal(im, filtStruct):
    h, w = filtStruct.bpFilt.shape[:2]
    F = np.fft.fft2(im.T).T
    F = np.expand_dims(np.expand_dims(F, -1), -1)
    Ffilt = F * filtStruct.bpFilt

    Fm1 = np.real(np.fft.ifft2(Ffilt.T).T)
    Fmodd = np.fft.ifft2((Ffilt * np.expand_dims(np.expand_dims(filtStruct.ReiszFilt, -1), -1)).T).T
    Fm2 = np.real(Fmodd)
    Fm3 = np.imag(Fmodd)
    return Fm1, Fm2, Fm3

def preprocess(data):
    hist, _ = np.histogram(data.ravel(), bins=range(int(data.max()) + 1), density=True)
    cdf = np.cumsum(hist)
    idx = (np.abs(cdf - 0.995)).argmin()
    data[data > idx] = idx
    data = ((data - data.min()) / (data.max() - data.min()) * 255.0).round()
    return data

def normalize(img):
    img = (img - img.min())/(img.max() - img.min())
    return img

def getAmplitude(I_arr, cw = [10], typ='dop', param = 0.55):
    I_arr = np.clip(I_arr, 0, 255)

    Y, X = I_arr.shape[:2]
    filtStruct = createMonogenicFilters(Y, X, cw, typ, param)

    m1, m2, m3 = monogenicSignal(I_arr, filtStruct)

    even = np.abs(m1)
    amplitude = np.sqrt(even[:, :, :, 0]**2 + m2[:, :, :, 0]**2 + m3[:, :, :, 0]**2)
    return amplitude

def get_final_amplitude(size=96, cw=[10], typ='dop', param = 0.55):
    tensor = np.load(NPY_SLICE_PATH)

    tensor = preprocess(tensor)

    ed_img = tensor[:,:,ED_FRAME_INDEX]
    ed_img = cv2.medianBlur(ed_img, 3)

    es_img = tensor[:,:,ES_FRAME_INDEX]
    es_img = cv2.medianBlur(es_img, 3)

    amplitude1 = getAmplitude(ed_img, cw, typ, param)
    amplitude2 = getAmplitude(es_img, cw, typ, param)
    amplitude3 = amplitude1 - amplitude2

    amplitude1_path = os.path.abspath('{}/amplitude1_{}_{}_{}_{}.png'.format(TEMP_FOLDER_PATH_CURRENT_SAMPLE, SAMPLE_NAME, SLICE_NUMBER, ED_FRAME_INDEX, ES_FRAME_INDEX))
    if os.path.exists(amplitude1_path):
        os.remove(amplitude1_path)
    amplitude2_path = os.path.abspath('{}/amplitude2_{}_{}_{}_{}.png'.format(TEMP_FOLDER_PATH_CURRENT_SAMPLE, SAMPLE_NAME, SLICE_NUMBER, ED_FRAME_INDEX, ES_FRAME_INDEX))
    if os.path.exists(amplitude2_path):
        os.remove(amplitude2_path)
    amplitude3_path = os.path.abspath('{}/amplitude3_{}_{}_{}_{}.png'.format(TEMP_FOLDER_PATH_CURRENT_SAMPLE, SAMPLE_NAME, SLICE_NUMBER, ED_FRAME_INDEX, ES_FRAME_INDEX))
    if os.path.exists(amplitude3_path):
        os.remove(amplitude3_path)

    plt.clf()
    plt.imshow(amplitude1[:, :, 0], cmap='jet')
    plt.colorbar()
    plt.savefig(amplitude1_path)

    plt.clf()
    plt.imshow(amplitude2[:, :, 0], cmap='jet')
    plt.savefig(amplitude2_path)

    plt.clf()
    plt.imshow(amplitude3[:, :, 0], cmap='jet')
    plt.savefig(amplitude3_path)

    return [amplitude1_path, amplitude2_path, amplitude3_path]

print(get_final_amplitude(cw=[20], typ='dop', param=0.1))
