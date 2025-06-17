import axios, { AxiosResponse } from "axios";

import {ExchangeValue, CachedData, RewardDataArray, PoolHistory} from "@/types/types"; 

//In here you should be able to fetch the whole reward data list for all epochs and also use filtering functions in the app.

export async function fetchRewardDataForAllEpochs() : Promise<RewardDataArray> {
  try {

    if (!process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY) {
      throw new Error ("No value is defined for naming the local storage in .env!")
    }

    //Fetch epoch to check if localStorage is up to date
    const currentEpoch = (await axios.get<string>(`${process.env.NEXT_PUBLIC_API_URL}/api/get-current-epoch`)).data

    console.log(currentEpoch)

    //Try to load the reward data from local storage
    //const storedRewardData: string | null = localStorage.getItem(process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY)
    const storedRewardData: string | null = null

    //TODO!! Something goes wrong here
    console.log(typeof storedRewardData)

    //If not found, fetch new
    if (storedRewardData === null) {

      const rewardDataArray = (await axios.get<RewardDataArray>(`${process.env.NEXT_PUBLIC_API_URL}/api/fetch-rewards`)).data

      console.log(rewardDataArray)

      const toStore: CachedData = {
        epoch: currentEpoch,
        payload: rewardDataArray
      }

      //And save it 
      localStorage.setItem(process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY, JSON.stringify(toStore))

      return rewardDataArray

    } else {

      let recievedRewardData: CachedData = JSON.parse(storedRewardData) as CachedData

      console.log(recievedRewardData.epoch)
      console.log(recievedRewardData.payload)

      //If local data is not up to date anymore fetch new
      if (recievedRewardData.epoch !== currentEpoch) {

        const rewardDataArray = (await axios.get<RewardDataArray>(`${process.env.NEXT_PUBLIC_API_URL}/api/fetch-rewards`)).data
        const toStore: CachedData = {
          epoch: currentEpoch,
          payload: rewardDataArray
        }

        //And overwrite the old 
        localStorage.setItem(process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY, JSON.stringify(toStore))

        return rewardDataArray

      //If the data is up to date
      } else {

        return recievedRewardData.payload;

      }

    }

  } catch (error) {
    throw new Error ("Could not load data from the Server.")
  }
}

//TODO!! renaming
export async function fetchCalculatorData(): Promise<PoolHistory> {
  try {
    const calculatorData = (await axios.get<PoolHistory>(`${process.env.NEXT_PUBLIC_API_URL}/api/get-calculator-data`)).data
    return calculatorData
  } catch (error) {
    throw new Error ("Could not load calculator data from server.")
  }
}

export async function fetchCurrentAdaDollarRate(): Promise<ExchangeValue> {
  try {
    const currentRate = (await axios.get<ExchangeValue>("https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd")).data
    return currentRate
  } catch (error) {
    throw new Error("Could not fetch current exchange rate.")
  }
}

