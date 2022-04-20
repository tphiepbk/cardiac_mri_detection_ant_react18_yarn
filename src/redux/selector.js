import { createSelector } from "@reduxjs/toolkit";

const taskSucceededAlertSelector = (state) => state.alerts.taskSucceeded;
const taskFailedAlertSelector = (state) => state.alerts.taskFailed;
const noVideoAlertSelector = (state) => state.alerts.noVideo;
const taskRunningAlertSelector = (state) => state.alerts.taskRunning;
const canceledUploadVideoAlertSelector = (state) =>
  state.alerts.canceledUploadVideo;

export const alertSelector = createSelector(
  taskSucceededAlertSelector,
  taskFailedAlertSelector,
  noVideoAlertSelector,
  canceledUploadVideoAlertSelector,
  taskRunningAlertSelector,
  (
    taskSucceededAlert,
    taskFailedAlert,
    noVideoAlert,
    canceledUploadVideoAlert,
    taskRunningAlert
  ) => {
    return {
      taskSucceededAlert,
      taskFailedAlert,
      noVideoAlert,
      canceledUploadVideoAlert,
      taskRunningAlert,
    };
  }
);

const progressBarPercentGetter = (state) => state.progressBar.percent;

export const progressBarPercentSelector = createSelector(progressBarPercentGetter, progressBarPercent => progressBarPercent);
