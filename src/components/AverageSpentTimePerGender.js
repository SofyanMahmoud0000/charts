import React from 'react'
import { DAY_COLORS } from '../enums/Days'
import { GENDER } from '../enums/Constants';
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
const AverageSpentTimePerGender = ({data}) => {

  const getGenderTimeDiffDataset = () => {
    let ret = {}
    ret.labels = [GENDER.FEMALE, GENDER.MALE]

    let datasets = [...Object.keys(data).map(day => {
      return {
        label: `Day - ${day}`,
        data: [data[day].genderTimeDiff[GENDER.FEMALE], data[day].genderTimeDiff[GENDER.MALE]],
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
  };
  return (
    <div style={{ padding: "10px", margin: "10px", textAlign:"center", backgroundColor:"#f5f3f3", borderRadius:"10px" }}>
      <h1>Average spent time per gender</h1>
      <Line data={lineChartGenderTimeDiff} />
    </div>
  )
}

export default AverageSpentTimePerGender