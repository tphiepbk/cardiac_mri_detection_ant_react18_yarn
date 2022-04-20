import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  taskSucceeded: false,
  taskFailed: false,
  noVideo: false,
  canceledUploadVideo: false,
  taskRunning: false,
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    openTaskSucceededAlert: (state, _action) => {
      state.taskSucceeded = true
    },
    openTaskFailedAlert: (state, _action) => {
      state.taskFailed = true
    },
    openNoVideoAlert: (state, _action) => {
      state.noVideo = true
    },
    openCanceledUploadVideoAlert: (state, _action) => {
      state.canceledUploadVideo = true
    },
    openTaskRunningAlert: (state, _action) => {
      state.taskRunning = true
    },
    closeTaskSucceededAlert: (state, _action) => {
      state.taskSucceeded = false
    },
    closeTaskFailedAlert: (state, _action) => {
      state.taskSucceeded = false
    },
    closeNoVideoAlert: (state, _action) => {
      state.noVideo = false
    },
    closeCancelUploadVideoAlert: (state, _action) => {
      state.canceledUploadVideo = false
    },
    closeTaskRunningAlert: (state, _action) => {
      state.taskRunning = false
    },
  }
});

export default alertsSlice;
