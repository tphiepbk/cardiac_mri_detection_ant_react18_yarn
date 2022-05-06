import React from "react";
import "./MultiNPYDiagnosis.css";
import { Button, Empty, Skeleton } from "antd";
import {
  UploadOutlined,
  FundViewOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";

import VideoItem from "../../components/VideoItem/VideoItem";
import SliceCard from "../../components/SliceCard/SliceCard";
import SliceCardModal from "../../components/SliceCardModal/SliceCardModal";
import MiniNpySampleModal from "../../components/MiniNpySampleModal/MiniNpySampleModal";
import { useDispatch, useSelector } from "react-redux";
import progressBarSlice from "../../components/ProgressBar/progressBarSlice";
import alertsSlice from "../../components/Alerts/alertsSlice";
import appSlice from "../../appSlice";
import multiNpyDiagnosisSlice from "./multiNpyDiagnosisSlice";
import SavePatientRecordModal from "../../components/SavePatientRecordModal/SavePatientRecordModal";
import { appProcessRunningSelector } from "../../appSelector";
import {
  disabledButtonSelector,
  listInputNpyObjectSelector,
  listPredictionResultSelector,
  multiVideoListSlicesSelector,
} from "./multiNpyDiagnosisSelector";

export default function MultiNPYDiagnosis() {
  const dispatch = useDispatch();

  const processRunning = useSelector(appProcessRunningSelector);
  const listInputNpyObject = useSelector(listInputNpyObjectSelector);
  const listPredictionResult = useSelector(listPredictionResultSelector);
  const disabledButton = useSelector(disabledButtonSelector);
  const multiVideoListSlices = useSelector(multiVideoListSlicesSelector);

  const [isSliceModalVisible, setIsSliceModalVisible] = React.useState(false);
  const [currentSliceSelected, setCurrentSliceSelected] = React.useState(0);

  const [isSavePatientRecordModalVisible, setIsSavePatientRecordModalVisible] =
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

  const triggerSavePatientRecordSucceededAlert = () => {
    dispatch(alertsSlice.actions.openSavePatientRecordSucceededAlert());
    setTimeout(() => {
      dispatch(alertsSlice.actions.closeSavePatientRecordSucceededAlert());
    }, alertTimeout);
  };

  const triggerSavePatientRecordFailedAlert = () => {
    dispatch(alertsSlice.actions.openSavePatientRecordFailedAlert());
    setTimeout(() => {
      dispatch(alertsSlice.actions.closeSavePatientRecordFailedAlert());
    }, alertTimeout);
  };

  const showSavePatientRecordModal = () => {
    setIsSavePatientRecordModalVisible(true);
  };

  const closeSavePatientRecordModalHandler = () => {
    setIsSavePatientRecordModalVisible(false);
  };

  const savePatientRecord = async (patientRecord) => {
    console.log("Saving record...");
    const response = await window.electronAPI.savePatientDiagnosisResult(
      patientRecord
    );
    if (response.result === "SUCCESS") {
      triggerSavePatientRecordSucceededAlert();
    } else {
      triggerSavePatientRecordFailedAlert();
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
      listInputNpyObject[videoIndex].videoName,
      listInputNpyObject[videoIndex].videoPath
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

  const uploadMultiNpySamples = async () => {
    const npySamplesOpenResponse = await window.electronAPI.openMultiNpySamplesDialog();
    console.log(npySamplesOpenResponse);

    if (npySamplesOpenResponse.result === "SUCCESS") {
      dispatch(
        multiNpyDiagnosisSlice.actions.setListInputNpyObject(
          npySamplesOpenResponse.npyObjectList.map((npyObject) => ({
            index: npyObject.index,
            npyFileNames: npyObject.npyFileNames,
            npyFilePaths: npyObject.npyFilePaths,
            videoName: npyObject.videoName,
            videoPath: npyObject.videoInputPath,
            videoOutputPath: npyObject.videoOutputPath,
          }))
        )
      );
    } else {
      triggerUploadFailedAlert();
    }
    dispatch(appSlice.actions.enableAppInteractive());
  };

  const uploadButtonClickHandler = () => {
    dispatch(multiNpyDiagnosisSlice.actions.setListInputNpyObject([]));

    dispatch(multiNpyDiagnosisSlice.actions.setListPredictionResult([]));

    if (!processRunning) {
      dispatch(progressBarSlice.actions.clearProgressBar());
    }

    dispatch(appSlice.actions.disableAppInteractive());

    uploadMultiNpySamples();
    setCurrentVideoSelected(0);
  };

  const diagnoseNpySamples = async () => {
    dispatch(multiNpyDiagnosisSlice.actions.setListPredictionResult([]));

    dispatch(progressBarSlice.actions.clearProgressBar());

    dispatch(multiNpyDiagnosisSlice.actions.disableButton());

    dispatch(appSlice.actions.setProcessRunning(true));

    const progressBarRunning = setInterval(() => {
      dispatch(progressBarSlice.actions.increaseProgressBar());
    }, listInputNpyObject.length * 150);

    const predictionResponse = await window.electronAPI.makeMultiplePrediction(
      listInputNpyObject
    );
    console.log(predictionResponse);

    clearInterval(progressBarRunning);

    dispatch(progressBarSlice.actions.completeProgressBar());

    dispatch(multiNpyDiagnosisSlice.actions.enableButton());

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
      multiNpyDiagnosisSlice.actions.setMultiVideoListSlices(
        crawledMultiVideoListSlices
      )
    );

    dispatch(appSlice.actions.setProcessRunning(false));

    if (predictionResponse.result === "SUCCESS") {
      triggerTaskSucceededAlert();

      dispatch(
        multiNpyDiagnosisSlice.actions.setListPredictionResult([
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
    } else if (listInputNpyObject.length === 0) {
      triggerNoVideoAlert();
    } else {
      diagnoseNpySamples();
    }
  };

  let today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();
  today = dd + "/" + mm + "/" + yyyy;

  return (
    <div className="multi-npy-diagnosis">
      <div className="multi-npy-diagnosis__upload-container">
        <div className="multi-npy-diagnosis__upload-container__upload-button">
          {disabledButton ? (
            <Button
              type="primary"
              shape="round"
              icon={<UploadOutlined />}
              size={10}
              disabled
            >
              Upload NPY samples
            </Button>
          ) : (
            <Button
              type="primary"
              shape="round"
              icon={<UploadOutlined />}
              size={10}
              onClick={uploadButtonClickHandler}
            >
              Upload NPY samples
            </Button>
          )}
        </div>

        {listInputNpyObject.length === 0 ? (
          <Empty
            className="multi-npy-diagnosis__upload-container__video-list--empty"
            description="No video uploaded"
          />
        ) : (
          <div className="multi-npy-diagnosis__upload-container__video-list">
            {listInputNpyObject.map((npyObject, index) => (
              <VideoItem
                key={index}
                selected={index === currentVideoSelected ? true : false}
                videoName={npyObject.videoName}
                inspectClickHandler={() => inspectClickHandler(npyObject.index)}
                clickHandler={() => selectVideo(npyObject.index)}
              />
            ))}
          </div>
        )}

        {isVideoModalVisible && (
          <MiniNpySampleModal
            closeVideoModalHandler={closeVideoModal}
            npyFileNames={listInputNpyObject[currentVideoSelected].npyFileNames}
            videoMetadata={currentVideoMetadata}
            videoConvertedPath={
              listInputNpyObject[currentVideoSelected].videoOutputPath
            }
          />
        )}

        <div className="multi-npy-diagnosis__upload-container__diagnose-button">
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
              onClick={diagnoseButtonClickHandler}
            >
              Diagnose
            </Button>
          )}
        </div>
      </div>

      <div className="multi-npy-diagnosis__diagnosis-result">
        <div className="multi-npy-diagnosis__diagnosis-result__result-panel">
          <div className="multi-npy-diagnosis__diagnosis-result__result-panel__result">
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

          <div className="multi-npy-diagnosis__diagnosis-result__result-panel__date-modified">
            <h2>Date Modified</h2>
            {listPredictionResult.length === 0 ? (
              <Skeleton paragraph={{ rows: 0 }} />
            ) : (
              <h1>{today}</h1>
            )}
          </div>

          <div className="multi-npy-diagnosis__diagnosis-result__result-panel__save-record">
            <h2>Save record</h2>
            {listPredictionResult.length === 0 ? (
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
                onClick={showSavePatientRecordModal}
              >
                Proceed
              </Button>
            )}

            {isSavePatientRecordModalVisible && (
              <SavePatientRecordModal
                diagnosisResult={
                  listPredictionResult[currentVideoSelected].predictedValue <
                  0.5
                    ? 1
                    : 2
                }
                closeSavePatientRecordModalHandler={
                  closeSavePatientRecordModalHandler
                }
                savePatientRecord={savePatientRecord}
                today={today}
              />
            )}
          </div>
        </div>

        {listPredictionResult.length === 0 ? (
          <div className="multi-npy-diagnosis__diagnosis-result__slices-panel--empty">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <div className="multi-npy-diagnosis__diagnosis-result__slices-panel">
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
