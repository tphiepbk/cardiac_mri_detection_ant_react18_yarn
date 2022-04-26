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

  // * Open folder dialog
  openMultiFilesDialog: () => ipcRenderer.invoke('open-multi-files-dialog'),

  // * Make multiple prediction
  makeMultiplePrediction : (videoObjectList) => ipcRenderer.invoke('make-multiple-prediction', videoObjectList),

  // * Save patient's record
  savePatientDiagnosisResult : (patientObject) => ipcRenderer.invoke('save-patient-record', patientObject),
})