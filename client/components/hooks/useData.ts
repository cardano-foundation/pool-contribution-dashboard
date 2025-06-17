import { useEffect, useState } from "react";
import { fetchRewardDataForAllEpochs, fetchCalculatorData } from "@/components/api/apiService";
import { PoolHistory, RewardData, RewardDataArray } from "@/types/types";

export function useRewardData() {
  const [rewardData, setRewardData] = useState<RewardDataArray | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [rewardLoading, setRewardLoading] = useState(true);

  useEffect(() => {
    fetchRewardDataForAllEpochs()
      .then(setRewardData)
      .catch((err) => setRewardError(err.message))
      .finally(() => setRewardLoading(false));
  }, []);

  return { rewardData, rewardLoading, rewardError };
}

export function useCalculatorData() {
  const [calculatorData, setCalculatorData] = useState<PoolHistory | null>(null);
  const [calculatorError, setCalculatorError] = useState<string | null>(null);
  const [calculatorLoading, setCalculatorLoading] = useState(true);

  useEffect(() => {
    fetchCalculatorData()
      .then(setCalculatorData)
      .catch((err) => setCalculatorError(err.message))
      .finally(() => setCalculatorLoading(false));
  }, []);

  return { calculatorData, calculatorError, calculatorLoading };
}