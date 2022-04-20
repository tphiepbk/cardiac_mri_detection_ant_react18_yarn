import { createSelector } from "@reduxjs/toolkit";

export const progressBarSelector = createSelector(
  (state) => state.progressBar.percent,
  (progressBarPercent) => progressBarPercent
);
