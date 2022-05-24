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

  // * Classification for multi NPY samples
  classifyMultipleNpySamples: (concatenatedNpySamplePaths) =>
    ipcRenderer.invoke("classify-multiple-npy-samples", concatenatedNpySamplePaths),

  // * Predict abnormal position for slice
  predictAbnormalPositionForSlice: (data) =>
    ipcRenderer.invoke("predict-abnormal-position-for-slice", data),

  // * Save sample's record
  saveSampleRecord: (sampleObject) =>
    ipcRenderer.invoke("save-sample-record", sampleObject),

  // * Get all sample's record
  getAllSampleRecords: () => ipcRenderer.invoke("get-all-sample-records"),

  // * Check credentials
  checkCredentials: (username, password) =>
    ipcRenderer.invoke("check-credentials", username, password),
});
