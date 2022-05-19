import React from "react";
import ReactPlayer from "react-player";
import "./MiniNpySampleModal.css";
import { Modal, Descriptions, List, Tabs } from "antd";

export default function MiniNpySampleModal(props) {
  const {
    closeVideoModalHandler,
    sampleName,
    npyFileNames,
    videoMetadata: { format_long_name, duration, height, width },
    videoConvertedPath,
    videoBboxConvertedPath,
  } = props;

  const tabChangeHandler = (key) => {
    console.log("Changed to tab ", key);
  };

  return (
    <Modal
      title={sampleName}
      visible={true}
      onCancel={closeVideoModalHandler}
      footer={null}
      className="mini-npy-sample-modal"
    >
      <div className="mini-npy-sample-modal__list-npy-video-wrapper">
        <div className="mini-npy-sample-modal__npy-list--overflow">
          <List
            className="mini-npy-sample-modal__npy-list"
            size="small"
            dataSource={npyFileNames}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </div>

        <Tabs
          defaultActiveKey="1"
          type="card"
          size="small"
          onChange={tabChangeHandler}
          className="mini-npy-sample-modal__tabs-container"
        >
          <Tabs.TabPane tab="Original" key="1">
            <ReactPlayer
              className="mini-npy-sample-modal__video"
              url={videoConvertedPath}
              playing={true}
              controls={true}
              loop={true}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Cropped" key="2">
            <ReactPlayer
              className="mini-npy-sample-modal__video"
              url={videoBboxConvertedPath}
              playing={true}
              controls={true}
              loop={true}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>

      <Descriptions
        className="mini-npy-sample-modal__description"
        title="Description"
        bordered
        size="small"
        layout="vertical"
        column={4}
      >
        <Descriptions.Item label="Name" span={4}>
          {sampleName}
        </Descriptions.Item>
        <Descriptions.Item label="Format">
          {format_long_name}
        </Descriptions.Item>
        <Descriptions.Item label="Duration">{`${duration} s`}</Descriptions.Item>
        <Descriptions.Item label="Size">{`${width} x ${height}`}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
