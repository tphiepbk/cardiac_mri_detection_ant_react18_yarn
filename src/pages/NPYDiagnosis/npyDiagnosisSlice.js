import { createSlice } from "@reduxjs/toolkit";

const NO_DIAGNOSIS_RESULT = 0;

const initialState = {
  samplePath: "",
  concatenatedSamplePath: "",
  croppedNpyFolderPath: "",
  npyFileNames: [],
  videoPath: {
    mp4: "",
    avi: "",
  },
  videoBboxPath: {
    mp4: "",
    avi: "",
  },
  videoMetadata: {
    name: "",
    format: "",
    duration: 0,
    height: 0,
    width: 0,
  },
  diagnosisResult: NO_DIAGNOSIS_RESULT,
  disabledButton: false,
  listSlices: [],
};

const npyDiagnosisSlice = createSlice({
  name: "npyDiagnosis",
  initialState,
  reducers: {
    setCroppedNpyFolderPath: (state, action) => {
      state.croppedNpyFolderPath = action.payload;
    },
    setConcatenatedSamplePath: (state, action) => {
      state.concatenatedSamplePath = action.payload;
    },
    setSamplePath: (state, action) => {
      state.samplePath = action.payload;
    },
    setNpyFileNames: (state, action) => {
      state.npyFileNames = action.payload;
    },
    setVideoPath: (state, action) => {
      state.videoPath.avi = action.payload.avi;
      state.videoPath.mp4 = action.payload.mp4;
    },
    setVideoBboxPath: (state, action) => {
      state.videoBboxPath.avi = action.payload.avi;
      state.videoBboxPath.mp4 = action.payload.mp4;
    },
    setVideoMetadata: (state, action) => {
      state.videoMetadata.name = action.payload.name;
      state.videoMetadata.format = action.payload.format;
      state.videoMetadata.duration = action.payload.duration;
      state.videoMetadata.height = action.payload.height;
      state.videoMetadata.width = action.payload.width;
    },
    setDiagnosisResult: (state, action) => {
      state.diagnosisResult = action.payload;
    },
    enableButton: (state, _action) => {
      state.disabledButton = false;
    },
    disableButton: (state, _action) => {
      state.disabledButton = true;
    },
    setListSlices: (state, action) => {
      state.listSlices = action.payload;
    },
    clearContent: (state, _action) => {
      state.croppedNpyFolderPath = "";
      state.samplePath = "";
      state.npyFileNames = [];
      state.videoPath.avi = "";
      state.videoPath.mp4 = "";
      state.videoBboxPath.avi = "";
      state.videoBboxPath.mp4 = "";
      state.videoMetadata.name = "";
      state.videoMetadata.format = "";
      state.videoMetadata.duration = 0;
      state.videoMetadata.height = 0;
      state.videoMetadata.width = 0;
      state.diagnosisResult = NO_DIAGNOSIS_RESULT;
      state.listSlices = [];
    }
  },
});

export default npyDiagnosisSlice;
