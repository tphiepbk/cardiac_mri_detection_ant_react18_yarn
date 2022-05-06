import React from "react";
import "./SavePatientRecordModal.css";
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

export default function SavePatientRecordModal(props) {
  const {
    savePatientRecord,
    closeSavePatientRecordModalHandler,
    sampleName,
    diagnosisResult,
    today,
  } = props;

  const onFinish = (values) => {
    closeSavePatientRecordModalHandler();

    const record = {
      sampleName: sampleName,
      fullName: values.fullName,
      age: values.age,
      gender: values.gender,
      address: values.address,
      avatar:
        "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?",
      diagnosisResult: {
        value: values.diagnosisResultValue,
        confirmed: false,
        confirmedBy: "tphiepbk",
        dateModified: values.dateModified.toDate(),
      },
    };

    savePatientRecord(record);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  console.log(`Diagnosis result = ${diagnosisResult}`);

  return (
    <Modal
      title="Save patient's record"
      visible={true}
      onCancel={closeSavePatientRecordModalHandler}
      footer={null}
      className="save-patient-record-modal"
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
