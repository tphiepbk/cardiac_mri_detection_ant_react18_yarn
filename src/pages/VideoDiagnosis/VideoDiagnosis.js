import React from "react";
import ReactPlayer from "react-player";

import { Button, Descriptions, Empty, notification, Skeleton } from "antd";

import {
  UploadOutlined,
  FundViewOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";

import SliceCard from "../../components/SliceCard/SliceCard";
import SliceCardModal from "../../components/SliceCardModal/SliceCardModal";

import "./VideoDiagnosis.css";

export default function VideoDiagnosis(props) {
  const {
    videoPath,
    setVideoPath,
    videoMetadata,
    setVideoMetadata,
    setInteractive,
    diagnosisResult,
    setDiagnosisResult,
    increaseProgressBar,
    clearProgressBar,
    completeProgressBar,
    processRunning,
    setProcessRunning,
    disabledButton,
    setDisabledButton,
    listSlices,
    setListSlices,
    toggleErrorWarning,
    toggleSuccessNotification,
    toggleProcessRunningNotification,
  } = props;

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [currentSliceSelected, setCurrentSliceSelected] = React.useState(0);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const selectSlice = (sliceNumber) => {
    console.log(`Selected slice ${sliceNumber}`);
    setCurrentSliceSelected(sliceNumber);
    showModal();
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const getVideoMetadata = async (videoName, videoPath) => {
    const response = await window.electronAPI.getFileMetadata(videoPath);
    console.log(response);

    if (response.result === "SUCCESS") {
      const { format_long_name, duration } = response.target.format;
      const { height, width } = response.target.streams[0];

      setVideoMetadata({
        name: videoName,
        format: format_long_name,
        duration: duration,
        height: height,
        width: width,
      });
    }
  };

  const uploadVideo = async () => {
    notification.destroy();
    const response = await window.electronAPI.openFileDialog();
    console.log(response);

    if (response.result === "SUCCESS") {
      const { videoName, videoInputPath, videoOutputPath } = response;
      setVideoPath({
        avi: videoInputPath,
        mp4: videoOutputPath,
      });
      getVideoMetadata(videoName, videoInputPath);
    } else {
      toggleErrorWarning();
    }

    setInteractive((prevInteractive) => !prevInteractive);
  };

  const uploadButtonClickHandler = () => {
    clearProgressBar();
    setDiagnosisResult(0);
    setInteractive((prevInteractive) => !prevInteractive);
    uploadVideo();
  };

  const toggleNoVideoWarning = () => {
    notification["warning"]({
      message: "No Video Found",
      description: "Please upload video first",
    });
  };

  const diagnose = async () => {
    if (processRunning) {
      toggleProcessRunningNotification();
    } else {
      clearProgressBar();
      setDisabledButton(true);
      if (videoPath.avi === "") {
        toggleNoVideoWarning();
      } else {
        setProcessRunning(true);
        const progressBarRunning = setInterval(increaseProgressBar, 250);

        const predictionResponse =
          await window.electronAPI.makeSinglePrediction(videoPath.avi);
        console.log(predictionResponse);

        clearInterval(progressBarRunning);
        completeProgressBar();
        setDisabledButton(false);

        setListSlices(() => {
          const returnValue = [];
          for (let i = 0; i <= 10; i++) {
            returnValue.push({
              sliceNumber: i,
              sliceImageUrl:
                "https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png",
              sliceVideoPath: "https://youtu.be/DBJmR6hx2UE",
            });
          }
          return returnValue;
        });

        setProcessRunning(false);

        if (predictionResponse.result === "SUCCESS") {
          toggleSuccessNotification();
          if (parseFloat(predictionResponse.value) >= 0.5) {
            setDiagnosisResult(1);
          } else {
            setDiagnosisResult(2);
          }
        } else {
          toggleErrorWarning();
        }
      }
    }
  };

  const changeDiagnosisResultHandler = () => {
    setDiagnosisResult((prevState) => {
      if (prevState === 0) return 0;
      else if (prevState === 1) return 2;
      else return 1;
    });
  };

  let today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();
  today = dd + "/" + mm + "/" + yyyy;

  return (
    <div className="video-diagnosis">
      <div className="video-diagnosis__upload-container">
        <div className="video-diagnosis__upload-container__upload-button">
          {disabledButton ? (
            <Button
              type="primary"
              shape="round"
              icon={<UploadOutlined />}
              size={10}
              disabled
            >
              Upload file
            </Button>
          ) : (
            <Button
              type="primary"
              shape="round"
              icon={<UploadOutlined />}
              size={10}
              onClick={uploadButtonClickHandler}
            >
              Upload file
            </Button>
          )}
        </div>

        {videoPath.mp4 === "" ? (
          <Empty
            className="video-diagnosis__upload-container__no-video"
            description="No video uploaded"
          />
        ) : (
          <ReactPlayer
            className="video-diagnosis__upload-container__video"
            url={videoPath.mp4}
            playing={true}
            controls={false}
            loop={true}
          />
        )}

        <Descriptions
          className="video-diagnosis__upload-container__video-description"
          title="Description"
          bordered
          size="small"
          layout="vertical"
          column={4}
        >
          <Descriptions.Item label="Name" span={4}>
            {videoMetadata.name}
          </Descriptions.Item>
          <Descriptions.Item label="Format">
            {videoMetadata.format}
          </Descriptions.Item>
          <Descriptions.Item label="Duration">{`${videoMetadata.duration} s`}</Descriptions.Item>
          <Descriptions.Item label="Size">{`${videoMetadata.width} x ${videoMetadata.height}`}</Descriptions.Item>
        </Descriptions>

        <div className="video-diagnosis__upload-container__diagnose-button">
          {disabledButton ? (
            <Button
              type="primary"
              shape="round"
              icon={<FundViewOutlined />}
              size={10}
              disabled
            >
              Diagnose
            </Button>
          ) : (
            <Button
              type="primary"
              shape="round"
              icon={<FundViewOutlined />}
              size={10}
              onClick={diagnose}
            >
              Diagnose
            </Button>
          )}
        </div>
      </div>

      <div className="video-diagnosis__diagnosis-result">
        <div className="video-diagnosis__diagnosis-result__result-panel">
          <div className="video-diagnosis__diagnosis-result__result-panel__result">
            <h2>Result</h2>
            <span>
              {diagnosisResult === 0 ? (
                <Button
                  icon={<MinusCircleOutlined />}
                  className="button-as-none-tag"
                  size="large"
                >
                  NONE
                </Button>
              ) : diagnosisResult === 1 ? (
                <Button
                  icon={<CheckCircleOutlined />}
                  className="button-as-success-tag"
                  size="large"
                >
                  Normal
                </Button>
              ) : (
                <Button
                  icon={<CloseCircleOutlined />}
                  className="button-as-danger-tag"
                  size="large"
                >
                  Abnormal
                </Button>
              )}
            </span>
            {diagnosisResult === 0 ? (
              <Button
                type="primary"
                shape="round"
                style={{ marginLeft: "20px" }}
                disabled
              >
                Change
              </Button>
            ) : (
              <Button
                type="primary"
                shape="round"
                style={{ marginLeft: "20px" }}
                onClick={changeDiagnosisResultHandler}
              >
                Change
              </Button>
            )}
          </div>

          <div className="video-diagnosis__diagnosis-result__result-panel__date-modified">
            <h2>Date Modified</h2>
            {diagnosisResult === 0 ? (
              <Skeleton paragraph={{ rows: 0 }} />
            ) : (
              <h1>{today}</h1>
            )}
          </div>

          <div className="video-diagnosis__diagnosis-result__result-panel__save-record">
            <h2>Save record</h2>
            {diagnosisResult === 0 ? (
              <Button
                type="primary"
                shape="round"
                style={{ marginTop: "5px" }}
                icon={<FundViewOutlined />}
                size={10}
                disabled
              >
                Proceed
              </Button>
            ) : (
              <Button
                type="primary"
                shape="round"
                style={{ marginTop: "5px" }}
                icon={<FundViewOutlined />}
                size={10}
              >
                Proceed
              </Button>
            )}
          </div>
        </div>

        {diagnosisResult === 0 ? (
          <div className="video-diagnosis__diagnosis-result__slices-panel--empty">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <div className="video-diagnosis__diagnosis-result__slices-panel">
            {listSlices.map((slice) => (
              <SliceCard
                key={slice.sliceNumber}
                sliceNumber={slice.sliceNumber}
                sliceImageUrl={slice.sliceImageUrl}
                clickHandler={() => {
                  selectSlice(slice.sliceNumber);
                }}
              />
            ))}

            {isModalVisible && (
              <SliceCardModal
                closeModalHandler={closeModal}
                sliceNumber={currentSliceSelected}
                sliceImageUrl={listSlices[currentSliceSelected].sliceImageUrl}
                sliceVideoPath={listSlices[currentSliceSelected].sliceVideoPath}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
