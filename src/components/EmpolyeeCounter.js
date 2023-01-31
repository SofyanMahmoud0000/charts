import React from 'react'
import {LINE_CHART_COLORS} from "../enums/Colors"
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
        borderColor: LINE_CHART_COLORS[day][0],
        backgroundColor: LINE_CHART_COLORS[day][0],
      })

      ret.push({
        label: `female - ${day}`,
        data: data[day].female,
        borderColor: LINE_CHART_COLORS[day][1],
        backgroundColor: LINE_CHART_COLORS[day][1],
      })

      ret.push({
        label: `male - ${day}`,
        data: data[day].male,
        borderColor: LINE_CHART_COLORS[day][2],
        backgroundColor: LINE_CHART_COLORS[day][2],
      })
    })

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
  return (
    <div style={{ padding: "10px", margin: "10px", textAlign:"center", backgroundColor:"#f5f3f3", borderRadius:"10px" }}>
      <h1>Employee counter</h1>
      <Line data={lineChart} options={lineChart.options}/>
    </div>
  )
}

export default EmpolyeeCounter