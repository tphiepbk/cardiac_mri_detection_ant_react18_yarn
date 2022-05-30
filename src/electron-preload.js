const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // * App control
  minimizeApp: () => ipcRenderer.send("minimize-app"),
  maximizeApp: () => ipcRenderer.send("maximize-app"),
  closeApp: () => ipcRenderer.send("close-app"),
  maximizedAppHandler: (callback) => ipcRenderer.on("maximized-app", callback),
  unmaximizedAppHandler: (callback) =>
    ipcRenderer.on("unmaximized-app", callback),

  // * Upload one video
  uploadVideo: () => ipcRenderer.invoke("upload-video"),

  // * Upload multiple videos
  uploadMultipleVideos: () => ipcRenderer.invoke("upload-multiple-videos"),

  // * Upload NPY sample
  uploadNpySample: () => ipcRenderer.invoke("upload-npy-sample"),

  // * Upload multiple NPY samples
  uploadMultipleNpySamples: () =>
    ipcRenderer.invoke("upload-multiple-npy-samples"),

  // * Classification for video
  classifyVideo: (videoPath) =>
    ipcRenderer.invoke("classify-video", videoPath),

  // * Classification for multiple videos
  classifyMultipleVideos: (videoPaths) =>
    ipcRenderer.invoke("classify-multiple-videos", videoPaths),

  // * Classification for NPY sample
  classifyNpySample: (concatenatedNpySamplePath) =>
    ipcRenderer.invoke("classify-npy-sample", concatenatedNpySamplePath),

  // * Generate MNAD prediction result 
  generateMNADPrediction: (croppedNpyFolderPath) =>
    ipcRenderer.invoke("generate-mnad-prediction", croppedNpyFolderPath),

  // * Generate multiple MNAD prediction result 
  generateMultipleMNADPrediction: (croppedNpyFolderPaths) =>
    ipcRenderer.invoke("generate-multiple-mnad-prediction", croppedNpyFolderPaths),

  // * Generate MNAD video 
  generateMNADVideo: (sliceCroppedNpyPath) =>
    ipcRenderer.invoke("generate-mnad-video", sliceCroppedNpyPath),

  // * Classification for multi NPY samples
  classifyMultipleNpySamples: (concatenatedNpySamplePaths) =>
    ipcRenderer.invoke("classify-multiple-npy-samples", concatenatedNpySamplePaths),

  // * Predict abnormal position for slice
  predictAbnormalPositionForSlice: (data) =>
    ipcRenderer.invoke("predict-abnormal-position-for-slice", data),

  // * Save sample's record
  saveSampleRecord: (sampleObject) =>
    ipcRenderer.invoke("save-sample-record", sampleObject),

  // * Update sample's record
  updateSampleRecord: (sampleObject) =>
    ipcRenderer.invoke("update-sample-record", sampleObject),

  // * Get all sample's record
  getAllSampleRecords: () => ipcRenderer.invoke("get-all-sample-records"),

  // * Check credentials
  checkCredentials: (username, password) =>
    ipcRenderer.invoke("check-credentials", username, password),
});
