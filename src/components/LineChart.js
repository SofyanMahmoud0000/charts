import React, { useState, useEffect } from 'react'
import Button from '@mui/material/Button';
import * as Papa from 'papaparse';
import Alert from '@mui/material/Alert';
import { DAYS } from '../enums/Days';
import { COLUMN } from '../enums/Columns';
import { loadCSVFile } from '../services/CSVLoader';
import { GENDER } from '../enums/Constants';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import AppBarCom from './AppBarCom';
import Buttons from './Buttons';

import EmpolyeeCounter from './EmpolyeeCounter';
import SpentTime from './SpentTime';
import AverageSpentTimePerAge from './AverageSpentTimePerAge';
import AverageSpentTimePerGender from './AverageSpentTimePerGender';
import GenderCounter from './GenderCounter';
import AgeCounter from './AgeCounter';

export const LineChart = () => {
  const files = loadCSVFile()

  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [day, setDay] = useState(null)

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])

  const [filteration, setFilteration] = useState({})

  const allProcessingData = {}

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

  const getWeightedAverage = (obj) => {
    let totalWeight = 0
    let totalWeightMulValue = 0

    Object.keys(obj).forEach(value => {
      let weight = obj[value]
      totalWeight += weight
      totalWeightMulValue += value * weight
    })
    
    return Math.round(totalWeightMulValue / totalWeight)
  }

  const calculateAllDataForChartsPrivate = (data) => {
    for (let j = 0; j < Object.values(DAYS).length; j++) {
      let currentDay = Object.values(DAYS)[j]
      if (day && day != currentDay) continue;

      let femaleAndMale = Array(9).fill(0)
      let female = Array(9).fill(0)
      let male = Array(9).fill(0)
      let femaleCount = 0
      let maleCount = 0
      let ages = {}
      let timeDiff = {}
      let ageTimeDiff = {}
      let genderTimeDiff = {}

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

        if (!ageTimeDiff.hasOwnProperty(age)) ageTimeDiff[age] = {}

        let genderKey = isMale ? GENDER.MALE : GENDER.FEMALE
        if (!genderTimeDiff.hasOwnProperty(genderKey)) genderTimeDiff[genderKey] = {}

        maleCount += !!isMale;
        femaleCount += !!isFemale

        let totalDiffInMins = data[i][COLUMN.DIFF_MINS]
        if (totalDiffInMins != -1) {
          if (timeDiff.hasOwnProperty(totalDiffInMins)) timeDiff[totalDiffInMins]++;
          else timeDiff[totalDiffInMins] = 1

          if (ageTimeDiff[age].hasOwnProperty(totalDiffInMins)) ageTimeDiff[age][totalDiffInMins]++;
          else ageTimeDiff[age][totalDiffInMins] = 1

          let genderKey = isMale ? GENDER.MALE : GENDER.FEMALE

          if (genderTimeDiff[genderKey].hasOwnProperty(totalDiffInMins)) genderTimeDiff[genderKey][totalDiffInMins]++;
          else genderTimeDiff[genderKey][totalDiffInMins] = 1
        }
      }

      Object.keys(ageTimeDiff).forEach(age => {
        ageTimeDiff[age] = getWeightedAverage(ageTimeDiff[age])
      })

      Object.keys(genderTimeDiff).forEach(gender => {
        genderTimeDiff[gender] = getWeightedAverage(genderTimeDiff[gender])
      })

      let currentProcessingData = {
        femaleAndMale,
        female,
        male,
        maleCount,
        femaleCount,
        ages,
        timeDiff,
        ageTimeDiff,
        genderTimeDiff
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
  for (let i = 1; i <= 8; i++) { lineChartLables.push(i) }


  const handleButtonFileClick = (file) => {
    setFileName(file)
    setFile(files[file])
  }

  const handleButtonDayClick = (day) => {
    setDay(day)
  }

  const getClickedSegment = (element, data) => {
    if (!element.length) return;

    const { datasetIndex, index } = element[0];

    let obj = {
      label: data.labels[index],
      value: data.datasets[datasetIndex].data[index]
    }

    return obj
  }

  const getAlerts = () => {
    return (
      <Grid item xs={8}>
        <div style={{ margin: "10px" }}>
          <Alert severity="warning" size="large">Please select a file and day to show the data</Alert>
        </div>
      </Grid>
    )
  }

  const isReadyToShowStatistics = () => {
    return fileName && day != null
  }

  const getInfo = () => {
    return (
      <div style={{ margin: "10px" }}>
        <Alert severity="info" size="large">
          Statistics for file {fileName} and {day ? ` day ${day}` : `all days`}
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
    )
  }

  return (
    <>
      <AppBarCom />
      <Box sx={{ flexGrow: 1 }}>
        <Grid container direction="row" spacing={2} justifyContent="center" alignItems="center">
          <Buttons
            handleButtonFileClick={handleButtonFileClick}
            handleButtonDayClick={handleButtonDayClick}
            resetFilter={resetFilter}
          />
          {
            !isReadyToShowStatistics() ? (getAlerts()) : (
              <>
                <Grid item xs={8}>
                  { getInfo() }
                </Grid>
                <Grid item xs={6}>
                  <EmpolyeeCounter data={allProcessingData} />
                </Grid>
                <Grid item xs={6}>
                  <SpentTime data={allProcessingData} getClickedSegment={getClickedSegment} setFilteration={setFilteration} />
                </Grid>
                <Grid item xs={6}>
                  <AverageSpentTimePerAge data={allProcessingData} />
                </Grid>
                <Grid item xs={6}>
                  <AverageSpentTimePerGender data={allProcessingData} />
                </Grid>
                <Grid item xs={6}>
                  <GenderCounter data={allProcessingData} day={day} getClickedSegment={getClickedSegment} setFilteration={setFilteration} />
                </Grid>
                <Grid item xs={6}>
                  <AgeCounter data={allProcessingData} day={day} getClickedSegment={getClickedSegment} setFilteration={setFilteration}/>
                </Grid>
              </>)
          }
        </Grid>
      </Box>
    </>
  )
}
