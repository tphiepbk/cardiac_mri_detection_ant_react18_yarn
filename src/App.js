import React from "react";
import "./App.css";
import hcmutLogo from "./images/hcmut.png";
import { useSelector } from "react-redux";
import { progressBarPercentSelector } from "./redux/selector";

import Dashboard from "./pages/Dashboard/Dashboard";
import VideoDiagnosis from "./pages/VideoDiagnosis/VideoDiagnosis";
import NPYDiagnosis from "./pages/NPYDiagnosis/NPYDiagnosis";
import MultiVideoDiagnosis from "./pages/MultiVideoDiagnosis/MultiVideoDiagnosis";
import MultiNPYDiagnosis from "./pages/MultiNPYDiagnosis/MultiNPYDiagnosis";
import TitleBar from "./components/TitleBar/TitleBar";

import { Layout, Menu, Avatar, Button, Space } from "antd";

import ProgressBar from "./components/ProgressBar/ProgressBar";

import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import Alerts from "./components/Alerts/Alerts";

const { Header, Content, Footer, Sider } = Layout;

export default function App() {
  const progressBarPercent = useSelector(progressBarPercentSelector);
  // **************************************************** Used for all pages *********************************************************

  const [currentPage, setCurrentPage] = React.useState("4");

  const changePage = (pageKey) => {
    if (!pageKey.includes("sub")) setCurrentPage(pageKey);
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
          disabledButton={disabledButton}
          setDisabledButton={setDisabledButton}
          listSlices={listSlices}
          setListSlices={setListSlices}
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
          disabledButton={disabledButton}
          setDisabledButton={setDisabledButton}
          multiDiagnosis_listSlices={multiDiagnosis_listSlices}
          setMultiDiagnosis_listSlices={setMultiDiagnosis_listSlices}
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
        <Layout style={{ minHeight: "96.9vh" }}>
          <Alerts />
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
              <ProgressBar percent={progressBarPercent} />
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
