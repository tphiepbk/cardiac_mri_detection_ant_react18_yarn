import React from "react";
import "./MultiNPYDiagnosis.css";
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
import MiniNpySampleModal from "../../components/MiniNpySampleModal/MiniNpySampleModal";
import { useDispatch, useSelector } from "react-redux";
import progressBarSlice from "../../components/ProgressBar/progressBarSlice";
import mainPageSlice from "../MainPage/mainPageSlice";
import multiNpyDiagnosisSlice from "./multiNpyDiagnosisSlice";
import SaveSampleRecordModal from "../../components/SaveSampleRecordModal/SaveSampleRecordModal";
import { appProcessRunningSelector } from "../MainPage/mainPageSelector";
import {
  disabledButtonSelector,
  listInputNpyObjectSelector,
  listPredictionResultSelector,
  multiVideoListSlicesSelector,
} from "./multiNpyDiagnosisSelector";

import {
  triggerTaskSucceededAlert,
  triggerTaskFailedAlert,
  triggerNoVideoAlert,
  triggerSaveSampleRecordSucceededAlert,
  triggerSaveSampleRecordFailedAlert,
  triggerTaskRunningAlert,
  triggerUploadFailedAlert,
} from "../../components/Alerts/alertsTrigger";

export default function MultiNPYDiagnosis() {
  const dispatch = useDispatch();

  const processRunning = useSelector(appProcessRunningSelector);
  const listInputNpyObject = useSelector(listInputNpyObjectSelector);
  const listPredictionResult = useSelector(listPredictionResultSelector);
  const disabledButton = useSelector(disabledButtonSelector);
  const multiVideoListSlices = useSelector(multiVideoListSlicesSelector);

  const [isSliceModalVisible, setIsSliceModalVisible] = React.useState(false);
  const [currentSliceSelected, setCurrentSliceSelected] = React.useState(0);

  const [isSaveSampleRecordModalVisible, setIsSaveSampleRecordModalVisible] =
    React.useState(false);

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
      listInputNpyObject[videoIndex].videoName,
      listInputNpyObject[videoIndex].videoInputPath
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
    dispatch(mainPageSlice.actions.enableLoadingScreen());
    const npySamplesOpenResponse =
      await window.electronAPI.openMultiNpySamplesDialog();
    dispatch(mainPageSlice.actions.disableLoadingScreen());
    console.log(npySamplesOpenResponse);

    if (npySamplesOpenResponse.result === "SUCCESS") {
      dispatch(
        multiNpyDiagnosisSlice.actions.setListInputNpyObject(
          npySamplesOpenResponse.npyObjectList.map((npyObject) => ({
            index: npyObject.index,
            npyFileNames: npyObject.npyFileNames,
            videoName: npyObject.videoName,
            videoInputPath: npyObject.videoInputPath,
            videoOutputPath: npyObject.videoOutputPath,
            videoInputBboxPath: npyObject.videoInputBboxPath,
            videoOutputBboxPath: npyObject.videoOutputBboxPath,
          }))
        )
      );

      const crawledMultiVideoListSlices = npySamplesOpenResponse.npyObjectList.map(npyObject => {
        const crawledListSlices = npyObject.sliceTempPaths.map((slice, index) => ({
          sliceNumber: index,
          sliceImageUrl: slice[0],
          sliceVideoPath: "https://youtu.be/DBJmR6hx2UE",
        }))
        return crawledListSlices
      })

      dispatch(
        multiNpyDiagnosisSlice.actions.setMultiVideoListSlices(
          crawledMultiVideoListSlices
        )
      );
    } else {
      triggerUploadFailedAlert();
    }
    dispatch(mainPageSlice.actions.enableAppInteractive());
  };

  const uploadButtonClickHandler = () => {
    dispatch(multiNpyDiagnosisSlice.actions.setListInputNpyObject([]));

    dispatch(multiNpyDiagnosisSlice.actions.setListPredictionResult([]));

    if (!processRunning) {
      dispatch(progressBarSlice.actions.clearProgressBar());
    }

    dispatch(mainPageSlice.actions.disableAppInteractive());

    uploadMultiNpySamples();
    setCurrentVideoSelected(0);
  };

  const diagnoseNpySamples = async () => {
    dispatch(multiNpyDiagnosisSlice.actions.setListPredictionResult([]));

    dispatch(progressBarSlice.actions.clearProgressBar());

    dispatch(multiNpyDiagnosisSlice.actions.disableButton());

    dispatch(mainPageSlice.actions.setProcessRunning(true));

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

    /*
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
    */

    dispatch(mainPageSlice.actions.setProcessRunning(false));

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
            videoBboxConvertedPath={
              listInputNpyObject[currentVideoSelected].videoOutputBboxPath
            }
          />
        )}

        <div className="multi-npy-diagnosis__upload-container__diagnose-button">
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
                    ? 1
                    : 2
                }
                sampleName={listInputNpyObject[currentVideoSelected].videoName}
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
          <div className="multi-npy-diagnosis__diagnosis-result__slices-panel--empty">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <div className="multi-npy-diagnosis__diagnosis-result__slices-panel">
            {multiVideoListSlices[currentVideoSelected].map((slice) => (
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
                  multiVideoListSlices[currentVideoSelected][currentSliceSelected].sliceImageUrl
                }
                sliceVideoPath={
                  multiVideoListSlices[currentVideoSelected][currentSliceSelected].sliceVideoPath
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
