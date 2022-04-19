import React from "react"
import "./TitleBar.css"
import {
  MinusOutlined,
  CloseOutlined,
} from "@ant-design/icons"

export default function TitleBar() {
  return (
    <div className="title-bar">
      <img className="title-bar__icon" src="./favicon.ico" alt="favicon logo"/>
      <p className="title-bar__title">Cardiac MRI Abnormalities Detection</p>
      <div className="title-bar__controls">
        <div 
          className="title-bar__controls__minimize"
          onClick={() => window.electronAPI.minimizeApp()}
        >
          <MinusOutlined/>
        </div>
        <div 
          className="title-bar__controls__close"
          onClick={() => window.electronAPI.closeApp()}
        >
          <CloseOutlined/>
        </div>
      </div>
    </div>
  )
}