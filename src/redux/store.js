import { configureStore } from "@reduxjs/toolkit";
import alertsSlice from "../components/Alerts/alertsSlice";
import progressBarSlice from "../components/ProgressBar/progressBarSlice";

const store = configureStore({
  reducer: {
    alerts: alertsSlice.reducer,
    progressBar: progressBarSlice.reducer,
  },
});

export default store;
