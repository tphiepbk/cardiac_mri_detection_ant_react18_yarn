import React from "react";
import './Alerts.css'
import { Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";

import { alertSelector } from "../../redux/selector";
import alertsSlice from "./alertsSlice";

export default function Alerts() {

  const alerts = useSelector(alertSelector)

  const dispatch = useDispatch()

  const closeTaskSucceededAlertHandler = () => {
    dispatch(alertsSlice.actions.closeTaskSucceededAlert())
  }

  const closeTaskFailedAlertHandler = () => {
    dispatch(alertsSlice.actions.closeTaskFailedAlert())
  }

  const closeNoVideoAlertHandler = () => {
    dispatch(alertsSlice.actions.closeNoVideoAlert())
  }

  const closeCancelUploadVideoAlertHandler = () => {
    dispatch(alertsSlice.actions.closeCancelUploadVideoAlert())
  }

  const closeTaskRunningAlertHandler = () => {
    dispatch(alertsSlice.actions.closeTaskRunningAlert())
  }
  return (
    <div className="alerts-container">
      {alerts.taskSucceededAlert && (
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
      {alerts.taskFailedAlert && (
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
      {alerts.taskRunningAlert && (
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
      {alerts.noVideoAlert && (
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
      {alerts.canceledUploadVideoAlert && (
        <Alert
          style={{ marginBottom: "15px" }}
          message="Canceled Upload Video"
          description="Please try again"
          type="warning"
          showIcon
          closable
          banner
          afterClose={closeCancelUploadVideoAlertHandler}
        />
      )}
    </div>
  )
}