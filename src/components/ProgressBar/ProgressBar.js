import React from "react";
import { Progress } from "antd";
import "./ProgressBar.css";

export default function ProgressBar(props) {
  const { percent } = props;

  return (
    <Progress
      className="progress-bar"
      strokeColor={{
        from: "#108ee9",
        to: "#87d068",
      }}
      percent={percent}
    />
  );
}
