import { useEffect, useState } from "react"
import {DAYS} from '../enums/Days'
import {COLUMN} from "../enums/Columns"
import { GENDER } from "../enums/Constants"

const useGenerateStatisticsData = (filteration, filteredData, data, day, setAllProcessingData) => {
  
  const getWeightedAverage = (obj) => {
    let totalWeight = 0
    let totalWeightMulValue = 0

    Object.keys(obj).forEach(value => {
      let weight = obj[value]
      totalWeight += weight
      totalWeightMulValue += value * weight
    })

    return Math.round(totalWeightMulValue / totalWeight)
  }

  const calculateAllDataForChartsPrivate = (data) => {
    setAllProcessingData({})
    for (let j = 0; j < Object.values(DAYS).length; j++) {
      let currentDay = Object.values(DAYS)[j]
      if (day && day != currentDay) continue;

      let femaleAndMale = Array(9).fill(0)
      let female = Array(9).fill(0)
      let male = Array(9).fill(0)
      let femaleCount = 0
      let maleCount = 0
      let ages = {}
      let spentTime = {}
      let ageTimeDiff = {}
      let genderTimeDiff = {}

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
        if (totalDiffInMins != -1) {
          if (spentTime.hasOwnProperty(totalDiffInMins)) spentTime[totalDiffInMins]++;
          else spentTime[totalDiffInMins] = 1

          if (ageTimeDiff[age].hasOwnProperty(totalDiffInMins)) ageTimeDiff[age][totalDiffInMins]++;
          else ageTimeDiff[age][totalDiffInMins] = 1

          let genderKey = isMale ? GENDER.MALE : GENDER.FEMALE

          if (genderTimeDiff[genderKey].hasOwnProperty(totalDiffInMins)) genderTimeDiff[genderKey][totalDiffInMins]++;
          else genderTimeDiff[genderKey][totalDiffInMins] = 1
        }
      }

      Object.keys(ageTimeDiff).forEach(age => {
        ageTimeDiff[age] = getWeightedAverage(ageTimeDiff[age])
      })

      Object.keys(genderTimeDiff).forEach(gender => {
        genderTimeDiff[gender] = getWeightedAverage(genderTimeDiff[gender])
      })

      let currentProcessingData = {
        femaleAndMale,
        female,
        male,
        maleCount,
        femaleCount,
        ages,
        spentTime,
        ageTimeDiff,
        genderTimeDiff
      }

      if (!noDataInThisDay) setAllProcessingData(data => ({
        ...data,
        [currentDay]: currentProcessingData
      }))
    }
  }

  useEffect(() => {
    let processingData = filteredData.length ? filteredData : data;
    calculateAllDataForChartsPrivate(processingData)
  }, [filteration, filteredData, data, day])

}

export default useGenerateStatisticsData