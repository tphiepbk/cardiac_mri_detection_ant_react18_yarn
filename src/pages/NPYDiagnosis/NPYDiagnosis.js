import React from "react";
import "./NPYDiagnosis.css";
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
import MiniVideoModal from "../../components/MiniVideoModal/MiniVideoModal";
import { useDispatch, useSelector } from "react-redux";
import progressBarSlice from "../../components/ProgressBar/progressBarSlice";
import alertsSlice from "../../components/Alerts/alertsSlice";
import appSlice from "../../appSlice";
import multiVideoDiagnosisSlice from "../MultiVideoDiagnosis/multiVideoDiagnosisSlice";
import { appProcessRunningSelector } from "../../appSelector";
import {
  disabledButtonSelector,
  listInputVideoSelector,
  listPredictionResultSelector,
  multiVideoListSlicesSelector,
} from "../MultiVideoDiagnosis/multiVideoDiagnosisSelector";

export default function NPYDiagnosis() {
  const dispatch = useDispatch();

  const processRunning = useSelector(appProcessRunningSelector);
  const listInputVideo = useSelector(listInputVideoSelector);
  const listPredictionResult = useSelector(listPredictionResultSelector);
  const disabledButton = useSelector(disabledButtonSelector);
  const multiVideoListSlices = useSelector(multiVideoListSlicesSelector);

  const [isSliceModalVisible, setIsSliceModalVisible] = React.useState(false);
  const [currentSliceSelected, setCurrentSliceSelected] = React.useState(0);

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

  const showVideoModal = (event) => {
    setIsVideoModalVisible(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalVisible(false);
  };

  const selectVideo = (videoIndex) => {
    console.log(`Selected video ${videoIndex}`);
    setCurrentVideoSelected(videoIndex);
  };

  const uploadMultiVideos = async () => {
    const filesOpenResponse = await window.electronAPI.openMultiFilesDialog();
    console.log(filesOpenResponse);

    if (filesOpenResponse.result === "SUCCESS") {
      /*
      setListInputVideo(() =>
        filesOpenResponse.videoObjectList.map((videoObject) => ({
          index: videoObject.index,
          name: videoObject.name,
          path: videoObject.path,
          convertedPath: videoObject.convertedPath,
        }))
      );
      */

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
      dispatch(alertsSlice.actions.openUploadFailedAlert());
    }

    //setInteractive((prevInteractive) => !prevInteractive);
    dispatch(appSlice.actions.enableAppInteractive());
  };

  const uploadButtonClickHandler = () => {
    dispatch(multiVideoDiagnosisSlice.actions.setListInputVideo([]));

    dispatch(progressBarSlice.actions.clearProgressBar());

    dispatch(appSlice.actions.disableAppInteractive());

    uploadMultiVideos();
    setCurrentVideoSelected(0);

    //dispatch(multiVideoDiagnosisSlice.actions.setListInputVideo([]));

    //dispatch(multiVideoDiagnosisSlice.actions.setListPredictionResult([]));
  };

  const diagnoseVideos = async () => {
    dispatch(multiVideoDiagnosisSlice.actions.setListPredictionResult([]));

    dispatch(progressBarSlice.actions.clearProgressBar());

    dispatch(multiVideoDiagnosisSlice.actions.disableButton());

    dispatch(appSlice.actions.setProcessRunning(true));

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

    dispatch(appSlice.actions.setProcessRunning(false));

    if (predictionResponse.result === "SUCCESS") {
      dispatch(alertsSlice.actions.openTaskSucceededAlert());

      dispatch(
        multiVideoDiagnosisSlice.actions.setListPredictionResult([
          ...predictionResponse.returnedVideoObjectList,
        ])
      );
    } else {
      dispatch(alertsSlice.actions.openTaskFailedAlert());
    }
  };

  const diagnoseButtonClickHandler = () => {
    if (processRunning) {
      dispatch(alertsSlice.actions.openTaskRunningAlert());
    } else if (listInputVideo.length === 0) {
      dispatch(alertsSlice.actions.openNoVideoAlert());
    } else {
      diagnoseVideos();
    }
  };

  const changeDiagnosisResultHandler = () => {};

  let today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();
  today = dd + "/" + mm + "/" + yyyy;

  return (
    <div className="npy-diagnosis">
      <div className="npy-diagnosis__upload-container">
        <div className="npy-diagnosis__upload-container__upload-button">
          {disabledButton ? (
            <Button
              type="primary"
              shape="round"
              icon={<UploadOutlined />}
              size={10}
              disabled
            >
              Upload files
            </Button>
          ) : (
            <Button
              type="primary"
              shape="round"
              icon={<UploadOutlined />}
              size={10}
              onClick={uploadButtonClickHandler}
            >
              Upload files
            </Button>
          )}
        </div>

        {listInputVideo.length === 0 ? (
          <Empty
            className="npy-diagnosis__upload-container__video-list--empty"
            description="No video uploaded"
          />
        ) : (
          <div className="npy-diagnosis__upload-container__video-list">
            {listInputVideo.map((video, index) => (
              <VideoItem
                key={index}
                selected={index === currentVideoSelected ? true : false}
                videoName={video.name}
                inspectClickHandler={showVideoModal}
                clickHandler={() => selectVideo(video.index)}
              />
            ))}
          </div>
        )}

        {isVideoModalVisible && (
          <MiniVideoModal
            closeVideoModalHandler={closeVideoModal}
            videoIndex={listInputVideo[currentVideoSelected].index}
            videoName={listInputVideo[currentVideoSelected].name}
            videoPath={listInputVideo[currentVideoSelected].path}
            videoConvertedPath={
              listInputVideo[currentVideoSelected].convertedPath
            }
          />
        )}

        <div className="npy-diagnosis__upload-container__bottom-button-container">
          <div className="npy-diagnosis__upload-container__bottom-button-container__render-video-button">
            {disabledButton ? (
              <Button
                type="primary"
                shape="round"
                icon={<FundViewOutlined />}
                size={10}
                disabled
              >
                Render video
              </Button>
            ) : (
              <Button
                type="primary"
                shape="round"
                icon={<FundViewOutlined />}
                size={10}
                onClick={diagnoseButtonClickHandler}
              >
                Render video
              </Button>
            )}
          </div>

          <div className="npy-diagnosis__upload-container__bottom-button-container__diagnose-button">
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
      </div>

      <div className="npy-diagnosis__diagnosis-result">
        <div className="npy-diagnosis__diagnosis-result__result-panel">
          <div className="multi--video-diagnosis__diagnosis-result__result-panel__result">
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
            {listPredictionResult.length === 0 ? (
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

          <div className="npy-diagnosis__diagnosis-result__result-panel__date-modified">
            <h2>Date Modified</h2>
            {listPredictionResult.length === 0 ? (
              <Skeleton paragraph={{ rows: 0 }} />
            ) : (
              <h1>{today}</h1>
            )}
          </div>

          <div className="npy-diagnosis__diagnosis-result__result-panel__save-record">
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
              >
                Proceed
              </Button>
            )}
          </div>
        </div>

        {listPredictionResult.length === 0 ? (
          <div className="npy-diagnosis__diagnosis-result__slices-panel--empty">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <div className="npy-diagnosis__diagnosis-result__slices-panel">
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
