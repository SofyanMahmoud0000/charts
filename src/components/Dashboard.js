import React, { useState, useEffect } from 'react'
import * as Papa from 'papaparse';
import Alert from '@mui/material/Alert';
import { COLUMN } from '../enums/Columns';
import { loadCSVFile } from '../services/CSVLoader';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import AppBarCom from './AppBarCom';
import Buttons from './Buttons';

import EmpolyeeCounter from './EmpolyeeCounter';
import SpentTime from './SpentTime';
import AverageSpentTimePerAge from './AverageSpentTimePerAge';
import AverageSpentTimePerGender from './AverageSpentTimePerGender';
import GenderCounter from './GenderCounter';
import AgeCounter from './AgeCounter';

import useGenerateStatisticsData from '../hooks/useGenerateStatisticsData';

export const Dashboard = () => {
  const files = loadCSVFile()

  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [day, setDay] = useState(null)

  const [isLoading, setIsLoading] = useState(false)

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])

  const [filteration, setFilteration] = useState({})

  const [allProcessingData, setAllProcessingData] = useState({})

  useEffect(() => {
    setIsLoading(true)
    fetch(file)
      .then(res => res.text())
      .then(res => {
        const data = Papa.parse(res, { header: true }).data;
        data.forEach(element => {
          element[COLUMN.DIFF_MINS] = calculateTotalDiffInMins(element)
        })
        setFilteredData(data)
        setData(data)
        setIsLoading(false)
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
  }, [filteration, data])

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

  useGenerateStatisticsData(filteration, filteredData, data, day, setAllProcessingData)

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
          <Alert severity="warning" size="large">
            There is no data for the selected file, day and filterations
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
    )
  }

  const isReadyToShowStatistics = () => {
    return fileName 
            && day != null 
            && Object.keys(allProcessingData).length > 0
            // && !isLoading
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
            !isReadyToShowStatistics() ? (
              isLoading? (<CircularProgress />): getAlerts()
              ) : (
              <>
                <Grid item xs={8}>
                  {getInfo()}
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
                  <AgeCounter data={allProcessingData} day={day} getClickedSegment={getClickedSegment} setFilteration={setFilteration} />
                </Grid>
              </>)
          }
        </Grid>
      </Box>
    </>
  )
}
