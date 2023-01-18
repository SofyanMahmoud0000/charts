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
      Object.keys(data[day].timeDiff).forEach(timeDiffLabel => {
        labels.add(timeDiffLabel)
      })
    })

    return Array.from(labels)
  }

  const getTimeDiffData = () => {
    let labels = new Set()
    Object.keys(data).forEach(day => {
      Object.keys(data[day].timeDiff).forEach(timeDiffLabel => {
        labels.add(timeDiffLabel)
      })
    })

    labels.forEach(label => {
      Object.keys(data).forEach(day => {
        if (!data[day].timeDiff.hasOwnProperty(label))
          data[day].timeDiff[label] = 0
      })
    })

    let ret = [...Object.keys(data).map(day => {
      return {
        label: `Day ${day}`,
        data: Object.values(data[day].timeDiff),
        borderColor: DAY_COLORS[day],
        backgroundColor: DAY_COLORS[day]
      }
    })]

    return ret
  }

  const diffTimeBar = {
    labels: getTimeDiffLabels(),
    datasets: [
      ...getTimeDiffData()
    ],
    options: {
      onClick: (evt, element) => {
        addFilteration(getClickedSegment(element, diffTimeBar))
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