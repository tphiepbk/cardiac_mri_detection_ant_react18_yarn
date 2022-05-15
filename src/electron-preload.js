const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI',{
  // * App control
  minimizeApp: () => ipcRenderer.send('app:control', "minimize"),
  closeApp: () => ipcRenderer.send('app:control', "close"),

  // * Open file dialog
  openFileDialog : () => ipcRenderer.invoke('open-file-dialog'),

  // * Get video's metadata
  getFileMetadata : (filepath) => ipcRenderer.invoke('get-video-metadata', filepath),

  // * Make single prediction
  makeSinglePrediction : (filepath) => ipcRenderer.invoke('make-single-prediction', filepath),

  // * Open multi files dialog
  openMultiFilesDialog: () => ipcRenderer.invoke('open-multi-files-dialog'),

  // * Open npy sample dialog
  openNpySampleDialog: () => ipcRenderer.invoke('open-npy-sample-dialog'),

  // * Open multi npy samples dialog
  openMultiNpySamplesDialog: () => ipcRenderer.invoke('open-multi-npy-samples-dialog'),

  // * Make multiple prediction
  makeMultiplePrediction : (sampleObjectList) => ipcRenderer.invoke('make-multiple-prediction', sampleObjectList),

  // * Save sample's record
  saveSampleRecord: (sampleObject) => ipcRenderer.invoke('save-sample-record', sampleObject),

  // * Get all sample's record
  getAllSampleRecords: () => ipcRenderer.invoke('get-all-sample-records'),

  // * Check credentials 
  checkCredentials : (username, password) => ipcRenderer.invoke('check-credentials', username, password),
})