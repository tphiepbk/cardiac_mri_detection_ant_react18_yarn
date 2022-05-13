import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  interactive: true,
  processRunning: false,
  loadingScreen: false,
  currentSelectedPage: "1",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    enableAppInteractive: (state, _action) => {
      state.interactive = true;
    },
    disableAppInteractive: (state, _action) => {
      state.interactive = false;
    },
    enableLoadingScreen: (state, _action) => {
      state.loadingScreen = true;
    },
    disableLoadingScreen: (state, _action) => {
      state.loadingScreen = false;
    },
    setProcessRunning: (state, action) => {
      state.processRunning = action.payload;
    },
    setCurrentSelectedPage: (state, action) => {
      state.currentSelectedPage = action.payload;
    },
  },
});

export default appSlice;
