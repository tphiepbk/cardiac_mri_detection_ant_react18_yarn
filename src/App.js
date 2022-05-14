import React from "react";
import "./App.css";

import Login from "./pages/Login/Login";
import MainPage from "./pages/MainPage/MainPage";
import TitleBar from "./components/TitleBar/TitleBar";
import { useSelector } from "react-redux";
import { loggedInSelector } from "./pages/Login/loginSelector";

export default function App() {
  const loggedIn = useSelector(loggedInSelector)

  return (
    <div className="app-with-title-bar">
      <TitleBar />
      {loggedIn ? <MainPage /> : 
        <div className="login-wrapper">
          <Login />
        </div>
      }
    </div>
  );
}
