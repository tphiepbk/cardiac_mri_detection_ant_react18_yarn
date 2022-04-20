import { createSelector } from "@reduxjs/toolkit";

export const listInputVideoSelector = createSelector(
  (state) => state.multiVideoDiagnosis.listInputVideo,
  (listInputVideo) => listInputVideo
);

export const listPredictionResultSelector = createSelector(
  (state) => state.multiVideoDiagnosis.listPredictionResult,
  (listPredictionResult) => listPredictionResult
);

export const multiVideoListSlicesSelector = createSelector(
  (state) => state.multiVideoDiagnosis.multiVideoListSlices,
  (multiVideoListSlices) => multiVideoListSlices
);

export const disabledButtonSelector = createSelector(
  (state) => state.multiVideoDiagnosis.disabledButton,
  (disabledButton) => disabledButton
);
