import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  taskSucceeded: false,
  taskFailed: false,
  noVideo: false,
  uploadFailed: false,
  taskRunning: false,
  savePatientRecordSucceeded: false,
  savePatientRecordFailed: false,
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
    openSavePatientRecordSucceededAlert: (state, _action) => {
      state.savePatientRecordSucceeded = true;
    },
    openSavePatientRecordFailedAlert: (state, _action) => {
      state.savePatientRecordFailed = true;
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
    closeSavePatientRecordSucceededAlert: (state, _action) => {
      state.savePatientRecordSucceeded = false;
    },
    closeSavePatientRecordFailedAlert: (state, _action) => {
      state.savePatientRecordFailed = false;
    },
  },
});

export default alertsSlice;
