import React from "react";
import ReactPlayer from "react-player";
import { Modal, Image, InputNumber, Divider, Button, Empty } from "antd";
import "./SliceCardModal.css";

export default function SliceCardModal(props) {
  const {
    closeModalHandler,
    sliceNumber,
    sliceFrames,
    sliceVideoPath,
    sliceCroppedNpyPath,
  } = props;

  const [edFrameIndex, setEdFrameIndex] = React.useState(0);
  const [esFrameIndex, setEsFrameIndex] = React.useState(0);

  const [predictionResults, setPredictionResults] = React.useState([]);

  console.log(predictionResults)

  const edFrameIndexChangeHandler = (value) => {
    setPredictionResults([])
    setEdFrameIndex(value);
  };

  const esFrameIndexChangeHandler = (value) => {
    setPredictionResults([])
    setEsFrameIndex(value);
  };

  const predictButtonClickHandler = async () => {
    if (edFrameIndex >= esFrameIndex) {
      console.log("ERROR !!!");
    } else {
      console.log("CAN PREDICT");
      const predictAbnormalPositionForSliceResult =
        await window.electronAPI.predictAbnormalPositionForSlice({
          sliceCroppedNpyPath,
          edFrameIndex,
          esFrameIndex,
        });
      console.log(predictAbnormalPositionForSliceResult);
      if (predictAbnormalPositionForSliceResult.result === "SUCCESS") {
        setPredictionResults([...predictAbnormalPositionForSliceResult.target]);
      } else {
        console.log("FAILED")
      }
    }
  };

  return (
    <Modal
      className="slice-card-modal"
      title={`Slice ${sliceNumber}`}
      visible={true}
      onCancel={closeModalHandler}
      footer={null}
      centered
      width={"auto"}
    >
      <div className="slice-card-modal-container">
        <div className="slice-card-modal__first-model">
          <ReactPlayer
            className="slice-card-modal__video"
            width={600}
            height={400}
            url={sliceVideoPath}
            playing={true}
            controls={false}
            loop={true}
          />
        </div>

        <Divider
          type="vertical"
          style={{
            height: "45vh",
            border: "2px solid",
            borderRadius: "10px",
            color: "#BEBEBE",
          }}
        />

        <div className="slice-card-modal__second-model">
          <div className="slice-card-modal__input-image-container">
            <div className="slice-card-modal__input-image-container__input-image">
              <h3>First frame</h3>
              <Image width={150} src={sliceFrames[edFrameIndex]} />
              <InputNumber
                min={0}
                max={sliceFrames.length - 1}
                defaultValue={0}
                onChange={edFrameIndexChangeHandler}
              />
            </div>
            <div className="slice-card-modal__input-image-container__input-image">
              <h3>Second frame</h3>
              <Image width={150} src={sliceFrames[esFrameIndex]} />
              <InputNumber
                min={0}
                max={sliceFrames.length - 1}
                defaultValue={0}
                onChange={esFrameIndexChangeHandler}
              />
            </div>
          </div>

          <Button
            type="primary"
            style={{ borderRadius: "5px" }}
            onClick={predictButtonClickHandler}
          >
            Predict
          </Button>

          <Divider>Result</Divider>

          {predictionResults.length === 0 ? (
            <div className="slice-card-modal__output-image-container--empty">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            <div className="slice-card-modal__output-image-container">
              <div className="slice-card-modal__output-image-container__output-image">
                <Image
                  width={250}
                  src={predictionResults[0]}
                />
                <h3>First frame</h3>
              </div>
              <div className="slice-card-modal__output-image-container__output-image">
                <Image
                  width={250}
                  src={predictionResults[2]}
                />
                <h3>Result frame</h3>
              </div>
              <div className="slice-card-modal__output-image-container__output-image">
                <Image
                  width={250}
                  src={predictionResults[1]}
                />
                <h3>Second frame</h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
