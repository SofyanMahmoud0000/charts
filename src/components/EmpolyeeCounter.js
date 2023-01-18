import React from 'react'
import {DAY_COLORS} from "../enums/Days"
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
const EmpolyeeCounter = ({data}) => {

  let lineChartLables = [];
  for (let i = 1; i <= 8; i++) { lineChartLables.push(i) }

  const getDatasetForLineChart = () => {
    let ret = []
    Object.keys(data).forEach(day => {
      ret.push({
        label: `All - ${day}`,
        data: data[day].femaleAndMale,
        borderColor: DAY_COLORS[day],
        backgroundColor: DAY_COLORS[day],
      })

      ret.push({
        label: `female - ${day}`,
        data: data[day].female,
        borderColor: DAY_COLORS[day],
        borderDash: [2, 2],
        backgroundColor: DAY_COLORS[day],
      })

      ret.push({
        label: `male - ${day}`,
        data: data[day].male,
        borderColor: DAY_COLORS[day],
        borderDash: [10, 10],
        backgroundColor: DAY_COLORS[day],
      })
    })

    return ret;
  }

  const lineChart = {
    labels: lineChartLables,
    datasets: getDatasetForLineChart(),
  };
  return (
    <div style={{ padding: "10px", margin: "10px", textAlign:"center", backgroundColor:"#f5f3f3", borderRadius:"10px" }}>
      <h1>Employee counter</h1>
      <Line data={lineChart} />
    </div>
  )
}

export default EmpolyeeCounter