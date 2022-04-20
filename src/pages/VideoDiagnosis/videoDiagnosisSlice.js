import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  videoPath: {
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
  diagnosisResult: 0,
  disabledButton: false,
  listSlices: [],
};

const videoDiagnosisSlice = createSlice({
  name: "videoDiagnosis",
  initialState,
  reducers: {
    setVideoPath: (state, action) => {
      state.videoPath.avi = action.payload.avi;
      state.videoPath.mp4 = action.payload.mp4;
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
    setDisabledButton: (state, action) => {
      state.disabledButton = action.payload;
    },
    setListSlices: (state, action) => {
      state.listSlices = action.payload;
    },
  },
});

export default videoDiagnosisSlice;
