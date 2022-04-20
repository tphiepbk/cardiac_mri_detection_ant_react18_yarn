import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  appInteractive: true
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
