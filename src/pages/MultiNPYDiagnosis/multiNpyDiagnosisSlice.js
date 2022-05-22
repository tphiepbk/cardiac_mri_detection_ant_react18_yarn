import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listInputNpyObject: [],
  listPredictionResult: [],
  multiListSlices: [],
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
    setMultiListSlices: (state, action) => {
      state.multiListSlices = action.payload;
    },
    enableButton: (state, _action) => {
      state.disabledButton = false;
    },
    disableButton: (state, _action) => {
      state.disabledButton = true;
    },
    clearContent: (state, _action) => {
      state.listInputNpyObject = [];
      state.listPredictionResult = [];
      state.multiListSlices = [];
    },
  },
});

export default multiNpyDiagnosisSlice;
