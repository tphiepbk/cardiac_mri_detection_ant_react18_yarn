import React from "react";
import "./Dashboard.css"

import { Table, Tag } from 'antd';

import PatientCard from '../../components/PatientCard/PatientCard'

export default function Dashboard() {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Result',
      key: 'result',
      dataIndex: 'result',
      render: result => (
        <>
          <Tag color={result === 'normal' ? 'success' : 'error'}>
            {result.toUpperCase()}
          </Tag>
        </>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: status => (
        <>
          <Tag color={status === 'confirmed' ? 'geekblue' : 'volcano'}>
            {status.toUpperCase()}
          </Tag>
        </>
      ),
    },
    {
      title: 'Confirmed By',
      dataIndex: 'confirmed_by',
      key: 'confirmed_by',
    },
    {
      title: 'Date Modified',
      dataIndex: 'date_modified',
      key: 'date_modified',
    },
  ];

  const dataSample = {
    key: '',
    id: 0,
    name: 'John Brown',
    age: 32,
    gender: 'Male',
    address: 'New York No. 1 Lake Park',
    result: 'normal',
    status: 'confirmed',
    confirmed_by: 'tphiepbk',
    date_modified: '30/03/2022'
  }

  const data = [];

  let today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = today.getFullYear();
  today = dd + '/' + mm + '/' + yyyy;

  for (let i = 0 ;  i <= 100 ; i++) {
    data.push({
      ...dataSample,
      key: `${i}`,
      id: i,
      date_modified: today
    })
  }

  return (
    <div className="dashboard">
      <PatientCard />
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} scroll={{ y: "47vh" }} className="dashboard__patient-table"/>
    </div>
  )  
}