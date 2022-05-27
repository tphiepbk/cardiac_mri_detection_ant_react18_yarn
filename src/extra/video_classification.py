import sys
import os
import numpy as np
import cv2

from tensorflow import keras
from tensorflow.keras.models import *
from tensorflow.keras.layers import *
from tensorflow.keras.optimizers import *
from tensorflow.keras import backend as K

UNET_PRETRAINED_PATH = os.path.abspath(sys.argv[1])

CHECK_COL_NUM_PRETRAINED_PATH = os.path.abspath(sys.argv[2])

CLASSIFY_PRETRAINED_PATH = os.path.abspath(sys.argv[3])

TEMP_FOLDER_PATH = os.path.abspath(sys.argv[4])

VIDEO_PATH = os.path.abspath(sys.argv[5])

# ***************************************************** BUILD MODEL *****************************************************

NUM_FEATURES = 512
MAX_FRAMES = 30
MAX_SLICES = 12
IMG_SIZE = 160

def dice_coef(y_true, y_pred, num_classes=4):
    y_true = K.one_hot(K.cast(y_true, 'int32'), num_classes=num_classes)[...,1:]
    y_pred = y_pred[...,1:]
    intersect = K.sum(K.sum(y_true * y_pred, axis = 1), axis = 1)
    denom = K.sum(K.sum(y_true + y_pred, axis = 1), axis = 1)
    return K.mean((2. * intersect / (denom + K.epsilon())))

def dice_coef_loss(y_true, y_pred):
    return 1 - dice_coef(y_true, y_pred)

def crop_layer(pre_layer):
    a = 0 if pre_layer.shape[1] % 2 == 0 else 1
    b = 0 if pre_layer.shape[2] % 2 == 0 else 1
    if a == b == 0:
        return pre_layer
    return Cropping2D(cropping=((0, a), (0, b)), data_format = "channels_last")(pre_layer)

def padding_layer(pre_layer, base_layer):
    a = 0 if pre_layer.shape[1] == base_layer.shape[1] else 1
    b = 0 if pre_layer.shape[2] == base_layer.shape[2] else 1
    if a == b == 0:
        return pre_layer
    return ZeroPadding2D((a, b), data_format = "channels_last")(pre_layer)

def unet(pretrained_weights = None, input_size = (IMG_SIZE,IMG_SIZE,1)):
    inputs = Input(input_size, name='input')
    conv1 = Conv2D(32, 3, activation = 'relu', padding = 'same', name = 'conv1_0')(inputs)
    conv1 = Conv2D(32, 3, activation = 'relu', padding = 'same', name = 'conv1_1')(conv1)
    pool1 = MaxPooling2D(pool_size=(2, 2), name = 'pool1')(conv1)

    conv2 = Conv2D(64, 3, activation = 'relu', padding = 'same', name = 'conv2_0')(pool1)
    conv2 = Conv2D(64, 3, activation = 'relu', padding = 'same', name = 'conv2_1')(conv2)
    conv2 = crop_layer(conv2)
    pool2 = MaxPooling2D(pool_size=(2, 2), name = 'pool2')(conv2)

    conv3 = Conv2D(128, 3, activation = 'relu', padding = 'same', name = 'conv3_0')(pool2)
    conv3 = Conv2D(128, 3, activation = 'relu', padding = 'same', name = 'conv3_1')(conv3)
    conv3 = crop_layer(conv3)
    pool3 = MaxPooling2D(pool_size=(2, 2), name = 'pool3')(conv3)

    conv4 = Conv2D(256, 3, activation = 'relu', padding = 'same', name = 'conv4_0')(pool3)
    conv4 = Conv2D(256, 3, activation = 'relu', padding = 'same', name = 'conv4_1')(conv4)
    conv4 = crop_layer(conv4)
    drop4 = Dropout(0.5, name = 'drop4')(conv4)
    
    pool4 = MaxPooling2D(pool_size=(2, 2), name = 'pool4')(drop4)
    conv5 = Conv2D(512, 3, activation = 'relu', padding = 'same', name = 'conv5_0')(pool4)
    conv5 = Conv2D(512, 3, activation = 'relu', padding = 'same', name = 'conv5_1')(conv5)
    drop5 = Dropout(0.5, name = 'drop5')(conv5)
    
    up6 = Conv2DTranspose(256,2, strides=2, name = 'up6')(drop5)
    up6 = padding_layer(up6, drop4)
    concat6 = concatenate([drop4,up6], axis = 3, name = 'concat6')
    conv6 = Conv2D(256, 3, activation = 'relu', padding = 'same', name = 'conv6_0')(concat6)
    conv6 = Conv2D(256, 3, activation = 'relu', padding = 'same', name = 'conv6_1')(conv6)
    
    up7 = Conv2DTranspose(128,2, strides=2, name = 'up7')(conv6)
    up7 = padding_layer(up7, conv3)
    concat7 = concatenate([conv3,up7], axis = 3, name = 'concat7')
    conv7 = Conv2D(128, 3, activation = 'relu', padding = 'same', name = 'conv7_0')(concat7)
    conv7 = Conv2D(128, 3, activation = 'relu', padding = 'same', name = 'conv7_1')(conv7)

    up8 = Conv2DTranspose(64,2, strides=2, name = 'up8')(conv7)
    up8 = padding_layer(up8, conv2)
    concat8 = concatenate([conv2, up8], axis = 3, name = 'concat8')
    conv8 = Conv2D(64, 3, activation = 'relu', padding = 'same', name = 'conv8_0')(concat8)
    conv8 = Conv2D(64, 3, activation = 'relu', padding = 'same', name = 'conv8_1')(conv8)

    up9 = Conv2DTranspose(32,2, strides=2, name = 'up9')(conv8)
    up9 = padding_layer(up9, conv1)
    concat9 = concatenate([conv1,up9], axis = 3, name = 'concat9')
    conv9 = Conv2D(32, 3, activation = 'relu', padding = 'same', name = 'conv9_0')(concat9)
    conv9 = Conv2D(32, 3, activation = 'relu', padding = 'same', name = 'conv9_1')(conv9)

    conv10 = Conv2D(4, 1, activation = 'softmax', name = 'conv10')(conv9)

    model = Model(inputs = inputs, outputs = conv10, name = 'unet')

    model.compile(optimizer = Adam(learning_rate = 1e-4), loss = dice_coef_loss, metrics = ['accuracy', dice_coef])

    if(pretrained_weights):
        model.load_weights(pretrained_weights)

    return model

