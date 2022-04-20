import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listInputVideo: [],
  listPredictionResult: [],
  multiVideoListSlices: [],
  disabledButton: false,
};

const multiVideoDiagnosisSlice = createSlice({
  name: "multiVideoDiagnosis",
  initialState,
  reducers: {
    setListInputVideo: (state, action) => {
      state.listInputVideo = action.payload;
    },
    setListPredictionResult: (state, action) => {
      state.listPredictionResult = action.payload;
    },
    setMultiVideoListSlices: (state, action) => {
      state.multiVideoListSlices = action.payload;
    },
    enableButton: (state, _action) => {
      state.disabledButton = false
    },
    disableButton: (state, _action) => {
      state.disabledButton = true
    },
  },
});

export default multiVideoDiagnosisSlice;
