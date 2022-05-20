const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI',{
  // * App control
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  maximizeApp: () => ipcRenderer.send('maximize-app'),
  closeApp: () => ipcRenderer.send('close-app'),
  maximizedAppHandler: (callback) => ipcRenderer.on('maximized-app', callback),
  unmaximizedAppHandler: (callback) => ipcRenderer.on('unmaximized-app', callback),

  // * Upload one video
  uploadVideo : () => ipcRenderer.invoke('upload-video'),

  // * Upload multiple videos
  uploadMultipleVideos: () => ipcRenderer.invoke('upload-multiple-videos'),

  // * Upload NPY sample
  uploadNpySample: () => ipcRenderer.invoke('upload-npy-sample'),

  // * Upload multiple NPY samples
  uploadMultipleNpySamples: () => ipcRenderer.invoke('upload-multiple-npy-samples'),

  // * Make single prediction
  makeSinglePrediction : (filepath) => ipcRenderer.invoke('make-single-prediction', filepath),

  // * Make multiple prediction
  makeMultiplePrediction : (sampleObjectList) => ipcRenderer.invoke('make-multiple-prediction', sampleObjectList),

  // * Save sample's record
  saveSampleRecord: (sampleObject) => ipcRenderer.invoke('save-sample-record', sampleObject),

  // * Get all sample's record
  getAllSampleRecords: () => ipcRenderer.invoke('get-all-sample-records'),

  // * Check credentials 
  checkCredentials : (username, password) => ipcRenderer.invoke('check-credentials', username, password),
})