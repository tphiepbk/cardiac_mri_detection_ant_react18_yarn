import React, { useState } from "react";
import "./App.css";
import hcmutLogo from "./images/hcmut.png";

import Dashboard from "./pages/Dashboard/Dashboard";
import VideoDiagnosis from "./pages/VideoDiagnosis/VideoDiagnosis";
import NPYDiagnosis from "./pages/NPYDiagnosis/NPYDiagnosis";
import MultiVideoDiagnosis from "./pages/MultiVideoDiagnosis/MultiVideoDiagnosis";
import MultiNPYDiagnosis from "./pages/MultiNPYDiagnosis/MultiNPYDiagnosis";
import TitleBar from "./components/TitleBar/TitleBar";

import { Layout, Menu, Avatar, Button, Space, Progress, Alert } from "antd";

import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  PoweroffOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer, Sider } = Layout;

export default function App() {
  // **************************************************** Used for all pages *********************************************************

  const [currentPage, setCurrentPage] = React.useState("4");

  const changePage = (pageKey) => {
    if (!pageKey.includes("sub")) setCurrentPage(pageKey);
  };

  const [progressBarState, setProgressBarState] = React.useState(90);

  const increaseProgressBar = () => {
    setProgressBarState((prevPercent) => {
      if (prevPercent + 1 > 100) {
        return prevPercent;
      } else {
        return prevPercent + 1;
      }
    });
  };

  const completeProgressBar = () => {
    setProgressBarState(100);
  };

  const clearProgressBar = () => {
    setProgressBarState(0);
  };

  const [alertVisible, setAlertVisible] = useState({
    success: false,
    warning: false,
    error: false,
  });

  const toggleErrorWarning = () => {
    setAlertVisible((prevState) => ({
      ...prevState,
      error: true,
    }));
  };

  const toggleSuccessNotification = () => {
    setAlertVisible((prevState) => ({
      ...prevState,
      success: true,
    }));
  };

  const toggleProcessRunningNotification = () => {
    setAlertVisible((prevState) => ({
      ...prevState,
      warning: true,
    }));
  };

  const closeSuccessAlert = () => {
    setAlertVisible((prevState) => ({
      ...prevState,
      success: false,
    }));
  };
  const closeWarningAlert = () => {
    setAlertVisible((prevState) => ({
      ...prevState,
      warning: false,
    }));
  };
  const closeErrorAlert = () => {
    setAlertVisible((prevState) => ({
      ...prevState,
      error: false,
    }));
  };

  const [interactive, setInteractive] = React.useState(true);

  const [processRunning, setProcessRunning] = React.useState(false);

  // **************************************************** Video Diagnosis Page *******************************************************

  const [videoPath, setVideoPath] = React.useState({
    avi: "",
    mp4: "",
  });
  const [videoMetadata, setVideoMetadata] = React.useState({
    name: "",
    format: "",
    duration: 0,
    height: 0,
    width: 0,
  });

  const [diagnosisResult, setDiagnosisResult] = React.useState(0);

  const [disabledButton, setDisabledButton] = React.useState(false);

  const [listSlices, setListSlices] = React.useState([]);

  // ************************************************* Multi Video Diagnosis Page ****************************************************

  const [listInputVideo, setListInputVideo] = React.useState([]);
  const [listPredictionResult, setListPredictionResult] = React.useState([]);
  const [multiDiagnosis_listSlices, setMultiDiagnosis_listSlices] =
    React.useState([]);

  // ********************************************************** Render Page **********************************************************

  let renderedPage;
  switch (currentPage) {
    case "1":
      renderedPage = <Dashboard />;
      break;
    case "2":
      renderedPage = (
        <VideoDiagnosis
          videoPath={videoPath}
          setVideoPath={setVideoPath}
          videoMetadata={videoMetadata}
          setVideoMetadata={setVideoMetadata}
          setInteractive={setInteractive}
          diagnosisResult={diagnosisResult}
          setDiagnosisResult={setDiagnosisResult}
          processRunning={processRunning}
          setProcessRunning={setProcessRunning}
          increaseProgressBar={increaseProgressBar}
          clearProgressBar={clearProgressBar}
          completeProgressBar={completeProgressBar}
          disabledButton={disabledButton}
          setDisabledButton={setDisabledButton}
          listSlices={listSlices}
          setListSlices={setListSlices}
          toggleErrorWarning={toggleErrorWarning}
          toggleSuccessNotification={toggleSuccessNotification}
          toggleProcessRunningNotification={toggleProcessRunningNotification}
        />
      );
      break;
    case "3":
      renderedPage = <NPYDiagnosis />;
      break;
    case "4":
      renderedPage = (
        <MultiVideoDiagnosis
          videoPath={videoPath}
          setVideoPath={setVideoPath}
          videoMetadata={videoMetadata}
          setVideoMetadata={setVideoMetadata}
          listInputVideo={listInputVideo}
          setListInputVideo={setListInputVideo}
          listPredictionResult={listPredictionResult}
          setListPredictionResult={setListPredictionResult}
          setInteractive={setInteractive}
          diagnosisResult={diagnosisResult}
          setDiagnosisResult={setDiagnosisResult}
          processRunning={processRunning}
          setProcessRunning={setProcessRunning}
          increaseProgressBar={increaseProgressBar}
          clearProgressBar={clearProgressBar}
          completeProgressBar={completeProgressBar}
          disabledButton={disabledButton}
          setDisabledButton={setDisabledButton}
          multiDiagnosis_listSlices={multiDiagnosis_listSlices}
          setMultiDiagnosis_listSlices={setMultiDiagnosis_listSlices}
          toggleErrorWarning={toggleErrorWarning}
          toggleSuccessNotification={toggleSuccessNotification}
          toggleProcessRunningNotification={toggleProcessRunningNotification}
        />
      );
      break;
    case "5":
      renderedPage = <MultiNPYDiagnosis />;
      break;
    default:
      renderedPage = null;
  }

  return (
    <div
      className={"app-with-title-bar" + (interactive ? "" : " non-interactive")}
    >
      <TitleBar />
      <div className="app-container">
        <div className="alerts-container">
          {alertVisible.success && (
            <Alert
              style={{ marginBottom: "15px" }}
              message="Success"
              description="Task ran successfully."
              type="success"
              showIcon
              closable
              banner
              afterClose={closeSuccessAlert}
            />
          )}
          {alertVisible.error && (
            <Alert
              style={{ marginBottom: "15px" }}
              message="Something went wrong"
              description="Please try again later."
              type="error"
              showIcon
              closable
              banner
              afterClose={closeErrorAlert}
            />
          )}
          {alertVisible.warning && (
            <Alert
              style={{ marginBottom: "15px" }}
              message="A task is running"
              description="Please try again later"
              type="warning"
              showIcon
              closable
              banner
              afterClose={closeWarningAlert}
            />
          )}
        </div>

        <Layout style={{ minHeight: "96.9vh" }}>
          <Sider>
            <div className="sidebar__logo-container">
              <img
                src={hcmutLogo}
                alt="React logo"
                className="sidebar__logo-container__logo"
              />
            </div>

            <Menu
              theme="dark"
              defaultSelectedKeys={["4"]}
              mode="inline"
              onSelect={(key) => changePage(key.key)}
            >
              <Menu.Item key="1" icon={<PieChartOutlined />}>
                Dashboard
              </Menu.Item>
              <Menu.SubMenu
                key="sub1"
                icon={<DesktopOutlined />}
                title="Diagnosis"
              >
                <Menu.Item key="2">Video File</Menu.Item>
                <Menu.Item key="3">NPY Files</Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu
                key="sub2"
                icon={<FileOutlined />}
                title="Multi-Diagnosis"
              >
                <Menu.Item key="4">Video Files</Menu.Item>
                <Menu.Item key="5">NPY Files</Menu.Item>
              </Menu.SubMenu>
            </Menu>
          </Sider>

          <Layout className="site-layout">
            <Header className="header">
              <Progress
                className="progress-bar"
                strokeColor={{
                  from: "#108ee9",
                  to: "#87d068",
                }}
                percent={progressBarState}
              />
              {/*
              <Space size={15}>
                <Progress
                  className="progress-bar"
                  strokeColor={{
                    from: "#108ee9",
                    to: "#87d068",
                  }}
                  percent={progressBarState}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CloseOutlined />}
                  size={10}
                  danger
                />
              </Space>
                 */}

              <Space size={15}>
                <Avatar src="https://joeschmoe.io/api/v1/random" />
                <h3>Thai Phuc Hiep</h3>
                <Button
                  type="primary"
                  icon={<PoweroffOutlined />}
                  shape="round"
                  danger
                >
                  Logout
                </Button>
              </Space>
            </Header>

            <Content style={{ margin: "0 16px" }}>
              <div className="site-layout-background main-content">
                {renderedPage}
              </div>
            </Content>

            <Footer className="footer">
              Ho Chi Minh City University of Technology © 2022 Created by
              tphiepbk
            </Footer>
          </Layout>
        </Layout>
      </div>
    </div>
  );
}
