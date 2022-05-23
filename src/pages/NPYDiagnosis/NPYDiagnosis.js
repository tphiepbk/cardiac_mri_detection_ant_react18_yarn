import React from "react";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import npyDiagnosisSlice from "./npyDiagnosisSlice";
import {
  videoPathSelector,
  videoMetadataSelector,
  diagnosisResultSelector,
  disabledButtonSelector,
  listSlicesSelector,
  npyFileNamesSelector,
  videoBboxPathSelector,
  samplePathSelector,
  concatenatedSamplePathSelector,
} from "./npyDiagnosisSelector";

import { Button, Descriptions, Empty, Skeleton, Tabs, List, Input } from "antd";

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

import "./NPYDiagnosis.css";
import {
  triggerTaskSucceededAlert,
  triggerTaskFailedAlert,
  triggerNoVideoAlert,
  triggerSaveSampleRecordFailedAlert,
  triggerSaveSampleRecordSucceededAlert,
  triggerTaskRunningAlert,
  triggerUploadFailedAlert,
} from "../../components/Alerts/alertsTrigger";
import progressBarSlice from "../../components/ProgressBar/progressBarSlice";
import mainPageSlice from "../MainPage/mainPageSlice";
import { appProcessRunningSelector } from "../MainPage/mainPageSelector";

const NO_DIAGNOSIS_RESULT = 0;
const NORMAL_DIAGNOSIS_RESULT = 1;
const ABNORMAL_DIAGNOSIS_RESULT = 2;

const AVERAGE_DIAGNOSE_TIME = 400;

