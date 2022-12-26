import React, { useState, useEffect } from 'react'
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import * as Papa from 'papaparse';
import Alert from '@mui/material/Alert';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { FILES } from '../enums/Files';
import { COLUMN } from '../enums/Columns';
import { loadCSVFile } from '../services/CSVLoader';
import * as MATH_UTILS from "../Utils/Math"
import { GENDER } from '../enums/Constants';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import FileButtons from './FileButtons';
import DayButtons from './DayButtons';
import AppBarCom from './AppBarCom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  BarElement,
  Legend,
  ArcElement
);

export const LineChart = () => {
  const files = loadCSVFile()

  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [day, setDay] = useState(null)

  const [data, setData] = useState([])

  const femaleAndMale = Array(24).fill(0)
  const female = Array(9).fill(0)
  const male = Array(9).fill(0)

  let femaleCount = 0
  let maleCount = 0

  const ages = {}

  const timeDiff = {}

  useEffect(() => {
    fetch(file)
      .then(res => res.text())
      .then(res => {
        const data = Papa.parse(res, { header: true }).data;
        setData(data)
      })
  }, [file])

  for (let i = 0; i < data.length; i++) {
    if (day != data[i][COLUMN.DAY]) continue;
    let hour = data[i][COLUMN.IN_HOUR]
    let isFemale = data[i][COLUMN.GENDER] == GENDER.FEMALE
    let isMale = data[i][COLUMN.GENDER] == GENDER.MALE
    let age = data[i][COLUMN.AGE]
    femaleAndMale[hour - 1] += 1;
    female[hour - 1] += !!isFemale;
    male[hour - 1] += !!isMale;

    if (ages.hasOwnProperty(age)) ages[age]++;
    else ages[age] = 1

    maleCount += !!isMale;
    femaleCount += !!isFemale

    if (!!data[i][COLUMN.IN_HOUR]
      && !!data[i][COLUMN.IN_HOUR]
      && !!data[i][COLUMN.IN_HOUR]
      && !!data[i][COLUMN.IN_HOUR]) {
      let diffMin = data[i][COLUMN.OUT_MIN] - data[i][COLUMN.IN_MIN]
      let diffHour = data[i][COLUMN.OUT_HOUR] - data[i][COLUMN.IN_HOUR]

      let totalDiffInMins = (diffHour * 60) + diffMin

      if (totalDiffInMins >= 0) {
        totalDiffInMins = Math.max(totalDiffInMins, 1)
        if (timeDiff.hasOwnProperty(totalDiffInMins)) timeDiff[totalDiffInMins]++;
        else timeDiff[totalDiffInMins] = 1
      }
    }
  }

  console.log("timeDiff", timeDiff)

  let lineChartLables = [];
  for (let i = 1; i <= 9; i++) { lineChartLables.push(i) }

  const lineChart = {
    labels: lineChartLables,
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


  const genderDoughnut = {
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

  const ageDoughnut = {
    labels: Object.keys(ages),
    datasets: [
      {
        label: '# Ages',
        data: Object.values(ages),
        borderWidth: 1,

        backgroundColor: Object.values(ages).map(_ => {
          return `rgba(
                  ${MATH_UTILS.randomColorValue()}
                  ,${MATH_UTILS.randomColorValue()} 
                  ,${MATH_UTILS.randomColorValue()}
                  , 0.2)`
        })
      },
    ],
  };

  const diffTimeBar = {
    labels: Object.keys(timeDiff),
    datasets: [
      {
        label: 'Mins',
        data: Object.values(timeDiff),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const handleButtonFileClick = (file) => {
    setFileName(file)
    setFile(files[file])
  }

  const handleButtonDayClick = (day) => {
    setDay(day)
  }

  console.log("data", data)

  return (
    <>
    <AppBarCom />
      <Box sx={{ flexGrow: 1 }}>
        <Grid container direction="row" spacing={2} justifyContent="center" alignItems="center">
          <Grid item xs={12}>
            <div style={{}}>
              <FileButtons handleButtonClick={handleButtonFileClick} />
            </div>
          </Grid>
          <Grid item xs={12}>
            <div style={{}}>
              <DayButtons handleButtonClick={handleButtonDayClick} />
            </div>
          </Grid>
          {
            !fileName || !day ? (
              <Grid item xs={8}>
                <div style={{ margin: "10px" }}>
                  <Alert severity="warning" size="large">Please select a file and day to show the data</Alert>
                </div>
              </Grid>

            ) : (
              <>
                <Grid item xs={8}>
                  <div style={{ margin: "10px" }}>
                    <Alert severity="info" size="large">Statistics for file {fileName} and day {day}</Alert>
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px" }}>
                    <Line data={lineChart} />
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px" }}>
                    <Bar data={diffTimeBar} />
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px auto", width: "50%" }}>
                    <Doughnut data={genderDoughnut} />
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px auto", width: "50%" }}>
                    <Doughnut data={ageDoughnut} />
                  </div>
                </Grid>
              </>)
          }
        </Grid>
      </Box>
    </>
  )
}
