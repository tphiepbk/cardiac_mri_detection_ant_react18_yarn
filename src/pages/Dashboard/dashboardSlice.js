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
      dateModified: "N/A",
    },
  },
  allSamples: [],
  currentDataPage: 1,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setCurrentSelectedSample: (state, action) => {
      state.currentSelectedSample.id = action.payload.id;
      state.currentSelectedSample.sampleName = action.payload.sampleName;
      state.currentSelectedSample.name = action.payload.name;
      state.currentSelectedSample.age = action.payload.age;
      state.currentSelectedSample.gender = action.payload.gender;
      state.currentSelectedSample.address = action.payload.address;
      state.currentSelectedSample.diagnosisResult.value =
        action.payload.diagnosisResult_value;
      state.currentSelectedSample.diagnosisResult.author =
        action.payload.diagnosisResult_author;
      state.currentSelectedSample.diagnosisResult.dateModified =
        action.payload.diagnosisResult_dateModified;
    },
    setAllSamples: (state, action) => {
      state.allSamples = action.payload;
    },
    setCurrentDataPage: (state, action) => {
      state.currentDataPage = action.payload;
    },
  },
});

export default dashboardSlice;
