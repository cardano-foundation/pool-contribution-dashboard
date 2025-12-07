/**
 * @file Allows fetching specific data that gets accessed via hooks from useData.ts
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

import axios from "axios";

import {ExchangeValue, CachedData, RewardDataArray, PoolHistory} from "@/types/types"; 

/**
 * Fetches reward data for all epochs.
 * It first attempts to load data from local storage. If not found or if the stored data is outdated
 * (based on the current epoch), it fetches new data from the API and caches it in local storage.
 *
 * @returns {Promise<RewardDataArray>} A promise that resolves with the array of reward data.
 * @throws {Error} If `NEXT_PUBLIC_LOCAL_STORAGE_KEY` is not defined or if data loading from the server fails.
 */
export async function fetchRewardDataForAllEpochs(apiURL: string, localStorageKey: string) : Promise<RewardDataArray> {
  try {

    if (!localStorageKey) {
      throw new Error ("No value is defined for naming the local storage in .env!")
    }

    //Fetch epoch to check if localStorage is up to date
    const currentEpoch = (await axios.get<string>(`${apiURL}/api/get-current-epoch`)).data

    //Try to load the reward data from local storage
    //const storedRewardData: string | null = localStorage.getItem(process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY)
    const storedRewardData: string | null = null

    //If not found, fetch new
    if (storedRewardData === null) {

      const rewardDataArray = (await axios.get<RewardDataArray>(`${apiURL}/api/fetch-rewards`)).data

      console.log(rewardDataArray)

      const toStore: CachedData = {
        epoch: currentEpoch,
        payload: rewardDataArray
      }

      //And save it 
      localStorage.setItem(localStorageKey, JSON.stringify(toStore))

      return rewardDataArray

    } else {

      const recievedRewardData: CachedData = JSON.parse(storedRewardData) as CachedData

      console.log(recievedRewardData.epoch)
      console.log(recievedRewardData.payload)

      //If local data is not up to date anymore fetch new
      if (recievedRewardData.epoch !== currentEpoch) {

        const rewardDataArray = (await axios.get<RewardDataArray>(`${apiURL}/api/fetch-rewards`)).data
        const toStore: CachedData = {
          epoch: currentEpoch,
          payload: rewardDataArray
        }

        //And overwrite the old 
        localStorage.setItem(localStorageKey, JSON.stringify(toStore))

        return rewardDataArray

      //If the data is up to date
      } else {

        return recievedRewardData.payload;

      }

    }

  } catch {
    throw new Error ("Could not load data from the Server.")
  }
}

/**
 * Fetches pool history data specifically for the calculator component.
 *
 * @returns {Promise<PoolHistory>} A promise that resolves with the pool history data.
 * @throws {Error} If data loading from the server fails.
 *
 * @todo Rename this function to be more descriptive of what "calculator data" entails.
 */
export async function fetchCalculatorData(apiURL: string): Promise<PoolHistory> {
  try {
    const calculatorData = (await axios.get<PoolHistory>(`${apiURL}/api/get-calculator-data`)).data
    return calculatorData
  } catch {
    throw new Error ("Could not load calculator data from server.")
  }
}

/**
 * Fetches the current exchange rate between Cardano (ADA) and US Dollar (USD) from CoinGecko.
 *
 * @returns {Promise<ExchangeValue>} A promise that resolves with the exchange rate value.
 * @throws {Error} If the exchange rate cannot be fetched (e.g., due to API issues or rate limits).
 *
 * @remarks This function relies on an external API (CoinGecko) and might be subject to rate limits or availability issues.
 */
export async function fetchCurrentAdaDollarRate(): Promise<ExchangeValue> {
  try {
    const currentRate = (await axios.get<ExchangeValue>("https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd")).data
    //console.log("current exchange rate: " + currentRate.cardano.usd)
    return currentRate
  } catch {
    throw new Error("Could not fetch current exchange rate.")
  }
}

