import React from "react";
import "./MultiVideoDiagnosis.css";
import { Button, Empty, Skeleton } from "antd";
import {
  UploadOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";

import VideoItem from "../../components/VideoItem/VideoItem";
import SliceCard from "../../components/SliceCard/SliceCard";
import SliceCardModal from "../../components/SliceCardModal/SliceCardModal";
import MiniVideoModal from "../../components/MiniVideoModal/MiniVideoModal";
import { useDispatch, useSelector } from "react-redux";
import progressBarSlice from "../../components/ProgressBar/progressBarSlice";
import alertsSlice from "../../components/Alerts/alertsSlice";
import mainPageSlice from "../MainPage/mainPageSlice";
import multiVideoDiagnosisSlice from "./multiVideoDiagnosisSlice";
import SaveSampleRecordModal from "../../components/SaveSampleRecordModal/SaveSampleRecordModal";
import { appProcessRunningSelector } from "../MainPage/mainPageSelector";
import {
  disabledButtonSelector,
  listInputVideoSelector,
  listPredictionResultSelector,
  multiVideoListSlicesSelector,
} from "./multiVideoDiagnosisSelector";

const NORMAL_DIAGNOSIS_RESULT = 1;
const ABNORMAL_DIAGNOSIS_RESULT = 2;

export default function MultiVideoDiagnosis() {
  const dispatch = useDispatch();

  const processRunning = useSelector(appProcessRunningSelector);
  const listInputVideo = useSelector(listInputVideoSelector);
  const listPredictionResult = useSelector(listPredictionResultSelector);
  const disabledButton = useSelector(disabledButtonSelector);
  const multiVideoListSlices = useSelector(multiVideoListSlicesSelector);

  const [isSliceModalVisible, setIsSliceModalVisible] = React.useState(false);
  const [currentSliceSelected, setCurrentSliceSelected] = React.useState(0);

  const [isSaveSampleRecordModalVisible, setIsSaveSampleRecordModalVisible] =
    React.useState(false);

  const alertTimeout = 2000;

  const triggerTaskSucceededAlert = () => {
    dispatch(alertsSlice.actions.openTaskSucceededAlert());
    setTimeout(() => {
      dispatch(alertsSlice.actions.closeTaskSucceededAlert());
    }, alertTimeout);
  };

  const triggerTaskFailedAlert = () => {
    dispatch(alertsSlice.actions.openTaskFailedAlert());
    setTimeout(() => {
      dispatch(alertsSlice.actions.closeTaskFailedAlert());
    }, alertTimeout);
  };

  const triggerTaskRunningAlert = () => {
    dispatch(alertsSlice.actions.openTaskRunningAlert());
    setTimeout(() => {
      dispatch(alertsSlice.actions.closeTaskRunningAlert());
    }, alertTimeout);
  };

  const triggerNoVideoAlert = () => {
    dispatch(alertsSlice.actions.openNoVideoAlert());
    setTimeout(() => {
      dispatch(alertsSlice.actions.closeNoVideoAlert());
    }, alertTimeout);
  };

  const triggerUploadFailedAlert = () => {
    dispatch(alertsSlice.actions.openUploadFailedAlert());
    setTimeout(() => {
      dispatch(alertsSlice.actions.closeUploadFailedAlert());
    }, alertTimeout);
  };

  const triggerSaveSampleRecordSucceededAlert = () => {
    dispatch(alertsSlice.actions.openSaveSampleRecordSucceededAlert());
    setTimeout(() => {
      dispatch(alertsSlice.actions.closeSaveSampleRecordSucceededAlert());
    }, alertTimeout);
  };

  const triggerSaveSampleRecordFailedAlert = () => {
    dispatch(alertsSlice.actions.openSaveSampleRecordFailedAlert());
    setTimeout(() => {
      dispatch(alertsSlice.actions.closeSaveSampleRecordFailedAlert());
    }, alertTimeout);
  };

  const showSaveSampleRecordModal = () => {
    setIsSaveSampleRecordModalVisible(true);
  };

  const closeSaveSampleRecordModalHandler = () => {
    setIsSaveSampleRecordModalVisible(false);
  };

  const saveSampleRecord = async (sampleRecord) => {
    console.log("Saving record...");
    const response = await window.electronAPI.saveSampleRecord(
      sampleRecord
    );
    if (response.result === "SUCCESS") {
      triggerSaveSampleRecordSucceededAlert();
    } else {
      triggerSaveSampleRecordFailedAlert();
    }
  };

  const showSliceModal = () => {
    setIsSliceModalVisible(true);
  };

  const selectSlice = (sliceNumber) => {
    console.log(`Selected slice ${sliceNumber}`);
    setCurrentSliceSelected(sliceNumber);
    showSliceModal();
  };

  const closeSliceModal = () => {
    setIsSliceModalVisible(false);
  };

  const [isVideoModalVisible, setIsVideoModalVisible] = React.useState(false);
  const [currentVideoSelected, setCurrentVideoSelected] = React.useState(0);
  const [currentVideoMetadata, setCurrentVideoMetadata] = React.useState({
    name: "",
    format: "",
    duration: 0,
    height: 0,
    width: 0,
  });

  const closeVideoModal = () => {
    setIsVideoModalVisible(false);
  };

  const selectVideo = (videoIndex) => {
    console.log(`Selected video ${videoIndex}`);
    setCurrentVideoSelected(videoIndex);
  };

  const inspectClickHandler = (videoIndex) => {
    console.log("Selected Video Inspect", videoIndex);
    setCurrentVideoSelected(videoIndex);
    showVideoModal(videoIndex);
  };

  const showVideoModal = async (videoIndex) => {
    await getVideoMetadata(
      listInputVideo[videoIndex].name,
      listInputVideo[videoIndex].path
    );
    setIsVideoModalVisible(true);
  };

  const getVideoMetadata = async (videoName, videoPath, callback) => {
    const response = await window.electronAPI.getFileMetadata(videoPath);
    console.log(response);

    if (response.result === "SUCCESS") {
      const { format_long_name, duration } = response.target.format;
      const { height, width } = response.target.streams[0];

      setCurrentVideoMetadata({
        name: videoName,
        format: format_long_name,
        duration: duration,
        height: height,
        width: width,
      });
    }
  };

  const uploadMultiVideos = async () => {
    dispatch(mainPageSlice.actions.enableLoadingScreen())
    const filesOpenResponse = await window.electronAPI.openMultiFilesDialog();
    dispatch(mainPageSlice.actions.disableLoadingScreen())
    console.log(filesOpenResponse);

    if (filesOpenResponse.result === "SUCCESS") {
      dispatch(
        multiVideoDiagnosisSlice.actions.setListInputVideo(
          filesOpenResponse.videoObjectList.map((videoObject) => ({
            index: videoObject.index,
            name: videoObject.name,
            path: videoObject.path,
            convertedPath: videoObject.convertedPath,
          }))
        )
      );
    } else {
      triggerUploadFailedAlert();
    }
    dispatch(mainPageSlice.actions.enableAppInteractive());
  };

  const uploadButtonClickHandler = () => {
    dispatch(multiVideoDiagnosisSlice.actions.setListInputVideo([]));

    dispatch(multiVideoDiagnosisSlice.actions.setListPredictionResult([]));

    if (!processRunning) {
      dispatch(progressBarSlice.actions.clearProgressBar());
    }

    dispatch(mainPageSlice.actions.disableAppInteractive());

    uploadMultiVideos();
    setCurrentVideoSelected(0);
  };

  const diagnoseVideos = async () => {
    dispatch(multiVideoDiagnosisSlice.actions.setListPredictionResult([]));

    dispatch(progressBarSlice.actions.clearProgressBar());

    dispatch(multiVideoDiagnosisSlice.actions.disableButton());

    dispatch(mainPageSlice.actions.setProcessRunning(true));

    const progressBarRunning = setInterval(() => {
      dispatch(progressBarSlice.actions.increaseProgressBar());
    }, listInputVideo.length * 150);

    const predictionResponse = await window.electronAPI.makeMultiplePrediction(
      listInputVideo
    );
    console.log(predictionResponse);

    clearInterval(progressBarRunning);

    dispatch(progressBarSlice.actions.completeProgressBar());

    dispatch(multiVideoDiagnosisSlice.actions.enableButton());

    const crawledMultiVideoListSlices = [];
    for (let i = 0; i <= 10; i++) {
      crawledMultiVideoListSlices.push({
        sliceNumber: i,
        sliceImageUrl:
          "https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png",
        sliceVideoPath: "https://youtu.be/DBJmR6hx2UE",
      });
    }
    dispatch(
      multiVideoDiagnosisSlice.actions.setMultiVideoListSlices(
        crawledMultiVideoListSlices
      )
    );

    dispatch(mainPageSlice.actions.setProcessRunning(false));

    if (predictionResponse.result === "SUCCESS") {
      triggerTaskSucceededAlert();

      dispatch(
        multiVideoDiagnosisSlice.actions.setListPredictionResult([
          ...predictionResponse.returnedVideoObjectList,
        ])
      );
    } else {
      triggerTaskFailedAlert();
    }
  };

  const diagnoseButtonClickHandler = () => {
    if (processRunning) {
      triggerTaskRunningAlert();
    } else if (listInputVideo.length === 0) {
      triggerNoVideoAlert();
    } else {
      diagnoseVideos();
    }
  };

  let today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();
  today = dd + "/" + mm + "/" + yyyy;

  return (
    <div className="multi-video-diagnosis">
      <div className="multi-video-diagnosis__upload-container">
        <div className="multi-video-diagnosis__upload-container__upload-button">
          {disabledButton ? (
            <Button
              type="primary"
              shape="round"
              icon={<UploadOutlined />}
              size={10}
              disabled
            >
              Upload videos
            </Button>
          ) : (
            <Button
              type="primary"
              shape="round"
              icon={<UploadOutlined />}
              size={10}
              onClick={uploadButtonClickHandler}
            >
              Upload videos
            </Button>
          )}
        </div>

        {listInputVideo.length === 0 ? (
          <Empty
            className="multi-video-diagnosis__upload-container__video-list--empty"
            description="No video uploaded"
          />
        ) : (
          <div className="multi-video-diagnosis__upload-container__video-list">
            {listInputVideo.map((video, index) => (
              <VideoItem
                key={index}
                selected={index === currentVideoSelected ? true : false}
                videoName={video.name}
                inspectClickHandler={() => inspectClickHandler(video.index)}
                clickHandler={() => selectVideo(video.index)}
              />
            ))}
          </div>
        )}

        {isVideoModalVisible && (
          <MiniVideoModal
            closeVideoModalHandler={closeVideoModal}
            videoMetadata={currentVideoMetadata}
            videoConvertedPath={
              listInputVideo[currentVideoSelected].convertedPath
            }
          />
        )}

        <div className="multi-video-diagnosis__upload-container__diagnose-button">
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

      <div className="multi-video-diagnosis__diagnosis-result">
        <div className="multi-video-diagnosis__diagnosis-result__result-panel">
          <div className="multi-video-diagnosis__diagnosis-result__result-panel__result">
            <h2>Result</h2>
            <span>
              {listPredictionResult.length === 0 ? (
                <Button
                  icon={<MinusCircleOutlined />}
                  className="button-as-none-tag"
                  size="large"
                >
                  NONE
                </Button>
              ) : parseFloat(
                  listPredictionResult[currentVideoSelected].predictedValue
                ) < 0.5 ? (
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

          <div className="multi-video-diagnosis__diagnosis-result__result-panel__date-modified">
            <h2>Date Modified</h2>
            {listPredictionResult.length === 0 ? (
              <Skeleton paragraph={{ rows: 0 }} />
            ) : (
              <h1>{today}</h1>
            )}
          </div>

          <div className="multi-video-diagnosis__diagnosis-result__result-panel__save-record">
            <h2>Save record</h2>
            {listPredictionResult.length === 0 ? (
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
                diagnosisResult={
                  listPredictionResult[currentVideoSelected].predictedValue <
                  0.5
                    ? NORMAL_DIAGNOSIS_RESULT
                    : ABNORMAL_DIAGNOSIS_RESULT
                }
                sampleName={listInputVideo[currentVideoSelected].name}
                closeSaveSampleRecordModalHandler={
                  closeSaveSampleRecordModalHandler
                }
                saveSampleRecord={saveSampleRecord}
                today={today}
              />
            )}
          </div>
        </div>

        {listPredictionResult.length === 0 ? (
          <div className="multi-video-diagnosis__diagnosis-result__slices-panel--empty">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <div className="multi-video-diagnosis__diagnosis-result__slices-panel">
            {multiVideoListSlices.map((slice) => (
              <SliceCard
                key={slice.sliceNumber}
                sliceNumber={slice.sliceNumber}
                sliceImageUrl={slice.sliceImageUrl}
                clickHandler={() => {
                  selectSlice(slice.sliceNumber);
                }}
              />
            ))}

            {isSliceModalVisible && (
              <SliceCardModal
                closeModalHandler={closeSliceModal}
                sliceNumber={currentSliceSelected}
                sliceImageUrl={
                  multiVideoListSlices[currentSliceSelected].sliceImageUrl
                }
                sliceVideoPath={
                  multiVideoListSlices[currentSliceSelected].sliceVideoPath
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
