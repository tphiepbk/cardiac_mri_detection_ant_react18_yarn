import React from "react";
import "./Login.css";

import { Input, Space, Form, Button, Checkbox } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";

export default function Login() {
  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="login-container">
      <h1 className="login-container__title">Authentication</h1>
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
            marginLeft: "5px"
          }}
          name="remember"
          valuePropName="checked"
        >
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

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
