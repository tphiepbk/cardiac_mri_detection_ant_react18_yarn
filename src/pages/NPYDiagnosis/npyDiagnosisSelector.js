import { createSelector } from "@reduxjs/toolkit";

export const npyFileNamesSelector = createSelector(
  (state) => state.npyDiagnosis.npyFileNames,
  (npyFileNames) => npyFileNames
);

export const npyFilePathsSelector = createSelector(
  (state) => state.npyDiagnosis.npyFilePaths,
  (npyFilePaths) => npyFilePaths
);

export const videoPathSelector = createSelector(
  (state) => state.npyDiagnosis.videoPath,
  (videoPath) => videoPath
);

export const videoMetadataSelector = createSelector(
  (state) => state.npyDiagnosis.videoMetadata,
  (videoMetadata) => videoMetadata
);

export const diagnosisResultSelector = createSelector(
  (state) => state.npyDiagnosis.diagnosisResult,
  (diagnosisResult) => diagnosisResult
);

export const disabledButtonSelector = createSelector(
  (state) => state.npyDiagnosis.disabledButton,
  (disabledButton) => disabledButton
);

export const listSlicesSelector = createSelector(
  (state) => state.npyDiagnosis.listSlices,
  (listSlices) => listSlices
);
