import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentSelectedSample: {
    id: "N/A",
    sampleName: "N/A",
    fullName: "N/A",
    age: "N/A",
    gender: "N/A",
    address: "N/A",
    diagnosisResult: {
      value: "N/A",
      author: "N/A",
      dateOfDiagnosis: "N/A",
    },
  },
  allSamples: [],
  currentDataPage: 1,
  triggerLoadAllDataEffect: false,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    toggleLoadAllDataEffect: (state, _action) => {
      state.triggerLoadAllDataEffect = !state.triggerLoadAllDataEffect;
    },
    resetCurrentSelectedSample: (state, _action) => {
      state.currentSelectedSample.id = "N/A";
      state.currentSelectedSample.sampleName = "N/A";
      state.currentSelectedSample.fullName = "N/A";
      state.currentSelectedSample.age = "N/A";
      state.currentSelectedSample.gender = "N/A";
      state.currentSelectedSample.address = "N/A";
      state.currentSelectedSample.diagnosisResult.value = "N/A";
      state.currentSelectedSample.diagnosisResult.author = "N/A";
      state.currentSelectedSample.diagnosisResult.dateOfDiagnosis = "N/A";
    },
    setCurrentSelectedSample: (state, action) => {
      state.currentSelectedSample.id = action.payload.id;
      state.currentSelectedSample.sampleName = action.payload.sampleName;
      state.currentSelectedSample.fullName = action.payload.fullName;
      state.currentSelectedSample.age = action.payload.age;
      state.currentSelectedSample.gender = action.payload.gender;
      state.currentSelectedSample.address = action.payload.address;
      state.currentSelectedSample.diagnosisResult.value =
        action.payload.diagnosisResult_value;
      state.currentSelectedSample.diagnosisResult.author =
        action.payload.diagnosisResult_author;
      state.currentSelectedSample.diagnosisResult.dateOfDiagnosis =
        action.payload.diagnosisResult_dateOfDiagnosis;
    },
    setAllSamples: (state, action) => {
      state.allSamples = action.payload;
    },
    setCurrentDataPage: (state, action) => {
      state.currentDataPage = action.payload;
    },
    clearContent: (state, _action) => {
      state.currentSelectedSample.id = "N/A";
      state.currentSelectedSample.sampleName = "N/A";
      state.currentSelectedSample.fullName = "N/A";
      state.currentSelectedSample.age = "N/A";
      state.currentSelectedSample.gender = "N/A";
      state.currentSelectedSample.address = "N/A";
      state.currentSelectedSample.diagnosisResult.value = "N/A";
      state.currentSelectedSample.diagnosisResult.author = "N/A";
      state.currentSelectedSample.diagnosisResult.dateOfDiagnosis = "N/A";
      state.allSamples = [];
      state.currentDataPage = 1;
    },
  },
});

export default dashboardSlice;
