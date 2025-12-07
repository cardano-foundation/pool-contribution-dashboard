/**
 * @file Provides hooks for data: rewardData, CalculatorData, ExchangeRate
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

import { useEffect, useState } from "react";
import { fetchRewardDataForAllEpochs, fetchCalculatorData, fetchCurrentAdaDollarRate } from "@/components/api/apiService";
import { PoolHistory, RewardDataArray, ExchangeValue } from "@/types/types";
import { useConfig } from "@/app/context/configContext";

/**
 * A custom React hook to fetch reward data for all epochs.
 * Manages loading, data, and error states.
 *
 * @returns {{ rewardData: RewardDataArray | null, rewardLoading: boolean, rewardError: string | null }}
 * An object containing:
 * - `rewardData`: The fetched reward data array, or `null` if not yet loaded or an error occurred.
 * - `rewardLoading`: A boolean indicating if the data is currently being fetched.
 * - `rewardError`: A string containing an error message if the fetch failed, otherwise `null`.
 */
export function useRewardData() {

  const { apiURL, localStorageKey } = useConfig();

  const [rewardData, setRewardData] = useState<RewardDataArray | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [rewardLoading, setRewardLoading] = useState(true);

  useEffect(() => {

    //If apiURL and localStorageKey are not yet initialized
    if (!apiURL || !localStorageKey) return;

    fetchRewardDataForAllEpochs(apiURL, localStorageKey)
      .then(setRewardData)
      .catch((err) => setRewardError(err.message))
      .finally(() => setRewardLoading(false));
  }, [apiURL, localStorageKey]);

  return { rewardData, rewardLoading, rewardError };
}

/**
 * A custom React hook to fetch calculator-specific pool history data.
 * Manages loading, data, and error states for the calculator.
 *
 * @returns {{ calculatorData: PoolHistory | null, calculatorError: string | null, calculatorLoading: boolean }}
 * An object containing:
 * - `calculatorData`: The fetched pool history data for the calculator, or `null`.
 * - `calculatorError`: A string containing an error message if the fetch failed, otherwise `null`.
 * - `calculatorLoading`: A boolean indicating if the calculator data is currently being fetched.
 */
export function useCalculatorData() {

  const { apiURL } = useConfig();

  const [calculatorData, setCalculatorData] = useState<PoolHistory | null>(null);
  const [calculatorError, setCalculatorError] = useState<string | null>(null);
  const [calculatorLoading, setCalculatorLoading] = useState(true);

  useEffect(() => {

    //If apiURL is not yet initialized
    if (!apiURL) return;

    fetchCalculatorData(apiURL)
      .then(setCalculatorData)
      .catch((err) => setCalculatorError(err.message))
      .finally(() => setCalculatorLoading(false));
  }, [apiURL]);

  return { calculatorData, calculatorError, calculatorLoading };
}

/**
 * A custom React hook to fetch the current ADA to Dollar exchange rate.
 * Manages loading, data, and error states for the exchange rate.
 *
 * @returns {{ rate: ExchangeValue | null, rateError: string | null, rateLoading: boolean }}
 * An object containing:
 * - `rate`: The fetched exchange rate value, or `null`.
 * - `rateError`: A string containing an error message if the fetch failed, otherwise `null`.
 * - `rateLoading`: A boolean indicating if the exchange rate is currently being fetched.
 */
export function useExchangeRate() {
  const [rate, setRate] = useState<ExchangeValue | null>(null)
  const [rateError, setRateError] = useState<string | null>(null)
  const [rateLoading, setRateLoading] = useState(true)

  useEffect(() => {
    fetchCurrentAdaDollarRate()
      .then(setRate)
      .catch((err) => setRateError(err.message))
      .finally(() => setRateLoading(false))
  }, []);

  return { rate, rateError, rateLoading }
}