import React from "react";
import "./Dashboard.css";

import { Table, Tag } from "antd";

import SampleCard from "../../components/SampleCard/SampleCard";
import dashboardSlice from "./dashboardSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  currentDataPageSelector,
  allSamplesSelector,
} from "./dashboardSelector";

export default function Dashboard() {
  const dispatch = useDispatch();

  const currentDataPage = useSelector(currentDataPageSelector);

  React.useEffect(() => {
    const getAllSamples = async () => {
      const response = await window.electronAPI.getAllSampleRecords();
      const allSamples = response.result;
      const allProcessedSamples = allSamples.map((element) => {
        const date = new Date(element._doc.diagnosisResult.dateModified);
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        const processedDate = dd + "/" + mm + "/" + yyyy;
        return {
          key: element._doc.id,
          id: element._doc.id,
          sampleName: element._doc.sampleName,
          fullName: element._doc.fullName,
          gender: element._doc.gender,
          age: element._doc.age,
          diagnosisResult_value: element._doc.diagnosisResult.value,
          diagnosisResult_author: element._doc.diagnosisResult.author,
          diagnosisResult_dateModified: processedDate,
        };
      });
      dispatch(dashboardSlice.actions.setAllSamples(allProcessedSamples));
    };

    getAllSamples();
  }, [currentDataPage, dispatch]);

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
      title: "Date modified",
      dataIndex: "diagnosisResult_dateModified",
      key: "diagnosisResult_dateModified",
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
