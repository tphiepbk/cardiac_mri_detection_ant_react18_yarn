import React from "react";
import "./Dashboard.css";

import { Table, Tag } from "antd";

import SampleCard from "../../components/SampleCard/SampleCard";
import dashboardSlice from "./dashboardSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  currentDataPageSelector,
  allSamplesSelector,
  triggerLoadAllDataEffectSelector,
} from "./dashboardSelector";

export default function Dashboard() {
  const dispatch = useDispatch();

  const currentDataPage = useSelector(currentDataPageSelector);
  const triggerLoadAllDataEffect = useSelector(triggerLoadAllDataEffectSelector);

  React.useEffect(() => {
    const getAllSamples = async () => {
      const getAllSamplesResponse = await window.electronAPI.getAllSampleRecords();
      console.log(getAllSamplesResponse)
      if (getAllSamplesResponse.result === "FAILED") {
        console.log("Cannot retrieve data");
      } else {
        const allSamples = getAllSamplesResponse.target;
        const allProcessedSamples = allSamples.map((element) => {
          const date = new Date(element.diagnosisResult.dateOfDiagnosis);
          const dd = String(date.getDate()).padStart(2, "0");
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const yyyy = date.getFullYear();
          const processedDate = dd + "/" + mm + "/" + yyyy;
          return {
            key: element.id,
            id: element.id,
            sampleName: element.sampleName,
            fullName: element.fullName,
            gender: element.gender,
            age: element.age,
            diagnosisResult_value: element.diagnosisResult.value,
            diagnosisResult_author: element.diagnosisResult.author,
            diagnosisResult_dateOfDiagnosis: processedDate,
          };
        });
        dispatch(dashboardSlice.actions.setAllSamples(allProcessedSamples));
        dispatch(dashboardSlice.actions.resetCurrentSelectedSample())
      }
    };

    getAllSamples();
  }, [currentDataPage, dispatch, triggerLoadAllDataEffect]);

  const allSamples = useSelector(allSamplesSelector);

  console.log(allSamples);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 200,
      align: "center",
    },
    {
      title: "Sample name",
      dataIndex: "sampleName",
      key: "sampleName",
      align: "center",
    },
    {
      title: "Full name",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
      align: "center",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: 60,
      align: "center",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 80,
      align: "center",
    },
    {
      title: "Result",
      key: "diagnosisResult_value",
      dataIndex: "diagnosisResult_value",
      width: 100,
      align: "center",
      render: (result) => (
        <>
          <Tag color={result === "normal" ? "success" : "error"}>
            {result.toUpperCase()}
          </Tag>
        </>
      ),
    },
    {
      title: "Author",
      dataIndex: "diagnosisResult_author",
      key: "author",
      width: 150,
      align: "center",
    },
    {
      title: "Date of diagnosis",
      dataIndex: "diagnosisResult_dateOfDiagnosis",
      key: "diagnosisResult_dateOfDiagnosis",
      width: 150,
      align: "center",
    },
  ];

  const paginationChangeHandler = (e) => {
    dispatch(dashboardSlice.actions.setCurrentDataPage(e.current));
  };

  const rowSelectHandler = (record) => {
    console.log(record);
    dispatch(dashboardSlice.actions.setCurrentSelectedSample(record));
  };

  return (
    <div className="dashboard">
      <SampleCard />
      <div className="dashboard__sample-table-container">
        <Table
          onRow={(record, _rowIndex) => {
            return {
              onClick: (event) => {
                rowSelectHandler(record);
              },
            };
          }}
          className="dashboard__sample-table"
          columns={columns}
          dataSource={allSamples}
          pagination={{ pageSize: 10 }}
          scroll={{ y: "50vh" }}
          onChange={(e) => paginationChangeHandler(e)}
        />
      </div>
    </div>
  );
}
