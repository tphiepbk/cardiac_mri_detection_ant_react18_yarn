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
} from "./npyDiagnosisSelector";

import { Button, Descriptions, Empty, Skeleton, Tabs, List } from "antd";

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
import SavePatientRecordModal from "../../components/SavePatientRecordModal/SavePatientRecordModal";

import "./NPYDiagnosis.css";
import alertsSlice from "../../components/Alerts/alertsSlice";
import progressBarSlice from "../../components/ProgressBar/progressBarSlice";
import appSlice from "../../appSlice";
import { appProcessRunningSelector } from "../../appSelector";

const NO_DIAGNOSIS_RESULT = 0;
const NORMAL_DIAGNOSIS_RESULT = 1;
const ABNORMAL_DIAGNOSIS_RESULT = 2;

export default function VideoDiagnosis() {
  const dispatch = useDispatch();

  const npyFileNames = useSelector(npyFileNamesSelector);
  const videoPath = useSelector(videoPathSelector);
  const videoBboxPath = useSelector(videoBboxPathSelector);
  const videoMetadata = useSelector(videoMetadataSelector);
  const disabledButton = useSelector(disabledButtonSelector);
  const diagnosisResult = useSelector(diagnosisResultSelector);
  const listSlices = useSelector(listSlicesSelector);

  const processRunning = useSelector(appProcessRunningSelector);

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isSavePatientRecordModalVisible, setIsSavePatientRecordModalVisible] =
    React.useState(false);
  const [currentSliceSelected, setCurrentSliceSelected] = React.useState(0);

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

  const tabChangeHandler = (key) => {
    console.log("Changed to tab ", key);
  };

  const getVideoMetadata = async (videoName, videoPath) => {
    const response = await window.electronAPI.getFileMetadata(videoPath);
    console.log(response);

    if (response.result === "SUCCESS") {
      const { format_long_name, duration } = response.target.format;
      const { height, width } = response.target.streams[0];

      dispatch(
        npyDiagnosisSlice.actions.setVideoMetadata({
          name: videoName,
          format: format_long_name,
          duration: duration,
          height: height,
          width: width,
        })
      );
    }
  };

  const uploadNpySample = async () => {
    const response = await window.electronAPI.openNpySampleDialog();
    console.log(response);

    if (response.result === "SUCCESS") {
      const {
        npyFileNames,
        videoName,
        videoInputPath,
        videoOutputPath,
        videoInputBboxPath,
        videoOutputBboxPath,
      } = response;

      dispatch(
        npyDiagnosisSlice.actions.setVideoPath({
          avi: videoInputPath,
          mp4: videoOutputPath,
        })
      );
      dispatch(
        npyDiagnosisSlice.actions.setVideoBboxPath({
          avi: videoInputBboxPath,
          mp4: videoOutputBboxPath,
        })
      );

      getVideoMetadata(videoName, videoInputPath);
      dispatch(npyDiagnosisSlice.actions.setNpyFileNames(npyFileNames));
    } else {
      triggerUploadFailedAlert();
    }

    dispatch(appSlice.actions.enableAppInteractive());
  };

  const uploadButtonClickHandler = () => {
    dispatch(npyDiagnosisSlice.actions.setNpyFileNames([]));
    dispatch(npyDiagnosisSlice.actions.setNpyFilePaths([]));

    dispatch(
      npyDiagnosisSlice.actions.setVideoPath({
        avi: "",
        mp4: "",
      })
    );

    dispatch(
      npyDiagnosisSlice.actions.setVideoBboxPath({
        avi: "",
        mp4: "",
      })
    );

    dispatch(
      npyDiagnosisSlice.actions.setVideoMetadata({
        name: "",
        format: "",
        duration: "",
        height: "",
        width: "",
      })
    );

    if (!processRunning) {
      dispatch(progressBarSlice.actions.clearProgressBar());
    }

    dispatch(npyDiagnosisSlice.actions.setDiagnosisResult(NO_DIAGNOSIS_RESULT));

    dispatch(appSlice.actions.disableAppInteractive());

    uploadNpySample();
  };

  const diagnoseNpySample = async () => {
    dispatch(npyDiagnosisSlice.actions.setDiagnosisResult(NO_DIAGNOSIS_RESULT));

    dispatch(progressBarSlice.actions.clearProgressBar());

    dispatch(npyDiagnosisSlice.actions.disableButton());

    dispatch(appSlice.actions.setProcessRunning(true));

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
    dispatch(npyDiagnosisSlice.actions.setListSlices(crawledListSlices));

    dispatch(appSlice.actions.setProcessRunning(false));

    if (predictionResponse.result === "SUCCESS") {
      triggerTaskSucceededAlert();

      if (parseFloat(predictionResponse.value) >= 0.5) {
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
            {videoBboxPath.mp4 === "" ? (
              <Tabs.TabPane tab="Cropped" key="2" disabled />
            ) : (
              <Tabs.TabPane tab="Cropped" key="2">
                <ReactPlayer
                  className="npy-diagnosis__upload-container__video"
                  url={videoBboxPath.mp4}
                  playing={true}
                  controls={true}
                  loop={true}
                />
              </Tabs.TabPane>
            )}
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
                onClick={showSavePatientRecordModal}
              >
                Proceed
              </Button>
            )}

            {isSavePatientRecordModalVisible && (
              <SavePatientRecordModal
                diagnosisResult={diagnosisResult}
                closeSavePatientRecordModalHandler={
                  closeSavePatientRecordModalHandler
                }
                sampleName={videoMetadata.name}
                savePatientRecord={savePatientRecord}
                today={today}
              />
            )}
          </div>
        </div>

        {diagnosisResult === NO_DIAGNOSIS_RESULT ? (
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
