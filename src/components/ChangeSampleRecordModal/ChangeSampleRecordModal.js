import React from "react";
import {
  Modal,
  Form,
  Input,
  Radio,
  InputNumber,
  Button,
} from "antd";
import { useDispatch } from "react-redux";
import dashboardSlice from "../../pages/Dashboard/dashboardSlice";

export default function ChangeSampleRecordModal(props) {
  const dispatch = useDispatch();

  const updateSampleRecord = async (sampleObject) => {
    const updateSampleRecordResponse = await window.electronAPI.updateSampleRecord(sampleObject);
    dispatch(dashboardSlice.actions.toggleLoadAllDataEffect());
    console.log(updateSampleRecordResponse);
  }

  const {closeChangeSampleRecordModalHandler, currentSelectedSample} = props

  const {id, sampleName, fullName, gender, age, diagnosisResult : {value, author}} = currentSelectedSample;

  console.log('currentSelectedSample', currentSelectedSample)
  const onFinish = (values) => {
    closeChangeSampleRecordModalHandler();

    const record = {
      id: id,
      sampleName: sampleName,
      fullName: values.fullName,
      age: values.age,
      gender: values.gender,
      diagnosisResult: {
        value: values.diagnosisResultValue,
        author: author,
      },
    };

    updateSampleRecord(record)
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Modal
      title="Change sample's record"
      visible={true}
      onCancel={closeChangeSampleRecordModalHandler}
      footer={null}
      className="change-sample-record-modal"
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
          diagnosisResultValue: value,
          author: author,
          sampleName: sampleName,
          fullName: fullName,
          gender: gender,
          age: age,
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

        {/*
        <Form.Item
          label="Date of diagnosis"
          name="dateOfDiagnosis"
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
         */}

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
