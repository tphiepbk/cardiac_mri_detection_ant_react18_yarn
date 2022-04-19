import React from "react";
import ReactPlayer from "react-player";
import './MiniVideoModal.css'
import { Modal, Descriptions } from "antd";

export default function MiniVideoModal(props) {

  const { closeVideoModalHandler, videoIndex, videoName, videoPath, videoConvertedPath } = props

  /*
  (async (videoName, videoPath) => {
    const response = await window.electronAPI.getFileMetadata(videoPath)
    console.log(response)

    if (response.result === 'SUCCESS') {
      const {format_long_name, duration} = response.target.format
      const {height, width} = response.target.streams[0]

      setVideoMetadata({
        name: videoName,
        format: format_long_name,
        duration: duration,
        height: height,
        width: width
      })
    }
  })();
  */

  return (
    <Modal title={videoName} visible={true} onCancel={closeVideoModalHandler} footer={null} className='mini-video-modal'>
      <ReactPlayer
        className="mini-video-modal__video"
        url={videoConvertedPath}
        playing={true}
        controls={false}
        loop={true}
      />

      {/*
      <Descriptions 
        className="mini-video-modal__description"
        title="Description"
        bordered
        size="small"
        layout="vertical"
        column={4}
      >
        <Descriptions.Item label="Name" span={4}>{videoMetadata.name}</Descriptions.Item>
        <Descriptions.Item label="Format">{videoMetadata.format}</Descriptions.Item>
        <Descriptions.Item label="Duration">{`${videoMetadata.duration} s`}</Descriptions.Item>
        <Descriptions.Item label="Size">{`${videoMetadata.width} x ${videoMetadata.height}`}</Descriptions.Item>
      </Descriptions>
       */}
    </Modal>
  )
}