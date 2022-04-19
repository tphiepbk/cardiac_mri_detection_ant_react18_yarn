import React from "react";
import ReactPlayer from "react-player";
import { Modal } from "antd";
import './SliceCardModal.css'

export default function SliceCardModal(props) {
  const { closeModalHandler, sliceNumber, sliceImageUrl, sliceVideoPath } = props

  return (
    <Modal title={`Slice ${sliceNumber}`} visible={true} onCancel={closeModalHandler} footer={null} className='slice-card-modal'>
      <ReactPlayer
        className="slice-card-modal__video"
        url={sliceVideoPath}
        playing={true}
        controls={false}
        loop={true}
      />
    </Modal>
  )
}