import numpy as np
import os
import torch
import torch.nn as nn
import torch.utils.data as data
import torchvision.transforms as transforms
import matplotlib.pyplot as plt
import cv2
from model.utils import DataLoader
from model.final_future_prediction_with_memory_spatial_sumonly_weight_ranking_top1 import *
from model.Reconstruction import *
from utils import *
import glob
import shutil

import argparse

parser = argparse.ArgumentParser(description="MNAD")
parser.add_argument('--gpus', nargs='+', type=str, help='gpus')
parser.add_argument('--batch_size', type=int, default=4, help='batch size for training')
parser.add_argument('--test_batch_size', type=int, default=1, help='batch size for test')
parser.add_argument('--h', type=int, default=256, help='height of input images')
parser.add_argument('--w', type=int, default=256, help='width of input images')
parser.add_argument('--c', type=int, default=3, help='channel of input images')
parser.add_argument('--method', type=str, default='pred', help='The target task for anoamly detection')
parser.add_argument('--t_length', type=int, default=5, help='length of the frame sequences')
parser.add_argument('--fdim', type=int, default=512, help='channel dimension of the features')
parser.add_argument('--mdim', type=int, default=512, help='channel dimension of the memory items')
parser.add_argument('--msize', type=int, default=10, help='number of the memory items')
parser.add_argument('--alpha', type=float, default=0.6, help='weight for the anomality score')
parser.add_argument('--th', type=float, default=0.01, help='threshold for test updating')
parser.add_argument('--num_workers', type=int, default=2, help='number of workers for the train loader')
parser.add_argument('--num_workers_test', type=int, default=1, help='number of workers for the test loader')
parser.add_argument('--dataset_type', type=str, default='ped2', help='type of dataset: ped2, avenue, shanghai')
parser.add_argument('--dataset_path', type=str, default='./dataset', help='directory of data')
parser.add_argument('--model_dir', type=str, help='directory of model')
parser.add_argument('--m_items_dir', type=str, help='directory of model')
parser.add_argument('--sample_path', type=str, help='directory of sample')
parser.add_argument('--save_dir', type=str, help='directory to save output')


args = parser.parse_args()

def get_frame_idx(i):
    if i < 10:
        return "0" + str(i)
    return str(i)

def create_circular_mask(h, w, center=None, radius=None):

    if center is None: # use the middle of the image
        center = (int(w/2), int(h/2))
    if radius is None: # use the smallest distance between the center and image walls
        radius = min(center[0], center[1], w-center[0], h-center[1])

    Y, X = np.ogrid[:h, :w]
    dist_from_center = np.sqrt((X - center[0])**2 + (Y-center[1])**2)

    mask = dist_from_center <= radius
    return mask

