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
  multiListSlicesSelector,
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

const NORMAL_DIAGNOSIS_RESULT = 1;
const ABNORMAL_DIAGNOSIS_RESULT = 2;

const AVERAGE_DIAGNOSE_TIME = 250;

export default function MultiNPYDiagnosis() {
  const dispatch = useDispatch();

  const processRunning = useSelector(appProcessRunningSelector);
  const listInputNpyObject = useSelector(listInputNpyObjectSelector);
  const listPredictionResult = useSelector(listPredictionResultSelector);
  const disabledButton = useSelector(disabledButtonSelector);
  const multiListSlices = useSelector(multiListSlicesSelector);

  const [sliceCardModalVisible, setSliceCardModalVisible] =
    React.useState(false);
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
    const response = await window.electronAPI.saveSampleRecord(sampleRecord);
    if (response.result === "SUCCESS") {
      triggerSaveSampleRecordSucceededAlert();
    } else {
      triggerSaveSampleRecordFailedAlert();
    }
  };

  const toggleSliceCardModal = () => {
    setSliceCardModalVisible((prevState) => !prevState);
  };

  const selectSlice = (sliceNumber) => {
    console.log(`Selected slice ${sliceNumber}`);
    setCurrentSliceSelected(sliceNumber);
    toggleSliceCardModal();
  };

  const [isVideoModalVisible, setIsVideoModalVisible] = React.useState(false);
  const [currentVideoSelected, setCurrentVideoSelected] = React.useState(0);

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
    setIsVideoModalVisible(true);
  };

  const uploadMultipleNpySamples = async () => {
    dispatch(mainPageSlice.actions.enableLoadingScreen());
    const uploadMultipleNpySamplesResponse =
      await window.electronAPI.uploadMultipleNpySamples();
    dispatch(mainPageSlice.actions.disableLoadingScreen());

    console.log(uploadMultipleNpySamplesResponse);

    if (uploadMultipleNpySamplesResponse.result === "FAILED") {
      triggerUploadFailedAlert();
    } else if (uploadMultipleNpySamplesResponse.result === "SUCCESS") {
      dispatch(
        multiNpyDiagnosisSlice.actions.setListInputNpyObject([
          ...uploadMultipleNpySamplesResponse.target,
        ])
      );

      const crawledMultiListSlices = uploadMultipleNpySamplesResponse.target.map(
        (npyObject) => {
          const numberOfSlices = npyObject.sliceTempPaths.length;

          const crawledListSlices = [];

          for (
            let sliceNumber = 0;
            sliceNumber < numberOfSlices;
            sliceNumber++
          ) {
            crawledListSlices.push({
              sliceNumber,
              sliceImageUrl: npyObject.sliceTempPaths[sliceNumber][0],
              sliceFrames: npyObject.sliceTempPaths[sliceNumber],
              sliceCroppedFrames: npyObject.croppedSliceTempPaths[sliceNumber],
              sliceVideoPath: "https://youtu.be/kvjbNnHAno8",
              sliceCroppedNpyPath: npyObject.croppedNpyFilePaths[sliceNumber],
            });
          }

          return crawledListSlices;
        }
      );

      console.log("crawledMultiVideoListSlices = ", crawledMultiListSlices);

      dispatch(
        multiNpyDiagnosisSlice.actions.setMultiListSlices(
          crawledMultiListSlices
        )
      );
    }

    dispatch(mainPageSlice.actions.enableAppInteractive());
  };

  const uploadButtonClickHandler = () => {
    dispatch(multiNpyDiagnosisSlice.actions.clearContent());

    if (!processRunning) {
      dispatch(progressBarSlice.actions.clearProgressBar());
    }

    dispatch(mainPageSlice.actions.disableAppInteractive());

    uploadMultipleNpySamples();
    setCurrentVideoSelected(0);
  };

  const diagnoseNpySamples = async () => {
    dispatch(multiNpyDiagnosisSlice.actions.setListPredictionResult([]));

    dispatch(progressBarSlice.actions.clearProgressBar());

    dispatch(multiNpyDiagnosisSlice.actions.disableButton());

    dispatch(mainPageSlice.actions.setProcessRunning(true));

    const progressBarRunning = setInterval(() => {
      dispatch(progressBarSlice.actions.increaseProgressBar());
    }, listInputNpyObject.length * AVERAGE_DIAGNOSE_TIME);

    const predictionResponse =
      await window.electronAPI.classifyMultipleNpySamples(
        listInputNpyObject.map(
          (npyObject) => npyObject.concatenatedNpySamplePath
        )
      );

    console.log(predictionResponse);

    clearInterval(progressBarRunning);

    dispatch(progressBarSlice.actions.completeProgressBar());

    dispatch(multiNpyDiagnosisSlice.actions.enableButton());

    dispatch(mainPageSlice.actions.setProcessRunning(false));

    if (predictionResponse.result === "FAILED") {
      triggerTaskFailedAlert();
    } else {
      triggerTaskSucceededAlert();

      dispatch(
        multiNpyDiagnosisSlice.actions.setListPredictionResult(
          predictionResponse.target.map(
            (returnedObject) => returnedObject.label
          ),
        )
      );
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
            sampleName={listInputNpyObject[currentSliceSelected].sampleName}
            videoMetadata={
              listInputNpyObject[currentVideoSelected].videoMetadata
            }
            videoConvertedPath={
              listInputNpyObject[currentVideoSelected].videoOutputPath
            }
            videoBboxConvertedPath={
              listInputNpyObject[currentVideoSelected].videoBboxOutputPath
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
              ) : listPredictionResult[currentVideoSelected] === "normal" ? (
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
                  listPredictionResult[currentVideoSelected] === "normal"
                    ? NORMAL_DIAGNOSIS_RESULT
                    : ABNORMAL_DIAGNOSIS_RESULT
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

        {listPredictionResult.length ===
        0 /* multiListSlices.length === 0 */ ? (
          <div className="multi-npy-diagnosis__diagnosis-result__slices-panel--empty">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <div className="multi-npy-diagnosis__diagnosis-result__slices-panel">
            {multiListSlices[currentVideoSelected].map((slice) => (
              <SliceCard
                key={slice.sliceNumber}
                sliceNumber={slice.sliceNumber}
                sliceImageUrl={slice.sliceImageUrl}
                clickHandler={() => {
                  selectSlice(slice.sliceNumber);
                }}
              />
            ))}

            {sliceCardModalVisible && (
              <SliceCardModal
                closeModalHandler={toggleSliceCardModal}
                sliceNumber={currentSliceSelected}
                sliceFrames={
                  multiListSlices[currentVideoSelected][currentSliceSelected]
                    .sliceFrames
                }
                sliceCroppedFrames={
                  multiListSlices[currentVideoSelected][currentSliceSelected]
                    .sliceCroppedFrames
                }
                sliceImageUrl={
                  multiListSlices[currentVideoSelected][currentSliceSelected]
                    .sliceImageUrl
                }
                sliceVideoPath={
                  multiListSlices[currentVideoSelected][currentSliceSelected]
                    .sliceVideoPath
                }
                sliceCroppedNpyPath={
                  multiListSlices[currentVideoSelected][currentSliceSelected]
                    .sliceCroppedNpyPath
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
