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
      Object.keys(data[day].averageSpentTimePerAge).forEach(averageSpentTimePerAgeLabel => {
        labels.add(averageSpentTimePerAgeLabel)
      })
    })

    labels.forEach(label => {
      Object.keys(data).forEach(day => {
        if (!data[day].averageSpentTimePerAge.hasOwnProperty(label))
          data[day].averageSpentTimePerAge[label] = 0
      })
    })

    let ret = {}
    Object.keys(data).forEach(day => {
      data[day].averageSpentTimePerAge = Object.keys(data[day].averageSpentTimePerAge)
        .sort()
        .reduce((accumulator, key) => {
          accumulator[key] = data[day].averageSpentTimePerAge[key];

          return accumulator;
        }, {});
      ret.labels = Object.keys(data[day].averageSpentTimePerAge)
    })

    let datasets = [...Object.keys(data).map(day => {
      return {
        label: `Day - ${day}`,
        data: Object.values(data[day].averageSpentTimePerAge),
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

  return (
    <div style={{ padding: "10px", margin: "10px", textAlign:"center", backgroundColor:"#f5f3f3", borderRadius:"10px" }}>
      <h1>Average spent time per age</h1>
      <Line data={lineChartAgeTimeDiff} options={lineChartAgeTimeDiff.options} />
    </div>
  )
}

export default AverageSpentTimePerAge