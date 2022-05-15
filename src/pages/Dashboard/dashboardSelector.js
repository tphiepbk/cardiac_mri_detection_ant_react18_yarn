import { createSelector } from "@reduxjs/toolkit";

export const currentSelectedSampleSelector = createSelector(
  (state) => state.dashboard.currentSelectedSample,
  (currentSelectedSample) => currentSelectedSample
);

export const allSamplesSelector = createSelector(
  (state) => state.dashboard.allSamples,
  (allSamples) => allSamples
)

export const currentDataPageSelector = createSelector(
  (state) => state.dashboard.currentDataPage,
  (currentDataPage) => currentDataPage
)
