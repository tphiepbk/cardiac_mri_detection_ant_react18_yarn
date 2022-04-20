import { createSelector } from "@reduxjs/toolkit";

const taskSucceededAlertSelector = (state) => state.alerts.taskSucceeded;
const taskFailedAlertSelector = (state) => state.alerts.taskFailed;
const noVideoAlertSelector = (state) => state.alerts.noVideo;
const taskRunningAlertSelector = (state) => state.alerts.taskRunning;
const uploadFailedAlertSelector = (state) => state.alerts.uploadFailed;

export const alertSelector = createSelector(
  taskSucceededAlertSelector,
  taskFailedAlertSelector,
  noVideoAlertSelector,
  uploadFailedAlertSelector,
  taskRunningAlertSelector,
  (
    taskSucceededAlert,
    taskFailedAlert,
    noVideoAlert,
    uploadFailedAlert,
    taskRunningAlert
  ) => {
    return {
      taskSucceededAlert,
      taskFailedAlert,
      noVideoAlert,
      uploadFailedAlert,
      taskRunningAlert,
    };
  }
);

const progressBarPercentGetter = (state) => state.progressBar.percent;

export const progressBarPercentSelector = createSelector(
  progressBarPercentGetter,
  (progressBarPercent) => progressBarPercent
);
