import React from "react";
import ReactPlayer from "react-player";
import "./MiniVideoModal.css";
import { Modal, Descriptions } from "antd";

export default function MiniVideoModal(props) {
  const {
    closeVideoModalHandler,
    videoName,
    videoMetadata: { format_long_name, duration, height, width },
    videoOutputPath,
  } = props;

  return (
    <Modal
      title={videoName}
      visible={true}
      onCancel={closeVideoModalHandler}
      footer={null}
      className="mini-video-modal"
    >
      <ReactPlayer
        className="mini-video-modal__video"
        url={videoOutputPath}
        playing={true}
        controls={true}
        loop={true}
      />

      <Descriptions
        className="mini-video-modal__description"
        title="Description"
        bordered
        size="small"
        layout="vertical"
        column={4}
      >
        <Descriptions.Item label="Name" span={4}>
          {videoName}
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
