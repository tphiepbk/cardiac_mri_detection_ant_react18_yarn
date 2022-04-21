import React from 'react'
import './VideoItem.css'
import { Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons';

export default function VideoItem(props) {
  const { selected, videoName, clickHandler, inspectClickHandler } = props
  return (
    <div className={`video-item ${selected && 'selected'}`} onClick={clickHandler}>
      <Button icon={<SearchOutlined />} onClick={inspectClickHandler} size='small' className='video-item__button'>Inspect</Button>
      <h4>{videoName}</h4>
    </div>
  )
}