import React, { useState, useEffect, useRef } from 'react'
import Button from '@mui/material/Button';
import {
  Line, Doughnut, Bar, getDatasetAtEvent,
  getElementAtEvent,
  getElementsAtEvent,
} from 'react-chartjs-2';
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
  const [filteredData, setFilteredData] = useState([])

  const femaleAndMale = Array(24).fill(0)
  const female = Array(9).fill(0)
  const male = Array(9).fill(0)

  let femaleCount = 0
  let maleCount = 0

  const ages = {}

  const timeDiff = {}

  const [filteration, setFilteration] = useState({})

  useEffect(() => {
    fetch(file)
      .then(res => res.text())
      .then(res => {
        const data = Papa.parse(res, { header: true }).data;
        data.forEach(element => {
          element[COLUMN.DIFF_MINS] = calculateTotalDiffInMins(element)
        })
        setData(data)
        console.log("all data", data)
      })
  }, [file])

  useEffect(() => {

    console.log()
    let newFilteredData = [...data.filter(element => {
      for (let filterationKey in filteration) {
        if (element[filterationKey] != filteration[filterationKey]) {
          return false
        };
      }
      return true
    })]

    setFilteredData(newFilteredData)
  }, [filteration])

  const resetFilter = () => {
    setFilteration({})
    setFilteredData([])
  }

  const calculateTotalDiffInMins = (element) => {
    if (!!element[COLUMN.IN_HOUR]
      && !!element[COLUMN.IN_HOUR]
      && !!element[COLUMN.IN_HOUR]
      && !!element[COLUMN.IN_HOUR]) {
      let diffMin = element[COLUMN.OUT_MIN] - element[COLUMN.IN_MIN]
      let diffHour = element[COLUMN.OUT_HOUR] - element[COLUMN.IN_HOUR]

      let totalDiffInMins = (diffHour * 60) + diffMin

      if (totalDiffInMins >= 0) return Math.max(totalDiffInMins, 1)
      return -1
    }
    return -1
  }

  const calculateAllDataForChartsPrivate = (data) => {
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


      let totalDiffInMins = data[i][COLUMN.DIFF_MINS]
      if (totalDiffInMins != -1) {
        if (timeDiff.hasOwnProperty(totalDiffInMins)) timeDiff[totalDiffInMins]++;
        else timeDiff[totalDiffInMins] = 1
      }
    }
  }

  const calculateAllDataForCharts = () => {
    let processingData = filteredData.length ? filteredData : data;
    calculateAllDataForChartsPrivate(processingData)
  }

  calculateAllDataForCharts()

  let lineChartLables = [];
  for (let i = 1; i <= 9; i++) { lineChartLables.push(i) }

  const lineChart = {
    labels: lineChartLables,
    datasets: [
      {
        label: 'female and male',
        data: femaleAndMale,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'female',
        data: female,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
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
    labels: Object.values(GENDER),
    datasets: [
      {
        labels: "Gender statistics",
        data: [maleCount, femaleCount],
        backgroundColor: [
          'rgba(0, 0,0, 0.5)',
          'rgba(255, 99, 132, 0.5)',

        ],
        borderColor: [
          'rgb(0, 0, 0)',
          'rgb(255, 99, 132)',

        ],
        borderWidth: 1,
      },
    ],
    options: {
      onClick:  (evt, element) => {
        addNewFilteration(element, genderDoughnut)
      }
    }
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
    options: {
      onClick:  (evt, element) => {
        addNewFilteration(element, ageDoughnut)
      }
    }
  };

  const diffTimeBar = {
    labels: Object.keys(timeDiff),
    datasets: [
      {
        label: 'Mins',
        data: Object.values(timeDiff),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
    options: {
      onClick:  (evt, element) => {
        addNewFilteration(element, diffTimeBar)
      }
    }
  };

  const handleButtonFileClick = (file) => {
    setFileName(file)
    setFile(files[file])
  }

  const handleButtonDayClick = (day) => {
    setDay(day)
  }

  ///////////////////////////////////////////

  const genderRef = useRef(null);
  const ageRef = useRef(null);

  const handleBarClick = (event, data) => {
    const { current: chart } = ageRef;

    if (!chart) return;

    addNewFilteration(chart, event, data)
  };

  const handleAgeClick = (event, data) => {
    const { current: chart } = ageRef;

    if (!chart) return;

    addNewFilteration(chart, event, data)
  };

  const handleGenderClick = (event, data) => {
    const { current: chart } = genderRef;

    if (!chart) return;

    addNewFilteration(chart, event, data)
  };


  const addNewFilteration = (element, data) => {
    // let element = getElementAtEvent(chart, event)

    if (!element.length) return;

    const { datasetIndex, index } = element[0];

    let obj = {
      label: data.labels[index],
      value: data.datasets[datasetIndex].data[index]
    }

    console.log(obj)

    setFilteration(filteration => {
      let key = null
      console.log("labels", genderDoughnut.labels)
      if (ageDoughnut.labels.includes(obj.label)) key = COLUMN.AGE
      if (genderDoughnut.labels.includes(obj.label)) key = COLUMN.GENDER
      if (diffTimeBar.labels.includes(obj.label)) key = COLUMN.DIFF_MINS
      return {
        ...filteration,
        [key]: obj.label
      }
    })

    console.log("filteration", filteration)
  }

  return (
    <>
      <AppBarCom />
      <Box sx={{ flexGrow: 1 }}>
        <Grid container direction="row" spacing={2} justifyContent="center" alignItems="center">
          <Grid container direction="row" spacing={2} justifyContent="center" alignItems="center" item xs={8}>
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
          </Grid>
          <Grid container direction="row" spacing={2} justifyContent="center" alignItems="center" item xs={4}>
            <Grid item xs={12} >
              <Button
                size="large"
                variant="contained"
                style={{ width: "50%", margin: "auto", display: "grid" }}
                onClick={resetFilter}
              >Reset filter</Button>
            </Grid>
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
                    <Alert severity="info" size="large">
                      Statistics for file {fileName} and day {day}
                      {
                        Object.keys(filteration).length ? (
                          <>
                            <p>The applied filteration are: </p>
                            {
                              Object.keys(filteration).map(filter => {
                                return <p> {filter}: {filteration[filter]} </p>
                              })
                            }
                          </>
                        ) : null
                      }
                    </Alert>
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px" }}>
                    <Line data={lineChart} />
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px" }}>
                    <Bar
                      // ref={genderRef}
                      data={diffTimeBar}
                      options={diffTimeBar.options}
                      // onClick={(e) => handleBarClick(e, diffTimeBar)}
                    />
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px auto", width: "50%" }}>
                    <Doughnut
                      // ref={genderRef}
                      data={genderDoughnut}
                      options={genderDoughnut.options}
                      // onClick={(e) => handleGenderClick(e, genderDoughnut)}
                    />
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px auto", width: "50%" }}>
                    <Doughnut
                      // ref={ageRef}
                      data={ageDoughnut}
                      options={ageDoughnut.options}
                      // onClick={(e) => handleAgeClick(e, ageDoughnut)}
                    />
                  </div>
                </Grid>
              </>)
          }
        </Grid>
      </Box>
    </>
  )
}
