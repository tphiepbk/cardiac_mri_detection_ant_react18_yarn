import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listInputNpyObject: [],
  listPredictionResult: [],
  multiVideoListSlices: [],
  disabledButton: false,
};

const multiNpyDiagnosisSlice = createSlice({
  name: "multiNpyDiagnosis",
  initialState,
  reducers: {
    setListInputNpyObject: (state, action) => {
      state.listInputNpyObject = action.payload;
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

export default multiNpyDiagnosisSlice;
