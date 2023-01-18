import React from 'react'
import { DAY_COLORS } from '../enums/Days'
import {
  Line
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
const AverageSpentTimePerAge = ({data}) => {

  const getAgeTimeDiffData = () => {
    let labels = new Set()
    Object.keys(data).forEach(day => {
      Object.keys(data[day].ageTimeDiff).forEach(ageTimeDiffLabel => {
        labels.add(ageTimeDiffLabel)
      })
    })

    labels.forEach(label => {
      Object.keys(data).forEach(day => {
        if (!data[day].ageTimeDiff.hasOwnProperty(label))
          data[day].ageTimeDiff[label] = 0
      })
    })

    let ret = {}
    Object.keys(data).forEach(day => {
      data[day].ageTimeDiff = Object.keys(data[day].ageTimeDiff)
        .sort()
        .reduce((accumulator, key) => {
          accumulator[key] = data[day].ageTimeDiff[key];

          return accumulator;
        }, {});
      ret.labels = Object.keys(data[day].ageTimeDiff)
    })

    let datasets = [...Object.keys(data).map(day => {
      return {
        label: `Day - ${day}`,
        data: Object.values(data[day].ageTimeDiff),
        borderColor: DAY_COLORS[day],
        backgroundColor: DAY_COLORS[day]
      }
    })]

    ret.datasets = datasets

    return ret
  }

  const lineChartAgeTimeDiff = {
    labels: getAgeTimeDiffData().labels,
    datasets: getAgeTimeDiffData().datasets,
  };

  return (
    <div style={{ padding: "10px", margin: "10px", textAlign:"center", backgroundColor:"#f5f3f3", borderRadius:"10px" }}>
      <h1>Average spent time per age</h1>
      <Line data={lineChartAgeTimeDiff} />
    </div>
  )
}

export default AverageSpentTimePerAge