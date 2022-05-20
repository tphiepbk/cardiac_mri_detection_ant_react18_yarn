import { Card, Image } from "antd";
import React from "react";

export default function SliceCard(props) {
  const { sliceNumber, sliceImageUrl, clickHandler } = props
  return (
    <div className="slice-card-container" onClick={clickHandler}>
      <Card size="small" title={`Slice ${sliceNumber}`} style={{textAlign: 'center'}}>
        <Image
          className="slice-card__image"
          width={200}
          src={sliceImageUrl}
          preview={false}
        />
      </Card>
    </div>
  )
}