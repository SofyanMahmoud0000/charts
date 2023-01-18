import React from 'react'
import { DAY_COLORS } from '../enums/Days'
import { COLORS } from "../enums/Colors"
import { GENDER } from '../enums/Constants';
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

const GenderCounter = ({ data, day, getClickedSegment, setFilteration }) => {

  const addFilteration = (obj) => {
    setFilteration(filteration => {
      let key = null
      if (genderDoughnut.labels.includes(obj.label) || GenderBar.labels.includes(obj.label)) 
        key = COLUMN.GENDER
      return {
        ...filteration,
        [key]: obj.label
      }
    })
  }

  const getGenderData = () => {
    let ret = {}
    ret.labels = [GENDER.FEMALE, GENDER.MALE]

    let datasets = [...Object.keys(data).map(day => {
      return {
        label: `Day ${day}`,
        data: [data[day].femaleCount, data[day].maleCount],
        borderColor: DAY_COLORS[day],
        backgroundColor: DAY_COLORS[day]
      }
    })]

    ret.datasets = datasets
    return ret
  }

  const GenderBar = {
    labels: getGenderData().labels,
    datasets: getGenderData().datasets,
    options: {
      onClick: (evt, element) => {
        addFilteration(getClickedSegment(element, GenderBar))
      }
    }
  };

  const genderDoughnut = {
    labels: [GENDER.FEMALE, GENDER.MALE],
    datasets: [
      {
        labels: "Gender statistics",
        data: [data[day]?.femaleCount || 0, data[day]?.maleCount || 0],
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
        addFilteration(getClickedSegment(element, genderDoughnut))
      }
    }
  };
  return (
    <>
      <div style={{ padding: "10px", margin: "10px", textAlign: "center", backgroundColor: "#f5f3f3", borderRadius: "10px" }}>
        <h1>Gender count</h1>
        {
          day == 0 ? (
            <Bar
              data={GenderBar}
              options={GenderBar.options}
            />
          ) : (
            <div style={{ width: "50%", margin: "auto" }}>
              <Doughnut
                data={genderDoughnut}
                options={genderDoughnut.options}
              />
            </div>
          )
        }
      </div>
    </>
  )
}

export default GenderCounter