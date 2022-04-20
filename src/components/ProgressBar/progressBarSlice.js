import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  percent: 0,
};

const progressBarSlice = createSlice({
  name: "progressBar",
  initialState,
  reducers: {
    increaseProgressBar: (state, _action) => {
      if (state.percent + 1 > 100) {
        state.percent = 100;
      } else {
        state.percent += 1;
      }
    },
    completeProgressBar: (state, _action) => {
      state.percent = 100
    },
    clearProgressBar: (state, _action) => {
      state.percent = 0
    },
  },
});

export default progressBarSlice;
