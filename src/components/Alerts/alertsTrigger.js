import alertsSlice from "./alertsSlice";
import store from "../../redux/store"

const ALERT_TIMEOUT = 2000;

export const triggerTaskSucceededAlert = () => {
  store.dispatch(alertsSlice.actions.openTaskSucceededAlert());
  setTimeout(() => {
    store.dispatch(alertsSlice.actions.closeTaskSucceededAlert());
  }, ALERT_TIMEOUT);
};

export const triggerTaskFailedAlert = () => {
  store.dispatch(alertsSlice.actions.openTaskFailedAlert());
  setTimeout(() => {
    store.dispatch(alertsSlice.actions.closeTaskFailedAlert());
  }, ALERT_TIMEOUT);
};

export const triggerTaskRunningAlert = () => {
  store.dispatch(alertsSlice.actions.openTaskRunningAlert());
  setTimeout(() => {
    store.dispatch(alertsSlice.actions.closeTaskRunningAlert());
  }, ALERT_TIMEOUT);
};

export const triggerNoVideoAlert = () => {
  store.dispatch(alertsSlice.actions.openNoVideoAlert());
  setTimeout(() => {
    store.dispatch(alertsSlice.actions.closeNoVideoAlert());
  }, ALERT_TIMEOUT);
};

export const triggerUploadFailedAlert = () => {
  store.dispatch(alertsSlice.actions.openUploadFailedAlert());
  setTimeout(() => {
    store.dispatch(alertsSlice.actions.closeUploadFailedAlert());
  }, ALERT_TIMEOUT);
};

export const triggerSaveSampleRecordSucceededAlert = () => {
  store.dispatch(alertsSlice.actions.openSaveSampleRecordSucceededAlert());
  setTimeout(() => {
    store.dispatch(alertsSlice.actions.closeSaveSampleRecordSucceededAlert());
  }, ALERT_TIMEOUT);
};

export const triggerSaveSampleRecordFailedAlert = () => {
  store.dispatch(alertsSlice.actions.openSaveSampleRecordFailedAlert());
  setTimeout(() => {
    store.dispatch(alertsSlice.actions.closeSaveSampleRecordFailedAlert());
  }, ALERT_TIMEOUT);
};