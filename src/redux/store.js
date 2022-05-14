import { configureStore } from "@reduxjs/toolkit";
import alertsSlice from "../components/Alerts/alertsSlice";
import progressBarSlice from "../components/ProgressBar/progressBarSlice";
import multiVideoDiagnosisSlice from "../pages/MultiVideoDiagnosis/multiVideoDiagnosisSlice";
import videoDiagnosisSlice from "../pages/VideoDiagnosis/videoDiagnosisSlice";
import npyDiagnosisSlice from "../pages/NPYDiagnosis/npyDiagnosisSlice";
import multiNpyDiagnosisSlice from "../pages/MultiNPYDiagnosis/multiNpyDiagnosisSlice";
import mainPageSlice from "../pages/MainPage/mainPageSlice";
import loginSlice from "../pages/Login/loginSlice";

const store = configureStore({
  reducer: {
    login: loginSlice.reducer,
    mainPage: mainPageSlice.reducer,
    alerts: alertsSlice.reducer,
    progressBar: progressBarSlice.reducer,
    videoDiagnosis: videoDiagnosisSlice.reducer,
    npyDiagnosis: npyDiagnosisSlice.reducer,
    multiVideoDiagnosis: multiVideoDiagnosisSlice.reducer,
    multiNpyDiagnosis: multiNpyDiagnosisSlice.reducer,
  },
});

export default store;
