import { createSelector } from "@reduxjs/toolkit";

export const taskSucceededAlertSelector = createSelector(
  (state) => state.alerts.taskSucceeded,
  (taskSucceededAlert) => taskSucceededAlert
);

export const taskFailedAlertSelector = createSelector(
  (state) => state.alerts.taskFailed,
  (taskFailedAlert) => taskFailedAlert
);

export const noVideoAlertSelector = createSelector(
  (state) => state.alerts.noVideo,
  (noVideoAlert) => noVideoAlert
);

export const uploadFailedAlertSelector = createSelector(
  (state) => state.alerts.uploadFailed,
  (uploadFailedAlert) => uploadFailedAlert
);

export const taskRunningAlertSelector = createSelector(
  (state) => state.alerts.taskRunning,
  (taskRunningAlert) => taskRunningAlert
);

export const saveSampleRecordSucceededAlertSelector = createSelector(
  (state) => state.alerts.saveSampleRecordSucceeded,
  (saveSampleRecordSucceededAlert) => saveSampleRecordSucceededAlert
);

export const saveSampleRecordFailedAlertSelector = createSelector(
  (state) => state.alerts.saveSampleRecordFailed,
  (saveSampleRecordFailedAlert) => saveSampleRecordFailedAlert
);