export default function VideoDiagnosis() {
  const dispatch = useDispatch();

  const concatenatedSamplePath = useSelector(concatenatedSamplePathSelector);
  const samplePath = useSelector(samplePathSelector);
  const npyFileNames = useSelector(npyFileNamesSelector);
  const videoPath = useSelector(videoPathSelector);
  const videoBboxPath = useSelector(videoBboxPathSelector);
  const videoMetadata = useSelector(videoMetadataSelector);
  const disabledButton = useSelector(disabledButtonSelector);
  const diagnosisResult = useSelector(diagnosisResultSelector);
  const listSlices = useSelector(listSlicesSelector);

  const processRunning = useSelector(appProcessRunningSelector);

  const [sliceCardModalVisible, setSliceCardModalVisible] =
    React.useState(false);
  const [isSaveSampleRecordModalVisible, setIsSaveSampleRecordModalVisible] =
    React.useState(false);
  const [currentSliceSelected, setCurrentSliceSelected] = React.useState(0);

  const toggleSliceCardModal = () => {
    setSliceCardModalVisible((prevState) => !prevState);
  };

  const selectSlice = (sliceNumber) => {
    console.log(`Selected slice ${sliceNumber}`);
    setCurrentSliceSelected(sliceNumber);
    toggleSliceCardModal();
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

  const tabChangeHandler = (key) => {
    console.log("Changed to tab ", key);
  };

  const uploadNpySample = async () => {
    dispatch(mainPageSlice.actions.enableLoadingScreen());
    const response = await window.electronAPI.uploadNpySample();
    console.log(response);
    dispatch(mainPageSlice.actions.disableLoadingScreen());

    if (response.result === "SUCCESS") {
      const {
        concatenatedNpySamplePath,
        samplePath,
        sampleName,
        npyFileNames,
        croppedNpyFilePaths,
        sliceTempPaths,
        croppedSliceTempPaths,
        videoInputPath,
        videoOutputPath,
        videoBboxInputPath,
        videoBboxOutputPath,
        videoMetadata: { format_long_name, duration, height, width },
      } = response.target;

      dispatch(
        npyDiagnosisSlice.actions.setConcatenatedSamplePath(
          concatenatedNpySamplePath
        )
      );

      dispatch(npyDiagnosisSlice.actions.setSamplePath(samplePath));

      dispatch(
        npyDiagnosisSlice.actions.setVideoPath({
          avi: videoInputPath,
          mp4: videoOutputPath,
        })
      );
      dispatch(
        npyDiagnosisSlice.actions.setVideoBboxPath({
          avi: videoBboxInputPath,
          mp4: videoBboxOutputPath,
        })
      );

      dispatch(
        npyDiagnosisSlice.actions.setVideoMetadata({
          name: sampleName,
          format: format_long_name,
          duration: duration,
          height: height,
          width: width,
        })
      );

      const numberOfSlices = sliceTempPaths.length;

      const crawledListSlices = [];

      for (let sliceNumber = 0; sliceNumber < numberOfSlices; sliceNumber++) {
        crawledListSlices.push({
          sliceNumber,
          sliceImageUrl: sliceTempPaths[sliceNumber][0],
          sliceFrames: sliceTempPaths[sliceNumber],
          sliceCroppedFrames: croppedSliceTempPaths[sliceNumber],
          sliceVideoPath: "https://youtu.be/DBJmR6hx2UE",
          sliceCroppedNpyPath: croppedNpyFilePaths[sliceNumber],
        });
      }

      console.log("crawledListSlices = ", crawledListSlices);

      dispatch(npyDiagnosisSlice.actions.setListSlices(crawledListSlices));

      dispatch(npyDiagnosisSlice.actions.setNpyFileNames(npyFileNames));
    } else {
      triggerUploadFailedAlert();
    }

    dispatch(mainPageSlice.actions.enableAppInteractive());
  };

  const uploadButtonClickHandler = () => {
    dispatch(npyDiagnosisSlice.actions.clearContent());

    if (!processRunning) {
      dispatch(progressBarSlice.actions.clearProgressBar());
    }

    dispatch(mainPageSlice.actions.disableAppInteractive());

    uploadNpySample();
  };

  const diagnoseNpySample = async () => {
    dispatch(npyDiagnosisSlice.actions.setDiagnosisResult(NO_DIAGNOSIS_RESULT));

    dispatch(progressBarSlice.actions.clearProgressBar());

    dispatch(npyDiagnosisSlice.actions.disableButton());

    dispatch(mainPageSlice.actions.setProcessRunning(true));

    const progressBarRunning = setInterval(() => {
      dispatch(progressBarSlice.actions.increaseProgressBar());
    }, AVERAGE_DIAGNOSE_TIME);

    const predictionResponse = await window.electronAPI.classifyNpySample(
      concatenatedSamplePath
    );
    console.log(predictionResponse);

    clearInterval(progressBarRunning);
    dispatch(progressBarSlice.actions.completeProgressBar());

    /*
    const crawledListSlices = [];
    for (let i = 0; i <= 10; i++) {
      crawledListSlices.push({
        sliceNumber: i,
        sliceImageUrl:
          "https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png",
        sliceVideoPath: "https://youtu.be/DBJmR6hx2UE",
      });
    }
    dispatch(npyDiagnosisSlice.actions.setListSlices(crawledListSlices));
    */

    dispatch(mainPageSlice.actions.setProcessRunning(false));

    if (predictionResponse.result === "SUCCESS") {
      triggerTaskSucceededAlert();

      if (parseFloat(predictionResponse.target) >= 0.5) {
        dispatch(
          npyDiagnosisSlice.actions.setDiagnosisResult(
            ABNORMAL_DIAGNOSIS_RESULT
          )
        );
      } else {
        dispatch(
          npyDiagnosisSlice.actions.setDiagnosisResult(NORMAL_DIAGNOSIS_RESULT)
        );
      }
    } else {
      triggerTaskFailedAlert();
    }

    dispatch(npyDiagnosisSlice.actions.enableButton());
  };

  const diagnoseButtonClickHandler = () => {
    if (processRunning) {
      triggerTaskRunningAlert();
    } else if (videoPath.avi === "") {
      triggerNoVideoAlert();
    } else {
      diagnoseNpySample();
    }
  };

  let today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
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
              Upload NPY sample
            </Button>
          ) : (
            <Button
              type="primary"
              shape="round"
              icon={<UploadOutlined />}
              size={10}
              onClick={uploadButtonClickHandler}
            >
              Upload NPY sample
            </Button>
          )}
        </div>

        <Input
          className="npy-diagnosis__upload-container__npy-path-box"
          placeholder={samplePath === "" ? "N/A" : samplePath}
          disabled
        />

        <div className="npy-diagnosis__upload-container__list-npy-video-wrapper">
          <div className="npy_diagnosis_upload-container__npy-list--overflow">
            <List
              className={`npy_diagnosis_upload-container__npy-list${
                npyFileNames.length === 0 ? "--empty" : ""
              }`}
              size="small"
              dataSource={npyFileNames}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </div>

          <Tabs
            defaultActiveKey="1"
            type="card"
            size="small"
            onChange={tabChangeHandler}
            className="npy-diagnosis__upload-container__tabs-container"
          >
            <Tabs.TabPane tab="Original" key="1">
              {videoPath.mp4 === "" ? (
                <Empty
                  className="npy-diagnosis__upload-container__no-video"
                  description="No video uploaded"
                />
              ) : (
                <ReactPlayer
                  className="npy-diagnosis__upload-container__video"
                  url={videoPath.mp4}
                  playing={true}
                  controls={true}
                  loop={true}
                />
              )}
            </Tabs.TabPane>
            <Tabs.TabPane tab="Cropped" key="2">
              {videoBboxPath.mp4 === "" ? (
                <Empty
                  className="npy-diagnosis__upload-container__no-video"
                  description="No video uploaded"
                />
              ) : (
                <ReactPlayer
                  className="npy-diagnosis__upload-container__video"
                  url={videoBboxPath.mp4}
                  playing={true}
                  controls={true}
                  loop={true}
                />
              )}
            </Tabs.TabPane>
          </Tabs>
        </div>

        <Descriptions
          className="npy-diagnosis__upload-container__video-description"
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

        <div className="npy-diagnosis__upload-container__diagnose-button">
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

      <div className="npy-diagnosis__diagnosis-result">
        <div className="npy-diagnosis__diagnosis-result__result-panel">
          <div className="npy-diagnosis__diagnosis-result__result-panel__result">
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

          <div className="npy-diagnosis__diagnosis-result__result-panel__date-modified">
            <h2>Date Modified</h2>
            {diagnosisResult === NO_DIAGNOSIS_RESULT ? (
              <Skeleton paragraph={{ rows: 0 }} />
            ) : (
              <h1>{today}</h1>
            )}
          </div>

          <div className="npy-diagnosis__diagnosis-result__result-panel__save-record">
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

        {
          /* diagnosisResult === NO_DIAGNOSIS_RESULT */ listSlices.length ===
          0 ? (
            <div className="npy-diagnosis__diagnosis-result__slices-panel--empty">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            <div className="npy-diagnosis__diagnosis-result__slices-panel">
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

              {sliceCardModalVisible && (
                <SliceCardModal
                  closeModalHandler={toggleSliceCardModal}
                  sliceNumber={currentSliceSelected}
                  sliceFrames={listSlices[currentSliceSelected].sliceFrames}
                  sliceCroppedFrames={
                    listSlices[currentSliceSelected].sliceCroppedFrames
                  }
                  sliceVideoPath={
                    listSlices[currentSliceSelected].sliceVideoPath
                  }
                  sliceCroppedNpyPath={
                    listSlices[currentSliceSelected].sliceCroppedNpyPath
                  }
                />
              )}
            </div>
          )
        }
      </div>
    </div>
  );
}
