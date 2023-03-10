import React from 'react'
import { DAY_COLORS } from '../enums/Days';
import { COLUMN } from "../enums/Columns"
import {
  Bar
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

const SpentTime = ({ data, getClickedSegment, setFilteration }) => {

  const addFilteration = (obj) => {
    setFilteration(filteration => {
      let key = null
      if (diffTimeBar.labels.includes(obj.label)) key = COLUMN.DIFF_MINS
      return {
        ...filteration,
        [key]: obj.label
      }
    })
  }

  const getTimeDiffLabels = () => {
    let labels = new Set()
    Object.keys(data).forEach(day => {
      Object.keys(data[day].spentTime).forEach(spentTimeLabel => {
        labels.add(spentTimeLabel)
      })
    })

    return Array.from(labels)
  }

  const getTimeDiffData = () => {
    let labels = new Set()
    Object.keys(data).forEach(day => {
      Object.keys(data[day].spentTime).forEach(spentTimeLabel => {
        labels.add(spentTimeLabel)
      })
    })

    labels.forEach(label => {
      Object.keys(data).forEach(day => {
        if (!data[day].spentTime.hasOwnProperty(label))
          data[day].spentTime[label] = 0
      })
    })


    let ret = {}
    Object.keys(data).forEach(day => {
      data[day].spentTime = Object.keys(data[day].spentTime)
        .sort()
        .reduce((accumulator, key) => {
          accumulator[key] = data[day].spentTime[key];

          return accumulator;
        }, {});
      ret.labels = Object.keys(data[day].spentTime)
    })

    let datasets = [...Object.keys(data).map(day => {
      return {
        label: `Day ${day}`,
        data: Object.values(data[day].spentTime),
        borderColor: DAY_COLORS[day],
        backgroundColor: DAY_COLORS[day]
      }
    })]

    ret.datasets = datasets;
    return ret
  }

  const diffTimeBar = {
    labels: getTimeDiffData().labels,
    datasets: getTimeDiffData().datasets,
    options: {
      onClick: (evt, element) => {
        addFilteration(getClickedSegment(element, diffTimeBar))
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

  return (
    <div style={{ padding: "10px", margin: "10px", textAlign: "center", backgroundColor: "#f5f3f3", borderRadius: "10px" }}>
      <h1>Spent time</h1>
      <Bar
        data={diffTimeBar}
        options={diffTimeBar.options}
      />
    </div>
  )
}

export default SpentTime