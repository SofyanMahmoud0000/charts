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
import { DAYS } from '../enums/Days';
import { COLUMN } from '../enums/Columns';
import { loadCSVFile } from '../services/CSVLoader';
import * as MATH_UTILS from "../Utils/Math"
import { GENDER } from '../enums/Constants';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import FileButtons from './FileButtons';
import DayButtons from './DayButtons';
import AppBarCom from './AppBarCom';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

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

  let femaleAndMale = Array(9).fill(0)
  let female = Array(9).fill(0)
  let male = Array(9).fill(0)

  let femaleCount = 0
  let maleCount = 0

  let ages = {}

  let timeDiff = {}

  const allProcessingData = {}

  const [filteration, setFilteration] = useState({})

  useEffect(() => {
    fetch(file)
      .then(res => res.text())
      .then(res => {
        const data = Papa.parse(res, { header: true }).data;
        data.forEach(element => {
          element[COLUMN.DIFF_MINS] = calculateTotalDiffInMins(element)
        })
        setFilteredData(data)
        setData(data)
      })
  }, [file])

  useEffect(() => {

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
    for (let j = 0; j < Object.values(DAYS).length; j++) {
      let currentDay = Object.values(DAYS)[j]
      if (day && day != currentDay) continue;

      femaleAndMale = Array(9).fill(0)
      female = Array(9).fill(0)
      male = Array(9).fill(0)

      femaleCount = 0
      maleCount = 0

      ages = {}

      timeDiff = {}

      let noDataInThisDay = true

      for (let i = 0; i < data.length; i++) {
        if (currentDay != data[i][COLUMN.DAY]) continue;

        noDataInThisDay = false

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

      let currentProcessingData = {
        femaleAndMale,
        female,
        male,
        maleCount,
        femaleCount,
        ages,
        timeDiff,
      }

      if (!noDataInThisDay) allProcessingData[currentDay] = currentProcessingData
    }
  }


  const calculateAllDataForCharts = () => {
    let processingData = filteredData.length ? filteredData : data;
    calculateAllDataForChartsPrivate(processingData)
  }

  calculateAllDataForCharts()

  let lineChartLables = [];
  for (let i = 1; i <= 9; i++) { lineChartLables.push(i) }

  const getDatasetForLineChart = () => {
    let ret = []
    Object.keys(allProcessingData).forEach(day => {
      ret.push({
        label: `All - ${day}`,
        data: allProcessingData[day].femaleAndMale,
        borderColor: `rgba(
          ${MATH_UTILS.randomColorValue()}
          ,${MATH_UTILS.randomColorValue()} 
          ,${MATH_UTILS.randomColorValue()}
          , 0.2)`,
        backgroundColor: `rgba(
          ${MATH_UTILS.randomColorValue()}
          ,${MATH_UTILS.randomColorValue()} 
          ,${MATH_UTILS.randomColorValue()}
          `,
      })

      ret.push({
        label: `female - ${day}`,
        data: allProcessingData[day].female,
        borderColor: `rgba(
          ${MATH_UTILS.randomColorValue()}
          ,${MATH_UTILS.randomColorValue()} 
          ,${MATH_UTILS.randomColorValue()}
          , 0.2)`,
        backgroundColor: `rgba(
          ${MATH_UTILS.randomColorValue()}
          ,${MATH_UTILS.randomColorValue()} 
          ,${MATH_UTILS.randomColorValue()}
          `,
      })

      ret.push({
        label: `male - ${day}`,
        data: allProcessingData[day].male,
        borderColor: `rgba(
          ${MATH_UTILS.randomColorValue()}
          ,${MATH_UTILS.randomColorValue()} 
          ,${MATH_UTILS.randomColorValue()}
          , 0.2)`,
        backgroundColor: `rgba(
          ${MATH_UTILS.randomColorValue()}
          ,${MATH_UTILS.randomColorValue()} 
          ,${MATH_UTILS.randomColorValue()}
          `,
      })
    })

    console.log("ret", ret)
    return ret;
  }

  const lineChart = {
    labels: lineChartLables,
    datasets: getDatasetForLineChart(),
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
      onClick: (evt, element) => {
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
                  `
        })
      },
    ],
    options: {
      onClick: (evt, element) => {
        addNewFilteration(element, ageDoughnut)
      }
    }
  };

  const getTimeDiffData = () => {
    let labels = new Set()
    Object.keys(allProcessingData).forEach(day => {
      Object.keys(allProcessingData[day].timeDiff).forEach(timeDiffLabel => {
        labels.add(timeDiffLabel)
      })
    })

    labels.forEach(label => {
      Object.keys(allProcessingData).forEach(day => {
        if (!allProcessingData[day].timeDiff.hasOwnProperty(label))
          allProcessingData[day].timeDiff[label] = 0
      })
    })

    let ret = [...Object.keys(allProcessingData).map(day => {
      return {
        label: `Day ${day}`,
        data: Object.values(allProcessingData[day].timeDiff),
        borderColor: `rgba(
          ${MATH_UTILS.randomColorValue()}
          ,${MATH_UTILS.randomColorValue()} 
          ,${MATH_UTILS.randomColorValue()}
          , 0.2)`,
        backgroundColor: `rgba(
          ${MATH_UTILS.randomColorValue()}
          ,${MATH_UTILS.randomColorValue()} 
          ,${MATH_UTILS.randomColorValue()}
          `
      }
    })]

    return ret
  }

  const getTimeDiffLabels = () => {
    let labels = new Set()
    Object.keys(allProcessingData).forEach(day => {
      Object.keys(allProcessingData[day].timeDiff).forEach(timeDiffLabel => {
        labels.add(timeDiffLabel)
      })
    })

    return Array.from(labels)
  }

  const diffTimeBar = {
    labels: getTimeDiffLabels(),
    datasets: [
      ...getTimeDiffData()
    ],
    options: {
      onClick: (evt, element) => {
        addNewFilteration(element, diffTimeBar)
      }
    }
  };


  const getAgeData = () => {
    let labels = new Set()
    Object.keys(allProcessingData).forEach(day => {
      Object.keys(allProcessingData[day].ages).forEach(age => {
        labels.add(age)
      })
    })

    labels.forEach(label => {
      Object.keys(allProcessingData).forEach(day => {
        if (!allProcessingData[day].ages.hasOwnProperty(label))
          allProcessingData[day].ages[label] = 0
      })
    })

    let ret = [...Object.keys(allProcessingData).map(day => {
      return {
        label: `Day ${day}`,
        data: Object.values(allProcessingData[day].ages),
        borderColor: `rgba(
          ${MATH_UTILS.randomColorValue()}
          ,${MATH_UTILS.randomColorValue()} 
          ,${MATH_UTILS.randomColorValue()}
          , 0.2)`,
        backgroundColor: `rgba(
          ${MATH_UTILS.randomColorValue()}
          ,${MATH_UTILS.randomColorValue()} 
          ,${MATH_UTILS.randomColorValue()}
          `
      }
    })]

    return ret
  }

  const getAgeLabels = () => {
    let labels = new Set()
    Object.keys(allProcessingData).forEach(day => {
      Object.keys(allProcessingData[day].ages).forEach(age => {
        labels.add(age)
      })
    })

    return Array.from(labels)
  }

  const ageBar = {
    labels: getAgeLabels(),
    datasets: [
      ...getAgeData()
    ],
    options: {
      onClick: (evt, element) => {
        addNewFilteration(element, ageBar)
      }
    }
  };

  console.log(allProcessingData)

  const getGenderData = () => {
    let ret = [...Object.keys(allProcessingData).map(day => {
      return {
        label: `Day ${day}`,
        data: [allProcessingData[day].femaleCount, allProcessingData[day].maleCount],
        borderColor: `rgba(
          ${MATH_UTILS.randomColorValue()}
          ,${MATH_UTILS.randomColorValue()} 
          ,${MATH_UTILS.randomColorValue()}
          , 0.2)`,
        backgroundColor: `rgba(
          ${MATH_UTILS.randomColorValue()}
          ,${MATH_UTILS.randomColorValue()} 
          ,${MATH_UTILS.randomColorValue()}
          `
      }
    })]

    return ret
  }

  const GenderBar = {
    labels: ["F", "M"],
    datasets: [
      ...getGenderData()
    ],
    options: {
      onClick: (evt, element) => {
        addNewFilteration(element, GenderBar)
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

  const addNewFilteration = (element, data) => {
    // let element = getElementAtEvent(chart, event)

    if (!element.length) return;

    const { datasetIndex, index } = element[0];

    let obj = {
      label: data.labels[index],
      value: data.datasets[datasetIndex].data[index]
    }


    setFilteration(filteration => {
      let key = null
      if (ageDoughnut.labels.includes(obj.label)) key = COLUMN.AGE
      if (genderDoughnut.labels.includes(obj.label)) key = COLUMN.GENDER
      if (diffTimeBar.labels.includes(obj.label)) key = COLUMN.DIFF_MINS
      return {
        ...filteration,
        [key]: obj.label
      }
    })
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
          </Grid>
          <Grid container direction="row" spacing={2} justifyContent="center" alignItems="center" item xs={4}>
            <Grid item xs={12} >
              <Button
                size="large"
                variant="contained"
                color="success"
                style={{ width: "50%", margin: "auto", display: "flex" }}
                onClick={resetFilter}
              >Reset filter <RestartAltIcon style={{display:"inline", margin:"0px 2px"}}/></Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <div style={{}}>
              <DayButtons handleButtonClick={handleButtonDayClick} />
            </div>
          </Grid>
          {
            !fileName || day == null ? (
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
                      Statistics for file {fileName} and {day? ` day ${day}`: `all days`}
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
                      data={diffTimeBar}
                      options={diffTimeBar.options}
                    />
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px" }}>
                    <Bar
                      data={GenderBar}
                      options={GenderBar.options}
                    />
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px" }}>
                    <Bar
                      data={ageBar}
                      options={ageBar.options}
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
