import React from "react";
import "./SaveSampleRecordModal.css";
import { usernameSelector } from "../../pages/Login/loginSelector";
import {
  Modal,
  Form,
  Input,
  Radio,
  InputNumber,
  DatePicker,
  Button,
} from "antd";

import moment from "moment";
import { useSelector } from "react-redux";

export default function SaveSampleRecordModal(props) {
  const username = useSelector(usernameSelector)
  console.log(username)

  const {
    saveSampleRecord,
    closeSaveSampleRecordModalHandler,
    sampleName,
    diagnosisResult,
    today,
  } = props;

  const onFinish = (values) => {
    closeSaveSampleRecordModalHandler();

    const record = {
      sampleName: sampleName,
      fullName: values.fullName,
      age: values.age,
      gender: values.gender,
      address: values.address,
      diagnosisResult: {
        value: values.diagnosisResultValue,
        author: username,
        dateModified: values.dateModified.toDate(),
      },
    };

    saveSampleRecord(record);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  console.log(`Diagnosis result = ${diagnosisResult}`);

  return (
    <Modal
      title="Save sample's record"
      visible={true}
      onCancel={closeSaveSampleRecordModalHandler}
      footer={null}
      className="save-sample-record-modal"
    >
      <Form
        labelCol={{
          span: 7,
        }}
        wrapperCol={{
          span: 20,
        }}
        layout="horizontal"
        initialValues={{
          gender: "male",
          diagnosisResultValue: diagnosisResult === 1 ? "normal" : "abnormal",
          dateModified: moment(today, "DD/MM/YYYY"),
          sampleName: sampleName,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Sample name"
          name="sampleName"
          rules={[{ required: true }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Full Name"
          name="fullName"
          required
          rules={[
            {
              required: true,
              message: "Please input full name !",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Gender" required name="gender">
          <Radio.Group>
            <Radio.Button value="male">Male</Radio.Button>
            <Radio.Button value="female">Female</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Age"
          name="age"
          required
          rules={[
            {
              required: true,
              message: "Please input age !",
            },
          ]}
        >
          <InputNumber />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          required
          rules={[
            {
              required: true,
              message: "Please input address !",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Date Modified"
          name="dateModified"
          required
          rules={[
            {
              required: true,
              message: "Please select date !",
            },
          ]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          label="Diagnosis Result"
          name="diagnosisResultValue"
          required
        >
          <Radio.Group>
            <Radio.Button value="normal">Normal</Radio.Button>
            <Radio.Button value="abnormal">Abnormal</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