"""# Model"""

def build_feature_extractor():

    unet_model = unet(pretrained_weights=UNET_PRETRAINED_PATH)

    unet_encoder = Model(inputs = unet_model.inputs, outputs = unet_model.get_layer('conv5_1').output, name='unet_encoder')
    unet_encoder.trainable = False
    
    inputs = keras.Input((IMG_SIZE, IMG_SIZE, 1))
    x = unet_encoder(inputs)
    x = Conv2D(64, 1, activation='relu')(x)
    x = Flatten()(x)
    x = Dropout(0.5)(x)
    outputs = Dense(NUM_FEATURES, activation='relu')(x)

    return keras.Model(inputs, outputs, name="feature_extractor"), unet_encoder

feature_extractor, unet_encoder = build_feature_extractor()

frame_inputs = Input((MAX_FRAMES, IMG_SIZE, IMG_SIZE, 1))
masked_inputs = Masking(mask_value=0)(frame_inputs)

features = TimeDistributed(feature_extractor)(masked_inputs)

x = LSTM(128, dropout=0.5, return_sequences=True, return_state=False)(features)
x = LSTM(64, dropout=0.5, return_sequences=False, return_state=False)(x)

value = Reshape((1,64))(Dense(64, activation='tanh', name='value')(x))
score = Dense(1, name='score')(x)

video_processor = Model(frame_inputs, x, name='video_processor')

inputs = Input((MAX_SLICES, MAX_FRAMES, IMG_SIZE, IMG_SIZE, 1))
masked_inputs = Masking(mask_value=0)(inputs)

video_features = TimeDistributed(video_processor, name='video_processor')(masked_inputs)

values = TimeDistributed(Dense(64, activation='tanh'), name='value')(video_features)
scores = TimeDistributed(Dense(1), name='score')(video_features)
softmax_scores = keras.activations.softmax(scores, axis=-2)

x = Multiply()([values, softmax_scores])
x = Lambda(lambda v: K.sum(v, axis=1))(x)
x = Dropout(0.5)(x)
out = Dense(1, activation='sigmoid')(x)

final_model = Model(inputs, out, name='classify')

# ***************************************************** PREDICTION *****************************************************

model = keras.models.load_model(CHECK_COL_NUM_PRETRAINED_PATH)

final_model.load_weights(CLASSIFY_PRETRAINED_PATH)

VIDEO_NAME = os.path.splitext(os.path.basename(VIDEO_PATH))[0]

TEMP_FOLDER_PATH_FOR_CURRENT_VIDEO = TEMP_FOLDER_PATH + '/' + VIDEO_NAME + '/'

if not os.path.exists(TEMP_FOLDER_PATH_FOR_CURRENT_VIDEO):
    os.mkdir(TEMP_FOLDER_PATH_FOR_CURRENT_VIDEO)

input = np.zeros((12,30,160,160,1))

cap = cv2.VideoCapture(VIDEO_PATH)
ret, frame = cap.read()
frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
frame = cv2.resize(frame,(64,48))
frame = frame[None,...,None]
col_check = int(model.predict(frame)[0] < 0.5)

frame_num = 0
cap = cv2.VideoCapture(VIDEO_PATH)
while(cap.isOpened()):
    ret, frame = cap.read()
    if not ret:
        break
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    h = 160
    w = 128 if col_check else 160
    for i in range(3):
        for j in range(4 + col_check):
            slice_num = i*(4 + col_check)+j
            if slice_num >= 12:
                break
            x = j*w
            y = i*h

            cropped_frame = frame[y:y+h, x:x+w]

            if cropped_frame.sum() == 0:
                break

            frame_path = os.path.abspath("{}/slice_{}/{}.png".format(TEMP_FOLDER_PATH_FOR_CURRENT_VIDEO, slice_num, frame_num)) 
            frame_folder = os.path.abspath("{}/slice_{}/".format(TEMP_FOLDER_PATH_FOR_CURRENT_VIDEO, slice_num)) 

            if not os.path.exists(frame_folder):
                os.mkdir(frame_folder)

            cv2.imwrite(frame_path, cropped_frame)

            if col_check:
                cropped_frame = np.pad(cropped_frame, ((0,0),(16,16)), 'constant', constant_values=0)

            input[slice_num,frame_num] = cropped_frame[...,None]
    frame_num += 1
    if frame_num >= 30:
        break

input = input[None,...]

"""### Predict"""

res = final_model.predict(input)

print({"filepath": VIDEO_PATH, "predicted_value": res[0][0], "label": "normal" if res[0][0] < 0.5 else "abnormal"})