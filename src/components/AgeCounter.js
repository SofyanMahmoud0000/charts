import React from 'react'
import { DAY_COLORS } from '../enums/Days'
import * as MATH_UTILS from "../Utils/Math"
import { COLUMN } from "../enums/Columns"
import {
  Bar, Doughnut
} from 'react-chartjs-2';
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

const AgeCounter = ({ data, day, getClickedSegment, setFilteration }) => {

  const addFilteration = (obj) => {
    setFilteration(filteration => {
      let key = null
      if (ageDoughnut.labels.includes(obj.label) || ageBar.labels.includes(obj.label))
        key = COLUMN.AGE
      return {
        ...filteration,
        [key]: obj.label
      }
    })
  }

  const getAgeData = () => {
    let labels = new Set()
    Object.keys(data).forEach(day => {
      Object.keys(data[day].ages).forEach(age => {
        labels.add(age)
      })
    })

    labels.forEach(label => {
      Object.keys(data).forEach(day => {
        if (!data[day].ages.hasOwnProperty(label))
          data[day].ages[label] = 0
      })
    })

    let ret = {}
    Object.keys(data).forEach(day => {
      data[day].ages = Object.keys(data[day].ages)
        .sort()
        .reduce((accumulator, key) => {
          accumulator[key] = data[day].ages[key];

          return accumulator;
        }, {});
      ret.labels = Object.keys(data[day].ages)
    })

    let datasets = [...Object.keys(data).map(day => {
      return {
        label: `Day ${day}`,
        data: Object.values(data[day].ages),
        borderColor: DAY_COLORS[day],
        backgroundColor: DAY_COLORS[day]
      }
    })]

    ret.datasets = datasets
    return ret;
  }

  const ageDoughnut = {
    labels: Object.keys(data[day]?.ages || []),
    datasets: [
      {
        label: '# Ages',
        data: Object.values(data[day]?.ages || []),
        borderWidth: 1,

        backgroundColor: Object.values(data[day]?.ages || []).map(_ => {
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
        addFilteration(getClickedSegment(element, ageDoughnut))
      }
    }
  };

  const ageBar = {
    labels: getAgeData().labels,
    datasets: getAgeData().datasets,
    options: {
      onClick: (evt, element) => {
        addFilteration(getClickedSegment(element, ageBar))
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
            text: 'Age'
          }
        }
      }
    }
  };

  return (
    <>
      <div style={{ padding: "10px", margin: "10px", textAlign: "center", backgroundColor: "#f5f3f3", borderRadius: "10px" }}>
        <h1>Age count</h1>
        {
          Array.isArray(day) ? (
            <Bar
              data={ageBar}
              options={ageBar.options}
            />
          ) : (
            <div style={{ width: "50%", margin: "auto" }}>
              <Doughnut
                data={ageDoughnut}
                options={ageDoughnut.options}
              />
            </div>
          )
        }
      </div>
    </>
  )
}

export default AgeCounter