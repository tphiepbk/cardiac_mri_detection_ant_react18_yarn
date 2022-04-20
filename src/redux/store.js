import { configureStore } from "@reduxjs/toolkit";
import alertsSlice from "../components/Alerts/alertsSlice";
import progressBarSlice from "../components/ProgressBar/progressBarSlice";
import videoDiagnosisSlice from "../pages/VideoDiagnosis/videoDiagnosisSlice";

const store = configureStore({
  reducer: {
    alerts: alertsSlice.reducer,
    progressBar: progressBarSlice.reducer,
    videoDiagnosis: videoDiagnosisSlice.reducer,
  },
});

export default store;
