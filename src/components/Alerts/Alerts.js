import React from "react";
import "./Alerts.css";
import { Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";

import {
  taskSucceededAlertSelector,
  taskFailedAlertSelector,
  noVideoAlertSelector,
  taskRunningAlertSelector,
  uploadFailedAlertSelector,
  savePatientRecordSucceededAlertSelector,
  savePatientRecordFailedAlertSelector,
} from "./alertsSelector";
import alertsSlice from "./alertsSlice";

export default function Alerts() {
  const taskSucceededAlert = useSelector(taskSucceededAlertSelector);
  const taskFailedAlert = useSelector(taskFailedAlertSelector);
  const noVideoAlert = useSelector(noVideoAlertSelector);
  const taskRunningAlert = useSelector(taskRunningAlertSelector);
  const uploadFailedAlert = useSelector(uploadFailedAlertSelector);
  const savePatientRecordSucceededAlert = useSelector(savePatientRecordSucceededAlertSelector);
  const savePatientRecordFailedAlert = useSelector(savePatientRecordFailedAlertSelector);

  const dispatch = useDispatch();

  const closeTaskSucceededAlertHandler = () => {
    dispatch(alertsSlice.actions.closeTaskSucceededAlert());
  };

  const closeTaskFailedAlertHandler = () => {
    dispatch(alertsSlice.actions.closeTaskFailedAlert());
  };

  const closeNoVideoAlertHandler = () => {
    dispatch(alertsSlice.actions.closeNoVideoAlert());
  };

  const closeUploadFailedAlertHandler = () => {
    dispatch(alertsSlice.actions.closeUploadFailedAlert());
  };

  const closeTaskRunningAlertHandler = () => {
    dispatch(alertsSlice.actions.closeTaskRunningAlert());
  };

  const closeSavePatientRecordSucceededAlertHandler = () => {
    dispatch(alertsSlice.actions.closeSavePatientRecordSucceededAlert());
  };

  const closeSavePatientRecordFailedAlertHandler = () => {
    dispatch(alertsSlice.actions.closeSavePatientRecordFailedAlert());
  };

  return (
    <div className="alerts-container">
      {taskSucceededAlert && (
        <Alert
          style={{ marginBottom: "15px" }}
          message="Success"
          description="Task ran successfully."
          type="success"
          showIcon
          closable
          banner
          afterClose={closeTaskSucceededAlertHandler}
        />
      )}
      {taskFailedAlert && (
        <Alert
          style={{ marginBottom: "15px" }}
          message="Something went wrong"
          description="Please try again later."
          type="error"
          showIcon
          closable
          banner
          afterClose={closeTaskFailedAlertHandler}
        />
      )}
      {taskRunningAlert && (
        <Alert
          style={{ marginBottom: "15px" }}
          message="A task is running"
          description="Please try again later"
          type="warning"
          showIcon
          closable
          banner
          afterClose={closeTaskRunningAlertHandler}
        />
      )}
      {noVideoAlert && (
        <Alert
          style={{ marginBottom: "15px" }}
          message="No video uploaded"
          description="Please upload video first"
          type="error"
          showIcon
          closable
          banner
          afterClose={closeNoVideoAlertHandler}
        />
      )}
      {uploadFailedAlert && (
        <Alert
          style={{ marginBottom: "15px" }}
          message="Upload failed"
          description="Please try again"
          type="error"
          showIcon
          closable
          banner
          afterClose={closeUploadFailedAlertHandler}
        />
      )}
      {savePatientRecordSucceededAlert && (
        <Alert
          style={{ marginBottom: "15px" }}
          message="Success"
          description="Saved patient's record"
          type="success"
          showIcon
          closable
          banner
          afterClose={closeSavePatientRecordSucceededAlertHandler}
        />
      )}
      {savePatientRecordFailedAlert && (
        <Alert
          style={{ marginBottom: "15px" }}
          message="Cannot save patient's record"
          description="Please try again"
          type="error"
          showIcon
          closable
          banner
          afterClose={closeSavePatientRecordFailedAlertHandler}
        />
      )}
    </div>
  );
}
