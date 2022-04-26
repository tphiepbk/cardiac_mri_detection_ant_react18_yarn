import React from "react";
import "./PatientCard.css";

import { Image, Button, Descriptions, Tag, Tooltip } from "antd";

import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

export default function PatientCard() {
  const addressText =
    "F4/27C, to 4, ap 6, xa Le Minh Xuan, huyen Binh Chanh, Thanh pho Ho Chi Minh, Viet Nam";

  return (
    <div className="patient-card">
      <Image
        width={150}
        preview={false}
        src={`https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?`}
        /*
        placeholder={
          <Image
            preview={false}
            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200"
            width={200}
          />
        }
        */
      />

      <Descriptions
        title="Patient's Information"
        bordered
        column={4}
        size={"default"}
      >
        <Descriptions.Item label="ID">1812227</Descriptions.Item>
        <Descriptions.Item label="Name">Thai Phuc Hiep</Descriptions.Item>
        <Descriptions.Item label="Age">20</Descriptions.Item>
        <Descriptions.Item label="Gender">Male</Descriptions.Item>
        <Descriptions.Item label="Address" className="address-cell">
          {addressText.length > 86 ? (
            <Tooltip title={addressText}>
              <span>{addressText.substring(0, 86) + " ..."}</span>
            </Tooltip>
          ) : (
            addressText
          )}
        </Descriptions.Item>
      </Descriptions>

      <div className="patient-card__diagnosis-result">
        <div className="patient-card__diagnosis-result__result">
          <h3>Result</h3>
          <div>
            <Tag icon={<CheckCircleOutlined />} color="success">
              Normal
            </Tag>
            {/*
            <Tag icon={<CloseCircleOutlined />} color="error">
              Abnormal
            </Tag>
            */}
          </div>
          <Button type="primary" shape="round">
            Change
          </Button>
        </div>

        <div className="patient-card__diagnosis-result__status">
          <h3>Status</h3>
          <div>
            {/*
            <Tag icon={<CheckCircleOutlined />} color="success">
              Confirmed
            </Tag>
            */}
            <Tag icon={<CloseCircleOutlined />} color="error">
              Not confirmed
            </Tag>
          </div>
        </div>

        <div className="patient-card__diagnosis-result__confirmed-by">
          <h3>Confirmed By</h3>
          <h2>Thai Phuc Hiep</h2>
        </div>

        <div className="patient-card__diagnosis-result__confirmed-by">
          <h3>Date Modified</h3>
          <h2>29/03/2022</h2>
        </div>
      </div>
    </div>
  );
}
