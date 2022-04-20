import { createSelector } from "@reduxjs/toolkit";

export const videoPathSelector = createSelector(
  (state) => state.videoDiagnosis.videoPath,
  (videoPath) => videoPath
);

export const videoMetadataSelector = createSelector(
  (state) => state.videoDiagnosis.videoMetadata,
  (videoMetadata) => videoMetadata
);

export const diagnosisResultSelector = createSelector(
  (state) => state.videoDiagnosis.diagnosisResult,
  (diagnosisResult) => diagnosisResult
);

export const disabledButtonSelector = createSelector(
  (state) => state.videoDiagnosis.disabledButton,
  (disabledButton) => disabledButton
);

export const listSlicesSelector = createSelector(
  (state) => state.videoDiagnosis.listSlices,
  (listSlices) => listSlices
);
