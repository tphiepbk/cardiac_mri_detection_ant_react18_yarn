import React from "react";
import ReactPlayer from "react-player";
import {
  Modal,
  Image,
  InputNumber,
  Divider,
  Button,
  Empty,
  Switch,
} from "antd";
import "./SliceCardModal.css";

export default function SliceCardModal(props) {
  const {
    closeModalHandler,
    sliceNumber,
    sliceFrames,
    sliceCroppedFrames,
    sliceCroppedNpyPath,
  } = props;

  const [edFrameIndex, setEdFrameIndex] = React.useState(0);
  const [esFrameIndex, setEsFrameIndex] = React.useState(1);

  const [croppedFramesMode, setCroppedFramesMode] = React.useState(false);

  const [predictionResults, setPredictionResults] = React.useState([]);

  const [generatedMNADVideoUrl, setGeneratedMNADVideoUrl] = React.useState("");

  console.log(predictionResults);

  const edFrameIndexChangeHandler = (value) => {
    setPredictionResults([]);
    setEdFrameIndex(value);
  };

  const esFrameIndexChangeHandler = (value) => {
    setPredictionResults([]);
    setEsFrameIndex(value);
  };
  const toggleCroppedFramesMode = () => {
    setCroppedFramesMode((prevState) => !prevState);
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
        console.log("FAILED");
      }
    }
  };

  const generateMNADVideo = async () => {
    console.log("Generating MNAD video...");
    const generateMNADVideoResponse = await window.electronAPI.generateMNADVideo(sliceCroppedNpyPath)

    console.log(generateMNADVideoResponse)

    if (generateMNADVideoResponse.result === "FAILED") {
      setGeneratedMNADVideoUrl("")
    } else {
      setGeneratedMNADVideoUrl(generateMNADVideoResponse.target);
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
        <fieldset className="slice-card-modal__first-model">
          <legend>MNAD model</legend>
          <div className="slice-card-modal__first-model__container">
            <Button
              type="primary"
              style={{ borderRadius: "5px" }}
              onClick={generateMNADVideo}
            >
              Generate
            </Button>
            {generatedMNADVideoUrl ? (
              <ReactPlayer
                className="slice-card-modal__video"
                width={600}
                height={400}
                url={generatedMNADVideoUrl}
                playing={true}
                controls={false}
                loop={true}
              />
            ) : (
              <div className="slice-card-modal__video--empty">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}
          </div>
        </fieldset>

        <fieldset className="slice-card-modal__second-model">
          <legend>Monogenic Signal Model</legend>
          <div className="slice-card-modal__input-image-container">
            <div className="slice-card-modal__input-image-container__input-image">
              <h3>End-Diastolic frame</h3>
              {croppedFramesMode ? (
                <Image width={100} src={sliceCroppedFrames[edFrameIndex]} />
              ) : (
                <Image width={150} src={sliceFrames[edFrameIndex]} />
              )}
              <InputNumber
                min={0}
                max={sliceFrames.length - 1}
                defaultValue={0}
                onChange={edFrameIndexChangeHandler}
              />
            </div>

            <Switch
              checkedChildren="cropped"
              unCheckedChildren="normal"
              onChange={toggleCroppedFramesMode}
            />

            <div className="slice-card-modal__input-image-container__input-image">
              <h3>End-Systolic frame</h3>
              {croppedFramesMode ? (
                <Image width={100} src={sliceCroppedFrames[esFrameIndex]} />
              ) : (
                <Image width={150} src={sliceFrames[esFrameIndex]} />
              )}
              <InputNumber
                min={0}
                max={sliceFrames.length - 1}
                defaultValue={1}
                onChange={esFrameIndexChangeHandler}
              />
            </div>
          </div>

          {edFrameIndex >= esFrameIndex ? (
            <div className="slice-card-modal__predict-button-container">
              <h3 className="error-text">
                End-Systolic frame index must be greater than End-Diastolic
                frame index
              </h3>
              <Button type="primary" style={{ borderRadius: "5px" }} disabled>
                Predict
              </Button>
            </div>
          ) : (
            <div className="slice-card-modal__predict-button-container">
              <Button
                type="primary"
                style={{ borderRadius: "5px" }}
                onClick={predictButtonClickHandler}
              >
                Predict
              </Button>
            </div>
          )}

          <Divider>Result</Divider>

          {predictionResults.length === 0 ? (
            <div className="slice-card-modal__output-image-container--empty">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            <div className="slice-card-modal__output-image-container">
              <div className="slice-card-modal__output-image-container__output-image">
                <Image width={250} src={predictionResults[0]} />
                <h3>End-Diastolic frame</h3>
              </div>
              <div className="slice-card-modal__output-image-container__output-image">
                <Image width={250} src={predictionResults[2]} />
                <h3>Final result</h3>
              </div>
              <div className="slice-card-modal__output-image-container__output-image">
                <Image width={250} src={predictionResults[1]} />
                <h3>End-Systolic frame</h3>
              </div>
            </div>
          )}
        </fieldset>
      </div>
    </Modal>
  );
}
