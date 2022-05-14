import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loggedIn: false,
  username: "",
  userFullName: ""
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    login: (state, action) => {
      state.loggedIn = true;
      state.username = action.payload.username
      state.userFullName = action.payload.userFullName
    },
    logout: (state, _action) => {
      state.loggedIn = false;
      state.username = ""
      state.userFullName = ""
    },
  },
});

export default loginSlice;
