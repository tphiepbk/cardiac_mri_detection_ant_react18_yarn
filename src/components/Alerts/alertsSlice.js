import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  taskSucceeded: false,
  taskFailed: false,
  noVideo: false,
  uploadFailed: false,
  taskRunning: false,
  saveSampleRecordSucceeded: false,
  saveSampleRecordFailed: false,
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    openTaskSucceededAlert: (state, _action) => {
      state.taskSucceeded = true;
    },
    openTaskFailedAlert: (state, _action) => {
      state.taskFailed = true;
    },
    openNoVideoAlert: (state, _action) => {
      state.noVideo = true;
    },
    openUploadFailedAlert: (state, _action) => {
      state.uploadFailed = true;
    },
    openTaskRunningAlert: (state, _action) => {
      state.taskRunning = true;
    },
    openSaveSampleRecordSucceededAlert: (state, _action) => {
      state.saveSampleRecordSucceeded = true;
    },
    openSaveSampleRecordFailedAlert: (state, _action) => {
      state.saveSampleRecordFailed = true;
    },
    closeTaskSucceededAlert: (state, _action) => {
      state.taskSucceeded = false;
    },
    closeTaskFailedAlert: (state, _action) => {
      state.taskSucceeded = false;
    },
    closeNoVideoAlert: (state, _action) => {
      state.noVideo = false;
    },
    closeUploadFailedAlert: (state, _action) => {
      state.uploadFailed = false;
    },
    closeTaskRunningAlert: (state, _action) => {
      state.taskRunning = false;
    },
    closeSaveSampleRecordSucceededAlert: (state, _action) => {
      state.saveSampleRecordSucceeded = false;
    },
    closeSaveSampleRecordFailedAlert: (state, _action) => {
      state.saveSampleRecordFailed = false;
    },
  },
});

export default alertsSlice;
