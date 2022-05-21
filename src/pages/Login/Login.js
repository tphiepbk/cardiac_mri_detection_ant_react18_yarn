import React from "react";
import "./Login.css";

import { Input, Form, Button, Checkbox } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import loginSlice from "./loginSlice";

export default function Login() {
  const dispatch = useDispatch();

  const NORMAL = 0;
  const SOMETHING_WENT_WRONG = 1;
  const INVALID_USERNAME_OR_PASSWORD = 2;

  const [authIndicator, setAuthIndicator] = React.useState(NORMAL);

  const onFinish = async (values) => {
    console.log("Success:", values);
    const response = await window.electronAPI.checkCredentials(
      values.username,
      values.password
    );
    console.log(response);
    if (response.result === "FAILED") {
      console.log("Something went wrong");
      setAuthIndicator(SOMETHING_WENT_WRONG);
    } else if (response.result === "NOT FOUND") {
      console.log("Invalid username or password");
      setAuthIndicator(INVALID_USERNAME_OR_PASSWORD);
    } else {
      console.log("Login successfully");
      setAuthIndicator(NORMAL);
      dispatch(
        loginSlice.actions.login({
          username: response.username,
          userFullName: response.fullName,
        })
      );
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="login-container">
      <h1 className="login-container__title">Login</h1>
      <Form
        className="login-container__form"
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          style={{
            fontWeight: "900",
            display: "flex",
            justifyContent: "center",
          }}
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input
            className="login-container__input-username"
            size="large"
            placeholder="Username"
            prefix={<UserOutlined />}
          />
        </Form.Item>

        <Form.Item
          style={{
            fontWeight: "900",
            display: "flex",
            justifyContent: "center",
          }}
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            className="login-container__input-password"
            size="large"
            placeholder="Password"
            prefix={<LockOutlined />}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          style={{
            fontWeight: "900",
            display: "flex",
            justifyContent: "center",
            marginLeft: "5px",
          }}
          name="remember"
          valuePropName="checked"
        >
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <h3 style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>
          {authIndicator === SOMETHING_WENT_WRONG
            ? "Something went wrong. Try again later"
            : authIndicator === INVALID_USERNAME_OR_PASSWORD
            ? "Invalid username or password"
            : ""}
        </h3>

        <Form.Item
          style={{
            fontWeight: "900",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            style={{
              width: "50%",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "large",
              padding: "5px",
              height: "auto",
            }}
          >
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
