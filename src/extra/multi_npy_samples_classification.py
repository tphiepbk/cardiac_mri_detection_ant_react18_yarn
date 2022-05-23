import numpy as np
import os
import sys
import cv2
import matplotlib.pyplot as plt

from tensorflow import keras
from tensorflow.keras.models import *
from tensorflow.keras.layers import *
from tensorflow.keras.optimizers import *
from tensorflow.keras.metrics import *
from tensorflow.keras.activations import *
from tensorflow.keras import backend as K

WEIGHT_PATH = os.path.abspath(sys.argv[1])

CONCATENATED_NPY_SAMPLE_PATHS = list(map(lambda folder_path: os.path.abspath(folder_path), sys.argv[2:]))

########################################################### * PREPROCESSING * ########################################################################

NUM_FEATURES = 512
MAX_FRAMES = 20
MAX_SLICES = 12
IMG_SIZE = 128

def preprocess_sample(sample):
    sample = sample[::-1]
    sample = sample[round(0.25*sample.shape[0]): round((1-0.13)*sample.shape[0])]
    sample = sample[:MAX_SLICES, :MAX_FRAMES]

    for i in range(sample.shape[0]):
        for j in range(sample.shape[1]):
            img = sample[i,j]
            img = img/(np.std(img)+K.epsilon())*50
            sample[i,j] = img
    sample = np.round(sample)
    sample = np.clip(sample,0,255)

    sl,fr,h,w = sample.shape
    sample = np.reshape(sample, (sl*fr, h, w))
    sample = np.moveaxis(sample, 0, -1)

    orig_size = min(h, w)
    if h!=w:
        x = h//2 - orig_size//2
        y = w//2 - orig_size//2
        sample = sample[x:x+orig_size, y:y+orig_size]
    
    sample = cv2.resize(sample, (IMG_SIZE, IMG_SIZE))
    sample = np.moveaxis(sample, -1, 0)
    sample = np.reshape(sample, (sl, fr, IMG_SIZE, IMG_SIZE, 1))

    pattern = np.zeros((MAX_SLICES, MAX_FRAMES, IMG_SIZE, IMG_SIZE, 1), dtype='float')
    pattern[MAX_SLICES-sl:, :fr] = sample
    sample = pattern
    return sample

########################################################### * BUILD MODEL * ########################################################################

def build_feature_extractor(effnet_model):
    inputs = Input((IMG_SIZE, IMG_SIZE, 3))
    x = effnet_model(inputs)
    return Model(inputs, x, name="feature_extractor")

def build_3d_feature_extractor(effnet_model):
    inputs = Input((MAX_SLICES, IMG_SIZE, IMG_SIZE, 3))
    x = TimeDistributed(build_feature_extractor(effnet_model), name='effnet_model')(inputs)
    return Model(inputs, x, name="feature_extractor")

def build_video_processor():
    inputs = Input((MAX_FRAMES, 4, 4, 1408))
    x = ConvLSTM2D(NUM_FEATURES*4, 1, dropout=0.5, padding='same', return_sequences=False)(inputs)
    x = BatchNormalization()(x)
    video_processor = Model(inputs, x, name='video_processor')
    return video_processor

def build_segment_decoder():
    inputs = Input((4, 4, NUM_FEATURES*2))
    x = Conv2DTranspose(3, 32, strides=32, activation='softmax', padding='same')(inputs)
    segment_decoder = Model(inputs, x, name='segment_decoder')
    return segment_decoder

def residual_block(input_x):
    input_shape = K.int_shape(input_x)

    input = Input(input_shape[1:])
    x = input
    for i in range(2):
        x = Conv3D(input_shape[-1], (3,1,1), padding='same')(x)
        x = BatchNormalization()(x)
        x = Activation(swish)(x)
    out = Add()([input, x])
    
    model = Model(input, out)
    return model(input_x)

def build_last_conv():
    inputs = Input((MAX_SLICES, 4, 4, NUM_FEATURES*4))
    x = Conv3D(NUM_FEATURES, 1, padding='same')(inputs)
    x = BatchNormalization()(x)
    
    x = residual_block(x)
    x = Conv3D(NUM_FEATURES, (3,1,1), strides=(2,1,1), padding='same')(x)
    x = BatchNormalization()(x)

    x = residual_block(x)
    x = Conv3D(NUM_FEATURES*2, (3,1,1), strides=(2,1,1), padding='same')(x)
    x = BatchNormalization()(x)
    
    x = residual_block(x)
    x = Conv3D(NUM_FEATURES*2, 1, padding='same')(x)
    x = BatchNormalization()(x)

    x = GlobalAveragePooling3D()(x)

    last_conv_pretrained = Model([inputs], [x], name='last_conv')
    return last_conv_pretrained

def build_final_model(weight_path=None):
    effnet_model = keras.applications.EfficientNetV2B2(
        input_shape = (IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights= None
    )
    effnet_model.trainable = True

    feature_extractor = build_3d_feature_extractor(effnet_model)
    video_processor = build_video_processor()
    last_conv_pretrained = build_last_conv()

    inputs = Input((MAX_SLICES, MAX_FRAMES, IMG_SIZE, IMG_SIZE, 1))
    distribution_input = Input(())

    x = Concatenate(axis=-1)([inputs,inputs,inputs])
    x = Permute((2,1,3,4,5))(x)
    x = TimeDistributed(feature_extractor, name='feature_extractor')(x)
    
    x = Permute((2,1,3,4,5))(x)
    x = TimeDistributed(video_processor, name='video_processor')(x)

    x = last_conv_pretrained(x)
    x = Dense(1, activation='sigmoid')(x)
    final_model = Model([inputs], x)

    for layer in final_model.layers[:-2]:
        layer.trainable = False
    
    if weight_path:
        final_model.load_weights(weight_path)

    return final_model

npy_samples = [np.load(npy_sample) for npy_sample in CONCATENATED_NPY_SAMPLE_PATHS]

processed_npy_samples = [preprocess_sample(npy_sample) for npy_sample in npy_samples]

processed_npy_samples = np.array(processed_npy_samples)

model = build_final_model(WEIGHT_PATH)

results = model.predict(processed_npy_samples)

print([result[0] for result in results])
