import React from "react";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import videoDiagnosisSlice from "./videoDiagnosisSlice";
import {
  videoPathSelector,
  videoMetadataSelector,
  diagnosisResultSelector,
  disabledButtonSelector,
  listSlicesSelector,
} from "./videoDiagnosisSelector";

import { Button, Descriptions, Empty, Skeleton, Input } from "antd";

import {
  UploadOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";

import SliceCard from "../../components/SliceCard/SliceCard";
import SliceCardModal from "../../components/SliceCardModal/SliceCardModal";
import SaveSampleRecordModal from "../../components/SaveSampleRecordModal/SaveSampleRecordModal";

import "./VideoDiagnosis.css";
import {
  triggerTaskSucceededAlert,
  triggerTaskFailedAlert,
  triggerNoVideoAlert,
  triggerSaveSampleRecordSucceededAlert,
  triggerSaveSampleRecordFailedAlert,
  triggerTaskRunningAlert,
  triggerUploadFailedAlert,
} from "../../components/Alerts/alertsTrigger";
import progressBarSlice from "../../components/ProgressBar/progressBarSlice";
import mainPageSlice from "../MainPage/mainPageSlice";
import { appProcessRunningSelector } from "../MainPage/mainPageSelector";

const NO_DIAGNOSIS_RESULT = 0;
const NORMAL_DIAGNOSIS_RESULT = 1;
const ABNORMAL_DIAGNOSIS_RESULT = 2;

export default function VideoDiagnosis() {
  const dispatch = useDispatch();

  const videoPath = useSelector(videoPathSelector);
  const videoMetadata = useSelector(videoMetadataSelector);
  const disabledButton = useSelector(disabledButtonSelector);
  const diagnosisResult = useSelector(diagnosisResultSelector);
  const listSlices = useSelector(listSlicesSelector);

  const processRunning = useSelector(appProcessRunningSelector);

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isSaveSampleRecordModalVisible, setIsSaveSampleRecordModalVisible] =
    React.useState(false);
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

  const showSaveSampleRecordModal = () => {
    setIsSaveSampleRecordModalVisible(true);
  };

  const closeSaveSampleRecordModalHandler = () => {
    setIsSaveSampleRecordModalVisible(false);
  };

  const saveSampleRecord = async (sampleRecord) => {
    console.log("Saving record...");
    const response = await window.electronAPI.saveSampleRecord(sampleRecord);
    if (response.result === "SUCCESS") {
      triggerSaveSampleRecordSucceededAlert();
    } else {
      triggerSaveSampleRecordFailedAlert();
    }
  };

  const uploadVideo = async () => {
    dispatch(mainPageSlice.actions.enableLoadingScreen());
    const response = await window.electronAPI.uploadVideo();
    dispatch(mainPageSlice.actions.disableLoadingScreen());
    console.log(response);

    if (response.result === "SUCCESS") {
      const {
        videoName,
        videoInputPath,
        videoOutputPath,
        videoMetadata: { format_long_name, duration, height, width },
      } = response.target;

      dispatch(
        videoDiagnosisSlice.actions.setVideoPath({
          avi: videoInputPath,
          mp4: videoOutputPath,
        })
      );

      dispatch(
        videoDiagnosisSlice.actions.setVideoMetadata({
          name: videoName,
          format: format_long_name,
          duration: duration,
          height: height,
          width: width,
        })
      );
    } else {
      triggerUploadFailedAlert();
    }

    dispatch(mainPageSlice.actions.enableAppInteractive());
  };

  const uploadButtonClickHandler = () => {
    dispatch(videoDiagnosisSlice.actions.clearContent());

    if (!processRunning) {
      dispatch(progressBarSlice.actions.clearProgressBar());
    }

    dispatch(mainPageSlice.actions.disableAppInteractive());

    uploadVideo();
  };

  const diagnoseVideo = async () => {
    dispatch(
      videoDiagnosisSlice.actions.setDiagnosisResult(NO_DIAGNOSIS_RESULT)
    );

    dispatch(progressBarSlice.actions.clearProgressBar());

    dispatch(videoDiagnosisSlice.actions.disableButton());

    dispatch(mainPageSlice.actions.setProcessRunning(true));

    const progressBarRunning = setInterval(() => {
      dispatch(progressBarSlice.actions.increaseProgressBar());
    }, 250);

    const predictionResponse = await window.electronAPI.makeSinglePrediction(
      videoPath.avi
    );
    console.log(predictionResponse);

    clearInterval(progressBarRunning);
    dispatch(progressBarSlice.actions.completeProgressBar());

    const crawledListSlices = [];
    for (let i = 0; i <= 10; i++) {
      crawledListSlices.push({
        sliceNumber: i,
        sliceImageUrl:
          "https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png",
        sliceVideoPath: "https://youtu.be/DBJmR6hx2UE",
      });
    }
    dispatch(videoDiagnosisSlice.actions.setListSlices(crawledListSlices));

    dispatch(mainPageSlice.actions.setProcessRunning(false));

    if (predictionResponse.result === "SUCCESS") {
      triggerTaskSucceededAlert();

      if (parseFloat(predictionResponse.value) >= 0.5) {
        dispatch(
          videoDiagnosisSlice.actions.setDiagnosisResult(
            ABNORMAL_DIAGNOSIS_RESULT
          )
        );
      } else {
        dispatch(
          videoDiagnosisSlice.actions.setDiagnosisResult(
            NORMAL_DIAGNOSIS_RESULT
          )
        );
      }
    } else {
      triggerTaskFailedAlert();
    }

    dispatch(videoDiagnosisSlice.actions.enableButton());
  };

  const diagnoseButtonClickHandler = () => {
    if (processRunning) {
      triggerTaskRunningAlert();
    } else if (videoPath.avi === "") {
      triggerNoVideoAlert();
    } else {
      diagnoseVideo();
    }
  };

  let today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
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
              Upload video
            </Button>
          ) : (
            <Button
              type="primary"
              shape="round"
              icon={<UploadOutlined />}
              size={10}
              onClick={uploadButtonClickHandler}
            >
              Upload video
            </Button>
          )}
        </div>

        <Input
          className="video-diagnosis__upload-container__video-path-box"
          placeholder={videoPath.avi === "" ? "N/A" : videoPath.avi}
          disabled
        />

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
            controls={true}
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
            {videoMetadata.name ? videoMetadata.name : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Format">
            {videoMetadata.format ? videoMetadata.format : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Duration">
            {videoMetadata.duration ? `${videoMetadata.duration} s` : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Size">
            {videoMetadata.width && videoMetadata.height
              ? `${videoMetadata.width} x ${videoMetadata.height}`
              : "N/A"}
          </Descriptions.Item>
        </Descriptions>

        <div className="video-diagnosis__upload-container__diagnose-button">
          {disabledButton ? (
            <Button
              type="primary"
              shape="round"
              icon={<SendOutlined />}
              size={10}
              disabled
            >
              Diagnose
            </Button>
          ) : (
            <Button
              type="primary"
              shape="round"
              icon={<SendOutlined />}
              size={10}
              onClick={diagnoseButtonClickHandler}
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
              {diagnosisResult === NO_DIAGNOSIS_RESULT ? (
                <Button
                  icon={<MinusCircleOutlined />}
                  className="button-as-none-tag"
                  size="large"
                >
                  NONE
                </Button>
              ) : diagnosisResult === NORMAL_DIAGNOSIS_RESULT ? (
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
          </div>

          <div className="video-diagnosis__diagnosis-result__result-panel__date-modified">
            <h2>Date Modified</h2>
            {diagnosisResult === NO_DIAGNOSIS_RESULT ? (
              <Skeleton paragraph={{ rows: 0 }} />
            ) : (
              <h1>{today}</h1>
            )}
          </div>

          <div className="video-diagnosis__diagnosis-result__result-panel__save-record">
            <h2>Save record</h2>
            {diagnosisResult === NO_DIAGNOSIS_RESULT ? (
              <Button
                type="primary"
                shape="round"
                style={{ marginTop: "5px" }}
                icon={<UserAddOutlined />}
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
                icon={<UserAddOutlined />}
                size={10}
                onClick={showSaveSampleRecordModal}
              >
                Proceed
              </Button>
            )}

            {isSaveSampleRecordModalVisible && (
              <SaveSampleRecordModal
                diagnosisResult={diagnosisResult}
                closeSaveSampleRecordModalHandler={
                  closeSaveSampleRecordModalHandler
                }
                sampleName={videoMetadata.name}
                saveSampleRecord={saveSampleRecord}
                today={today}
              />
            )}
          </div>
        </div>

        {diagnosisResult === NO_DIAGNOSIS_RESULT ? (
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
