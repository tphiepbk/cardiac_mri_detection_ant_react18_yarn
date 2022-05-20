import { createSelector } from "@reduxjs/toolkit";

export const loggedInSelector = createSelector(
  (state) => state.login.loggedIn,
  (loggedIn) => loggedIn
);

export const usernameSelector = createSelector(
  (state) => state.login.username,
  (username) => username,
);

export const userFullNameSelector = createSelector(
  (state) => state.login.userFullName,
  (userFullName) => userFullName,
);