import React, { useState, useEffect, useRef } from 'react'
import Button from '@mui/material/Button';
import {
  Line, Doughnut, Bar, getDatasetAtEvent,
  getElementAtEvent,
  getElementsAtEvent,
} from 'react-chartjs-2';
import {LINE_CHART_COLORS} from "../enums/Colors"
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
import { DAY_COLORS } from '../enums/Days';
import { COLUMN } from '../enums/Columns';
import { loadCSVFile } from '../services/CSVLoader';
import * as MATH_UTILS from "../Utils/Math"
import { GENDER, SPENT_TIME_LIMIT } from '../enums/Constants';
import { COLORS } from '../enums/Colors';

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

  let ageTimeDiff = {}

  let genderTimeDiff = {}

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
      if (Array.isArray(currentDay)) continue;
      if (!Array.isArray(day) && day != currentDay) continue;
      if (Array.isArray(day) && !day.includes(currentDay)) continue;

      femaleAndMale = Array(9).fill(0)
      female = Array(9).fill(0)
      male = Array(9).fill(0)

      femaleCount = 0
      maleCount = 0

      ages = {}

      timeDiff = {}

      ageTimeDiff = {}

      genderTimeDiff = {}

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
        if (totalDiffInMins != -1 && totalDiffInMins <= SPENT_TIME_LIMIT) {
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
        let minsMulWeight = 0
        let weight = 0

        Object.keys(ageTimeDiff[age]).forEach(mins => {
          weight += ageTimeDiff[age][mins]
          minsMulWeight += mins * ageTimeDiff[age][mins]
        })

        ageTimeDiff[age] = Math.round(minsMulWeight / weight)
      })

      Object.keys(genderTimeDiff).forEach(gender => {
        let minsMulWeight = 0
        let weight = 0

    

        Object.keys(genderTimeDiff[gender]).forEach(mins => {
          weight += genderTimeDiff[gender][mins]
          minsMulWeight += mins * genderTimeDiff[gender][mins]
        })

        genderTimeDiff[gender] = Math.round(minsMulWeight / weight)
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

  const getDatasetForLineChart = () => {
    let ret = []
    Object.keys(allProcessingData).forEach(day => {
      ret.push({
        label: `All - ${day}`,
        data: allProcessingData[day].femaleAndMale,
        borderColor: LINE_CHART_COLORS[day][0],
        backgroundColor: LINE_CHART_COLORS[day][0],
      })

      ret.push({
        label: `female - ${day}`,
        data: allProcessingData[day].female,
        borderColor: LINE_CHART_COLORS[day][1],
        backgroundColor: LINE_CHART_COLORS[day][1],
      })

      ret.push({
        label: `male - ${day}`,
        data: allProcessingData[day].male,
        borderColor: LINE_CHART_COLORS[day][2],
        backgroundColor: LINE_CHART_COLORS[day][2],
      })
    })

    console.log("ret", ret)
    return ret;
  }

  const lineChart = {
    labels: lineChartLables,
    datasets: getDatasetForLineChart(),
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: 'Employee count'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time (hour)'
          }
        }
      }
    }
  };


  const genderDoughnut = {
    labels: Object.values(GENDER),
    datasets: [
      {
        labels: "Gender statistics",
        data: [allProcessingData[day]?.femaleCount || 0, allProcessingData[day]?.maleCount || 0],
        backgroundColor: [
          COLORS.COLOR_2,
          COLORS.COLOR_1,

        ],
        borderColor: [
          COLORS.COLOR_2,
          COLORS.COLOR_1,

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
    labels: Object.keys(allProcessingData[day]?.ages || []),
    datasets: [
      {
        label: '# Ages',
        data: Object.values(allProcessingData[day]?.ages || []),
        borderWidth: 1,

        backgroundColor: Object.values(allProcessingData[day]?.ages || []).map(_ => {
          return `rgba(
                  ${MATH_UTILS.randomColorValue()}
                  ,${MATH_UTILS.randomColorValue()} 
                  ,${MATH_UTILS.randomColorValue()}
                  ,0.5 `
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

    let ret = {}
    Object.keys(allProcessingData).forEach(day => {
      allProcessingData[day].timeDiff = Object.keys(allProcessingData[day].timeDiff)
        .sort()
        .reduce((accumulator, key) => {
          accumulator[key] = allProcessingData[day].timeDiff[key];

          return accumulator;
        }, {});
      ret.labels = Object.keys(allProcessingData[day].timeDiff)
    })

    let datasets = [...Object.keys(allProcessingData).map(day => {
      return {
        label: `Day ${day}`,
        data: Object.values(allProcessingData[day].timeDiff),
        borderColor: DAY_COLORS[day],
        backgroundColor: DAY_COLORS[day]
      }
    })]

    ret.datasets = datasets;
    return ret
  }

  const getAgeTimeDiffDataset = () => {
    let labels = new Set()
    Object.keys(allProcessingData).forEach(day => {
      Object.keys(allProcessingData[day].ageTimeDiff).forEach(ageTimeDiffLabel => {
        labels.add(ageTimeDiffLabel)
      })
    })

    labels.forEach(label => {
      Object.keys(allProcessingData).forEach(day => {
        if (!allProcessingData[day].ageTimeDiff.hasOwnProperty(label))
          allProcessingData[day].ageTimeDiff[label] = 0
      })
    })

    let ret = {}
    Object.keys(allProcessingData).forEach(day => {
      allProcessingData[day].ageTimeDiff = Object.keys(allProcessingData[day].ageTimeDiff)
        .sort()
        .reduce((accumulator, key) => {
          accumulator[key] = allProcessingData[day].ageTimeDiff[key];

          return accumulator;
        }, {});
      ret.labels = Object.keys(allProcessingData[day].ageTimeDiff)
    })


    console.log("ageTimeDiff", allProcessingData[day]?.ageTimeDiff)
    console.log("labels", Array.from(labels))


    let datasets = [...Object.keys(allProcessingData).map(day => {
      return {
        label: `Day - ${day}`,
        data: Object.values(allProcessingData[day].ageTimeDiff),
        borderColor: DAY_COLORS[day],
        backgroundColor: DAY_COLORS[day]
      }
    })]

    ret.datasets = datasets

    return ret
  }

  const lineChartAgeTimeDiff = {
    labels: getAgeTimeDiffDataset().labels,
    datasets: getAgeTimeDiffDataset().datasets,
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: 'Average spent time'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Age'
          }
        }
      }
    }
  };


  const getGenderTimeDiffDataset = () => {
    let ret = {}
    ret.labels = [GENDER.FEMALE, GENDER.MALE]

    let datasets = [...Object.keys(allProcessingData).map(day => {
      return {
        label: `Day - ${day}`,
        data: [allProcessingData[day].genderTimeDiff[GENDER.FEMALE], allProcessingData[day].genderTimeDiff[GENDER.MALE]],
        borderColor: DAY_COLORS[day],
        backgroundColor: DAY_COLORS[day]
      }
    })]

    ret.datasets = datasets

    return ret
  }

  const lineChartGenderTimeDiff = {
    labels: getGenderTimeDiffDataset().labels,
    datasets: getGenderTimeDiffDataset().datasets,
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: 'Average spent time'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Gender'
          }
        }
      }
    }
  };

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
    labels: getTimeDiffData().labels,
    datasets: getTimeDiffData().datasets,
    options: {
      onClick: (evt, element) => {
        addNewFilteration(element, diffTimeBar)
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Count of people'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Spent time'
          }
        }
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

    let ret = {}
    Object.keys(allProcessingData).forEach(day => {
      allProcessingData[day].ages = Object.keys(allProcessingData[day].ages)
        .sort()
        .reduce((accumulator, key) => {
          accumulator[key] = allProcessingData[day].ages[key];

          return accumulator;
        }, {});
      ret.labels = Object.keys(allProcessingData[day].ages)
    })

    let datasets = [...Object.keys(allProcessingData).map(day => {
      return {
        label: `Day ${day}`,
        data: Object.values(allProcessingData[day].ages),
        borderColor: DAY_COLORS[day],
        backgroundColor: DAY_COLORS[day]
      }
    })]

    ret.datasets = datasets;
    return ret
  }

  const ageBar = {
    labels: getAgeData().labels,
    datasets: getAgeData().datasets,
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: 'Count of people'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Age'
          }
        }
      },
      onClick: (evt, element) => {
        addNewFilteration(element, ageBar)
      },
    }
  };

  console.log(allProcessingData)

  const getGenderData = () => {
    let ret = [...Object.keys(allProcessingData).map(day => {
      return {
        label: `Day ${day}`,
        data: [allProcessingData[day].femaleCount, allProcessingData[day].maleCount],
        borderColor: DAY_COLORS[day],
        backgroundColor: DAY_COLORS[day]
      }
    })]

    return ret
  }

  const GenderBar = {
    labels: Object.values(GENDER),
    datasets: [
      ...getGenderData()
    ],
    options: {
      onClick: (evt, element) => {
        addNewFilteration(element, GenderBar)
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Count of people'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Gender'
          }
        }
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
                style={{ width: "50%", margin: "auto", display: "flex", backgroundColor: COLORS.COLOR_1 }}
                onClick={resetFilter}
              >Reset filter <RestartAltIcon style={{ display: "inline", margin: "0px 2px" }} /></Button>
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
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px", textAlign: "center", backgroundColor: "#f5f3f3", borderRadius: "10px" }}>
                    <h1>Employee counter</h1>
                    <Line data={lineChart} options={lineChart.options} />
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px", textAlign: "center", backgroundColor: "#f5f3f3", borderRadius: "10px" }}>
                    <h1>Spent time</h1>
                    <Bar
                      data={diffTimeBar}
                      options={diffTimeBar.options}
                    />
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px", textAlign: "center", backgroundColor: "#f5f3f3", borderRadius: "10px" }}>
                    <h1>Average spent time per age</h1>
                    <Line data={lineChartAgeTimeDiff} options={lineChartAgeTimeDiff.options} />
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px", textAlign: "center", backgroundColor: "#f5f3f3", borderRadius: "10px" }}>
                    <h1>Average spent time per gender</h1>
                    <Line data={lineChartGenderTimeDiff} options={lineChartGenderTimeDiff.options} />
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div style={{ padding: "10px", margin: "10px", textAlign: "center", backgroundColor: "#f5f3f3", borderRadius: "10px" }}>
                    <h1>Gender counter</h1>
                    {
                      Array.isArray(day) ? (
                          <Bar
                            data={GenderBar}
                            options={GenderBar.options}
                          />
                      ) : (
                        <div style={{margin: "auto", width: "50%" }}>
                          <Doughnut
                            data={genderDoughnut}
                            options={genderDoughnut.options}
                          />
                        </div>
                      )
                    }
                  </div>
                </Grid>
                <Grid item xs={6}>
                <div style={{ padding: "10px", margin: "10px", textAlign: "center", backgroundColor: "#f5f3f3", borderRadius: "10px" }}>
                    <h1>Age counter</h1>
                  {
                    Array.isArray(day) ? (
                        <Bar
                          data={ageBar}
                          options={ageBar.options}
                        />
                    ) : (
                      <div style={{margin: "auto", width: "50%" }}>
                        <Doughnut
                          data={ageDoughnut}
                          options={ageDoughnut.options}
                        />
                      </div>
                    )
                  }
                  </div>
                </Grid>
              </>)
          }
        </Grid>
      </Box>
    </>
  )
}
