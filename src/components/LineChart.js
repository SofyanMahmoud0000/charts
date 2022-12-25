import React, {useState, useEffect} from 'react'
import { Line, Doughnut } from 'react-chartjs-2';
import * as Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { FILES } from '../enums/Files';
import { COLUMN } from '../enums/Columns';
import {loadCSVFile} from "../services/CSVLoader"

import file from "./dataFile.csv"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const LineChart = () => {

  const [allData, setAllData] = useState([])
  let femaleCount = 0
  let maleCount = 0


  const file = require('./dataFile.csv')

  const femaleAndMale = Array(24).fill(0)
  const female = Array(9).fill(0)
  const male = Array(9).fill(0)
  const agesObject = []
  const agesLabels = []
  const agesValues = []
  
  useEffect(() => {
    fetch(file)
      .then(res => res.text())
      .then(res => {
        const allData = Papa.parse(res, { header: true }).data;
        setAllData(allData)
      })
  }, [])

  for(let i = 0; i < allData.length; i++) {
    let hour = allData[i][COLUMN.IN_HOUR]
    let f = allData[i][COLUMN.GENDER] == 'F'
    let m = allData[i][COLUMN.GENDER] == 'M'
    let age = allData[i][COLUMN.AGE]
    femaleAndMale[hour-1] += 1;
    female[hour-1] += !!f;
    male[hour-1] += !!m;

    if(agesObject.hasOwnProperty(age)) agesObject[age]++;
    else agesObject[age] = 1

    maleCount += !!m;
    femaleCount += !!f
  }

  for (const ageLabel in agesObject) {
    let ageValue = agesObject[ageLabel]
    agesLabels.push(ageLabel)
    agesValues.push(ageValue)
  }

  console.log("ages", agesObject)

  let labels = [];
  for(let i = 1; i <= 9; i++) {labels = [...labels, i]}

  const data = {
    labels,
    datasets: [
      {
        label: 'female and male',
        data: femaleAndMale,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'female',
        data: female,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'male',
        data: male,
        borderColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgba(0, 0,0, 0.5)',
      },
    ],
  };


  const data2 = {
    labels: ['Female', 'Male'],
    datasets: [
      {
        label: '# of Female and male',
        data: [femaleCount, maleCount],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          
        ],
        borderWidth: 1,
      },
    ],
  };

  const random = () => {
    return Math.floor(Math.random() * (255 - 0 + 1)) + 0;
  }

  const data3 = {
    labels: agesLabels,
    datasets: [
      {
        label: '# Ages',
        data: agesValues,
        borderWidth: 1,

        backgroundColor: agesLabels.map(_ => `rgba(${random()}, ${random()}, ${random()}, 0.2)`)
      },
    ],
  };

  return (
    <>
      <Line data={data} />
      <div style={{width:"500px", height:"500px", display:"inline-block"}} >
        <Doughnut data={data2} />
      </div>
      <div style={{width:"500px", height:"500px", display:"inline-block"}} >
        <Doughnut data={data3} />
      </div>
    </>
  )
}
