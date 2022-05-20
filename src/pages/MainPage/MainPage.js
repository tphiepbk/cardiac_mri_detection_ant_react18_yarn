import React from "react";
import "./MainPage.css";
import hcmutLogo from "../../images/hcmut.png";
import { useSelector, useDispatch } from "react-redux";
import { progressBarSelector } from "../../components/ProgressBar/progressBarSelector";
import {
  appInteractiveSelector,
  appCurrentSelectedPageSelector,
  appLoadingScreenSelector,
} from "./mainPageSelector";

import Dashboard from "../Dashboard/Dashboard";
import VideoDiagnosis from "../VideoDiagnosis/VideoDiagnosis";
import NPYDiagnosis from "../NPYDiagnosis/NPYDiagnosis";
import MultiVideoDiagnosis from "../MultiVideoDiagnosis/MultiVideoDiagnosis";
import MultiNPYDiagnosis from "../MultiNPYDiagnosis/MultiNPYDiagnosis";

import { Layout, Menu, Avatar, Button, Space, Spin } from "antd";

import ProgressBar from "../../components/ProgressBar/ProgressBar";

import {
  LoadingOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  FundOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import Alerts from "../../components/Alerts/Alerts";
import mainPageSlice from "./mainPageSlice";
import loginSlice from "../Login/loginSlice";
import dashboardSlice from "../Dashboard/dashboardSlice";
import videoDiagnosisSlice from "../VideoDiagnosis/videoDiagnosisSlice";
import npyDiagnosisSlice from "../NPYDiagnosis/npyDiagnosisSlice";
import multiVideoDiagnosisSlice from "../MultiVideoDiagnosis/multiVideoDiagnosisSlice";
import multiNpyDiagnosisSlice from "../MultiNPYDiagnosis/multiNpyDiagnosisSlice";
import { userFullNameSelector } from "../Login/loginSelector";

const { Header, Content, Footer, Sider } = Layout;

export default function MainPage() {
  const dispatch = useDispatch();
  const progressBarPercent = useSelector(progressBarSelector);

  const currentSelectedPage = useSelector(appCurrentSelectedPageSelector);
  const appInteractive = useSelector(appInteractiveSelector);
  const appLoadingScreen = useSelector(appLoadingScreenSelector);
  const userFullName = useSelector(userFullNameSelector);

  const changePage = (pageKey) => {
    if (!pageKey.includes("sub")) {
      dispatch(mainPageSlice.actions.setCurrentSelectedPage(pageKey));
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

  const logoutButtonClickHandler = () => {
    dispatch(dashboardSlice.actions.clearContent());
    dispatch(videoDiagnosisSlice.actions.clearContent());
    dispatch(multiVideoDiagnosisSlice.actions.clearContent());
    dispatch(npyDiagnosisSlice.actions.clearContent());
    dispatch(multiNpyDiagnosisSlice.actions.clearContent());
    dispatch(loginSlice.actions.logout());
  };

  const loadingIcon = <LoadingOutlined style={{ fontSize: 100 }} spin />;

  const getItem = (label, key, icon, children, type) => ({
    key,
    icon,
    children,
    label,
    type,
  });

  const menuItems = [
    getItem("Dashboard", "1", <DashboardOutlined />),
    getItem("Diagnosis", "sub1", <FundOutlined />, [
      getItem("Video format", "2"),
      getItem("NPY format", "3"),
    ]),
    getItem("Multi-Diagnosis", "sub2", <UnorderedListOutlined />, [
      getItem("Video format", "4"),
      getItem("NPY format", "5"),
    ]),
  ];

  return (
    <div
      className={`main-page ${
        appInteractive === true ? "" : "non-interactive"
      }`}
    >
      <Spin
        tip={"Files are being processed. Please wait..."}
        size="large"
        spinning={appLoadingScreen}
        indicator={loadingIcon}
      >
        <Layout style={{ height: "100%" }}>
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
              items={menuItems}
              onSelect={(key) => changePage(key.key)}
            />
          </Sider>

          <Layout className="site-layout">
            <Header className="header">
              <ProgressBar percent={progressBarPercent} />
              <Space size={15}>
                <Avatar src="https://joeschmoe.io/api/v1/random" />
                <h3>{userFullName}</h3>
                <Button
                  type="primary"
                  icon={<PoweroffOutlined />}
                  shape="round"
                  danger
                  onClick={logoutButtonClickHandler}
                >
                  Logout
                </Button>
              </Space>
            </Header>

            <Content style={{ margin: "0" }}>
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
      </Spin>
    </div>
  );
}
