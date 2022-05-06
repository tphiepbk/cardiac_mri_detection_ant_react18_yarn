import { createSelector } from "@reduxjs/toolkit";

export const listInputNpyObjectSelector = createSelector(
  (state) => state.multiNpyDiagnosis.listInputNpyObject,
  (listInputNpyObject) => listInputNpyObject
);

export const listPredictionResultSelector = createSelector(
  (state) => state.multiNpyDiagnosis.listPredictionResult,
  (listPredictionResult) => listPredictionResult
);

export const multiVideoListSlicesSelector = createSelector(
  (state) => state.multiNpyDiagnosis.multiVideoListSlices,
  (multiVideoListSlices) => multiVideoListSlices
);

export const disabledButtonSelector = createSelector(
  (state) => state.multiNpyDiagnosis.disabledButton,
  (disabledButton) => disabledButton
);
