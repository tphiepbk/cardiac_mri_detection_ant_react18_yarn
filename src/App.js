import React from "react";
import "./App.css";
import hcmutLogo from "./images/hcmut.png";
import { useSelector, useDispatch } from "react-redux";
import { progressBarSelector } from "./components/ProgressBar/progressBarSelector";
import {
  appInteractiveSelector,
  appCurrentSelectedPageSelector,
  appLoadingScreenSelector,
} from "./appSelector";

import Dashboard from "./pages/Dashboard/Dashboard";
import VideoDiagnosis from "./pages/VideoDiagnosis/VideoDiagnosis";
import NPYDiagnosis from "./pages/NPYDiagnosis/NPYDiagnosis";
import MultiVideoDiagnosis from "./pages/MultiVideoDiagnosis/MultiVideoDiagnosis";
import MultiNPYDiagnosis from "./pages/MultiNPYDiagnosis/MultiNPYDiagnosis";
import TitleBar from "./components/TitleBar/TitleBar";

import { Layout, Menu, Avatar, Button, Space, Spin } from "antd";

import ProgressBar from "./components/ProgressBar/ProgressBar";

import {
  LoadingOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  FundOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import Alerts from "./components/Alerts/Alerts";
import appSlice from "./appSlice";

const { Header, Content, Footer, Sider } = Layout;

export default function App() {
  const dispatch = useDispatch();
  const progressBarPercent = useSelector(progressBarSelector);

  const currentSelectedPage = useSelector(appCurrentSelectedPageSelector);
  const appInteractive = useSelector(appInteractiveSelector);
  const appLoadingScreen = useSelector(appLoadingScreenSelector);

  const changePage = (pageKey) => {
    if (!pageKey.includes("sub")) {
      dispatch(appSlice.actions.setCurrentSelectedPage(pageKey));
    }
  };

  let renderedPage;
  switch (currentSelectedPage) {
    case "1":
      renderedPage = <Dashboard />;
      break;
    case "2":
      renderedPage = <VideoDiagnosis />;
      break;
    case "3":
      renderedPage = <NPYDiagnosis />;
      break;
    case "4":
      renderedPage = <MultiVideoDiagnosis />;
      break;
    case "5":
      renderedPage = <MultiNPYDiagnosis />;
      break;
    default:
      renderedPage = null;
  }

  const loadingIcon = <LoadingOutlined style={{ fontSize: 100 }} spin />;

  return (
    <div
      className={
        "app-with-title-bar" + (appInteractive ? "" : " non-interactive")
      }
    >
      <TitleBar />
      <Spin tip={'Files are being processed. Please wait...'} size="large" spinning={appLoadingScreen} indicator={loadingIcon}>
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
                defaultSelectedKeys={[currentSelectedPage]}
                mode="inline"
                onSelect={(key) => changePage(key.key)}
              >
                <Menu.Item key="1" icon={<DashboardOutlined />}>
                  Dashboard
                </Menu.Item>
                <Menu.SubMenu
                  key="sub1"
                  icon={<FundOutlined />}
                  title="Diagnosis"
                >
                  <Menu.Item key="2">Video format</Menu.Item>
                  <Menu.Item key="3">NPY format</Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu
                  key="sub2"
                  icon={<UnorderedListOutlined />}
                  title="Multi-Diagnosis"
                >
                  <Menu.Item key="4">Video format</Menu.Item>
                  <Menu.Item key="5">NPY format</Menu.Item>
                </Menu.SubMenu>
              </Menu>
            </Sider>

            <Layout className="site-layout">
              <Header className="header">
                <ProgressBar percent={progressBarPercent} />
                {/*
                <Space size={15}>
                  <ProgressBar percent={progressBarPercent} />
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
      </Spin>
    </div>
  );
}
