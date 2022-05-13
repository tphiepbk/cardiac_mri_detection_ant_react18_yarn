import { createSelector } from "@reduxjs/toolkit";

export const appInteractiveSelector = createSelector(
  (state) => state.app.interactive,
  (appInteractive) => appInteractive
);

export const appProcessRunningSelector = createSelector(
  (state) => state.app.processRunning,
  (appProcessRunning) => appProcessRunning
);

export const appLoadingScreenSelector = createSelector(
  (state) => state.app.loadingScreen,
  (appLoadingScreen) => appLoadingScreen
);

export const appCurrentSelectedPageSelector = createSelector(
  (state) => state.app.currentSelectedPage,
  (appCurrentSelectedPage) => appCurrentSelectedPage
);
