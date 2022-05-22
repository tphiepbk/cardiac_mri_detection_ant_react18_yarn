import { createSelector } from "@reduxjs/toolkit";

export const listInputNpyObjectSelector = createSelector(
  (state) => state.multiNpyDiagnosis.listInputNpyObject,
  (listInputNpyObject) => listInputNpyObject
);

export const listPredictionResultSelector = createSelector(
  (state) => state.multiNpyDiagnosis.listPredictionResult,
  (listPredictionResult) => listPredictionResult
);

export const multiListSlicesSelector = createSelector(
  (state) => state.multiNpyDiagnosis.multiListSlices,
  (multiListSlices) => multiListSlices
);

export const disabledButtonSelector = createSelector(
  (state) => state.multiNpyDiagnosis.disabledButton,
  (disabledButton) => disabledButton
);
