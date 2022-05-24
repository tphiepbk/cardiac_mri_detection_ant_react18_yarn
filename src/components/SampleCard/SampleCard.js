import React from "react";
import "./SampleCard.css";
import avatarLogo from "../../images/avatar.png"

import { Image, Button, Descriptions, Tag, Tooltip } from "antd";

import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

import { currentSelectedSampleSelector } from "../../pages/Dashboard/dashboardSelector";
import { useSelector } from "react-redux";

export default function SampleCard() {
  const currentSelectedSample = useSelector(currentSelectedSampleSelector);

  return (
    <div className="sample-card">
      <Image
        width={150}
        preview={false}
        src={avatarLogo}
      />

      <Descriptions
        bordered
        column={3}
        size={"small"}
      >
        <Descriptions.Item label="ID" span={3}>
          {currentSelectedSample.id}
        </Descriptions.Item>
        <Descriptions.Item label="Name">
          {currentSelectedSample.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Age">
          {currentSelectedSample.age}
        </Descriptions.Item>
        <Descriptions.Item label="Gender">
          {currentSelectedSample.gender}
        </Descriptions.Item>
        <Descriptions.Item label="Sample name" span={3}>
          {currentSelectedSample.sampleName.length > 100 ? (
            <Tooltip title={currentSelectedSample.sampleName}>
              <span>
                {currentSelectedSample.sampleName.substring(0, 100) + " ..."}
              </span>
            </Tooltip>
          ) : (
            currentSelectedSample.sampleName
          )}
        </Descriptions.Item>
      </Descriptions>

      <div className="sample-card__diagnosis-result">
        <div className="sample-card__diagnosis-result__result">
          <h3>Result</h3>
          <div>
            {currentSelectedSample.diagnosisResult.value === "normal" ? (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Normal
              </Tag>
            ) : (
              <Tag icon={<CloseCircleOutlined />} color="error">
                Abnormal
              </Tag>
            )}
          </div>
          <Button type="primary" shape="round">
            Change
          </Button>
        </div>

        <div className="sample-card__diagnosis-result__confirmed-by">
          <h3>Author</h3>
          <h2>{currentSelectedSample.diagnosisResult.author}</h2>
        </div>

        <div className="sample-card__diagnosis-result__confirmed-by">
          <h3>Date Modified</h3>
          <h2>{currentSelectedSample.diagnosisResult.dateModified}</h2>
        </div>
      </div>
    </div>
  );
}
