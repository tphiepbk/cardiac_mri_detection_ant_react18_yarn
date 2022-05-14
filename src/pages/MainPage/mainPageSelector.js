import { createSelector } from "@reduxjs/toolkit";

export const appInteractiveSelector = createSelector(
  (state) => state.mainPage.interactive,
  (appInteractive) => appInteractive
);

export const appProcessRunningSelector = createSelector(
  (state) => state.mainPage.processRunning,
  (appProcessRunning) => appProcessRunning
);

export const appLoadingScreenSelector = createSelector(
  (state) => state.mainPage.loadingScreen,
  (appLoadingScreen) => appLoadingScreen
);

export const appCurrentSelectedPageSelector = createSelector(
  (state) => state.mainPage.currentSelectedPage,
  (appCurrentSelectedPage) => appCurrentSelectedPage
);
