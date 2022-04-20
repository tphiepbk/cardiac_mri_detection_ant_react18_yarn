import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  progressBar: 0,
  currentSelectedPage: 4,
  alertVisible: {
    taskSucceeded: false,
    taskFailed: false,
    noVideo: false,
    
  }
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    increaseProgressBar: (state, _action) => {
      if (state.progressBar + 1 > 100) {
        state.progressBar = 100;
      } else {
        state.progressBar += 1;
      }
    },
  },
});

export default appSlice
