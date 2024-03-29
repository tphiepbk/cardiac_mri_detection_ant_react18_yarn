import { createSelector } from "@reduxjs/toolkit";

export const npyFileNamesSelector = createSelector(
  (state) => state.npyDiagnosis.npyFileNames,
  (npyFileNames) => npyFileNames
);

export const croppedNpyFolderPathSelector = createSelector(
  (state) => state.npyDiagnosis.croppedNpyFolderPath,
  (croppedNpyFolderPath) => croppedNpyFolderPath
);

export const concatenatedSamplePathSelector = createSelector(
  (state) => state.npyDiagnosis.concatenatedSamplePath,
  (concatenatedSamplePath) => concatenatedSamplePath
);

export const samplePathSelector = createSelector(
  (state) => state.npyDiagnosis.samplePath,
  (samplePath) => samplePath
);

export const videoPathSelector = createSelector(
  (state) => state.npyDiagnosis.videoPath,
  (videoPath) => videoPath
);

export const videoBboxPathSelector = createSelector(
  (state) => state.npyDiagnosis.videoBboxPath,
  (videoBboxPath) => videoBboxPath
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