def save_color_image(image, save_name):
    import matplotlib.pyplot as plt
    import numpy as np
    ax = plt.subplot(111)
    plt.axis('off')
    # im = ax.imshow(image[:,:,0], vmin=0, vmax=1, cmap='jet')
    image = image/image.max()
    size = args.h
    left_crop = int(0.15 * size)
    right_crop = int(0.1 * size)

    nh, nw = size - 2*right_crop, size - right_crop - left_crop
    mask = create_circular_mask(nh, nw, radius = nw//2)
    mask = np.expand_dims(mask, -1)
    mask = np.concatenate([mask, mask, mask], -1)

    image = image[right_crop:size-right_crop, left_crop:size-right_crop, :]
    image[~mask] = 0
    # print("image[:,:,0] - image[:,:,1]", np.sum(image[:,:,0] - image[:,:,1]))
    im = ax.imshow(np.sum(image, -1), cmap='jet')
    plt.colorbar(im, ax=ax)
    plt.savefig(save_name)
    plt.clf()

def save_pred_image(path, image):
    ax = plt.subplot(111)
    plt.axis('off')
    im = ax.imshow(image, cmap='gray')
    # print("~~path: ", path)
    plt.savefig(path)
    plt.clf()

def create_video(save_name, img_folder):
    img_array = []
    for i, filename in enumerate(sorted(glob.glob(os.path.join(img_folder, '*.jpg')))):
        img = cv2.imread(filename)
        height, width, layers = img.shape
        size = (width,height)
        img_array.append(img)
    
    
    out = cv2.VideoWriter(save_name, cv2.VideoWriter_fourcc(*'DIVX'), 3, size)
    
    for i in range(len(img_array)):
        out.write(img_array[i])
    out.release()
    plt.clf()

def preprocess(tensor):
  data = tensor.astype(np.int16)
  hist, _ = np.histogram(data.ravel(), bins=range(int(data.max()) + 1), density=True)
  cdf = np.cumsum(hist)
  idx = (np.abs(cdf - 0.995)).argmin()
  data[data > idx] = idx
  data = ((data - data.min()) / (data.max() - data.min()) * 255.0).round()
  data = data.astype(np.float32)
  return data

os.environ["CUDA_DEVICE_ORDER"]="PCI_BUS_ID"
if args.gpus is None:
    gpus = "0"
    os.environ["CUDA_VISIBLE_DEVICES"]= gpus
else:
    gpus = ""
    for i in range(len(args.gpus)):
        gpus = gpus + args.gpus[i] + ","
    os.environ["CUDA_VISIBLE_DEVICES"]= gpus[:-1]

torch.backends.cudnn.enabled = True # make sure to use cudnn for computational performance

test_folder = args.dataset_path+"/"+args.dataset_type+"/testing/frames"

# Loading dataset
test_dataset = DataLoader(test_folder, transforms.Compose([
             transforms.ToTensor(),            
             ]), resize_height=args.h, resize_width=args.w, time_step=args.t_length-1)

test_size = len(test_dataset)

test_batch = data.DataLoader(test_dataset, batch_size = args.test_batch_size, 
                             shuffle=False, num_workers=args.num_workers_test, drop_last=False)

loss_func_mse = nn.MSELoss(reduction='none')

# Loading the trained model
model = torch.load(args.model_dir, map_location=torch.device('cpu'))
# model.cuda()
m_items = torch.load(args.m_items_dir, map_location=torch.device('cpu'))
m_items_test = m_items.clone()


labels_list = []
label_length = 0
psnr_list = {}
feature_distance_list = {}

# train_normal_samples = pd.read_csv('/content/train_df_normal.csv').path.tolist()
# train_abnormal_samples = pd.read_csv('/content/train_df_abnormal.csv').path.tolist()
# test_normal_samples = pd.read_csv('/content/test_df_normal.csv').path.tolist()
# test_abnormal_samples = pd.read_csv('/content/test_df_abnormal.csv').path.tolist()
# random.shuffle(train_abnormal_samples)
# random.shuffle(train_normal_samples)
# random.shuffle(test_abnormal_samples)
# random.shuffle(test_normal_samples)

# normal2try = random.sample(normal_paths, )

p = args.sample_path
for path in glob.glob(os.path.join(p, '*.npy')):
    slice = np.load(path)
    slice = preprocess(slice)
    slice = np.moveaxis(slice, -1, 0)
    slice = list(slice)
    # print("slice[0].shape: ", slice[0].shape)
    # slice = list(map(lambda im: cv2.medianBlur(im, 3), slice))
    slice = list(map(lambda im: cv2.resize(im, (args.h, args.w)), slice))
    # slice = list(map(lambda im: (im / 127.5) - 1.0, slice))
    # print("slice[0].shape: ", slice[0].shape)
    slice = list(map(lambda im: np.expand_dims(im, -1), slice))
    # print("slice[0].shape: ", slice[0].shape)
    slice = list(map(lambda im: np.concatenate([im, im, im], axis=-1), slice))
    mse_save_path = os.path.join(args.save_dir, path.split('/')[-1].replace('.npy', '_npy'))
    print("mse save path: ", mse_save_path)
    if not os.path.exists(mse_save_path):
      os.makedirs(mse_save_path)

    label_length = 0
    video_num = 0
    m_items_test = m_items.clone()

    model.eval()

    if os.path.exists(mse_save_path):
        shutil.rmtree(mse_save_path)

    for i in range(len(slice) - args.t_length):
        save_name = 'mse' + get_frame_idx(args.t_length + i) + '.jpg'
        if not os.path.exists(mse_save_path):
            print("create mse_save_path: ", mse_save_path)
            os.makedirs(mse_save_path)
        save_name = os.path.join(mse_save_path, save_name)
        cur = slice[i:i+args.t_length]
        cur = np.array(cur)
        # print(cur.shape)    # (7, 96, 96, 3)
        cur = torch.tensor(np.array(cur)).permute(0, 3, 1, 2).reshape(1, -1, args.h, args.w)
        '''.cuda()'''

        if args.method == 'pred':
            outputs, feas, updated_feas, m_items_test, softmax_score_query, softmax_score_memory, _, _, _, compactness_loss = model.forward(cur[:,0:3*(args.t_length-1)], m_items_test, False)
            mse_error = loss_func_mse((outputs[0]+1)/2, (cur[0,3*(args.t_length-1):]+1)/2)
            mse_imgs = torch.mean(mse_error).item()
            mse_feas = compactness_loss.item()
        save_color_image(mse_error.permute(1, 2, 0).cpu().detach().numpy(), save_name)