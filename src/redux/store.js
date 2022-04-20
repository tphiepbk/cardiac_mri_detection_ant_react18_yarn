import { configureStore } from "@reduxjs/toolkit";
import appSlice from "../appSlice";
import alertsSlice from "../components/Alerts/alertsSlice";
import progressBarSlice from "../components/ProgressBar/progressBarSlice";
import multiVideoDiagnosisSlice from "../pages/MultiVideoDiagnosis/multiVideoDiagnosisSlice";
import videoDiagnosisSlice from "../pages/VideoDiagnosis/videoDiagnosisSlice";

const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    alerts: alertsSlice.reducer,
    progressBar: progressBarSlice.reducer,
    videoDiagnosis: videoDiagnosisSlice.reducer,
    multiVideoDiagnosis: multiVideoDiagnosisSlice.reducer,
  },
});

export default store;
