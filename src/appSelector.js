import { createSelector } from "@reduxjs/toolkit";

export const appInteractiveSelector = createSelector(
  (state) => state.app.interactive,
  (appInteractive) => appInteractive
);

export const appProcessRunningSelector = createSelector(
  (state) => state.app.processRunning,
  (appProcessRunning) => appProcessRunning
);

export const appCurrentSelectedPageSelector = createSelector(
  (state) => state.app.currentSelectedPage,
  (appCurrentSelectedPage) => appCurrentSelectedPage
);