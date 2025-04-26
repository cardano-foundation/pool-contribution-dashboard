import axios, { AxiosResponse } from "axios";

import {EpochParams, PoolHistory, DelegatorStake, TokenomicStats, PoolOwnerHistory} from "@/types/types"; 

//Used to load epoch delegator data from the local express storage and not from KOIOS
export async function fetchDelegatorStakeLocal(params : EpochParams) : Promise<DelegatorStake[]> {
  try {
    const responseDelegatorStakeLocal = await axios.get<DelegatorStake[]>(`${process.env.NEXT_PUBLIC_API_URL}/local-delegator-stake/${params.epoch}`)
    return responseDelegatorStakeLocal.data;
  } catch (error) {
    console.error("API Error:", error);
    return []
  }
}

//Get pool history for calculating member rewards with the pool rewards
export async function fetchPoolHistory(params : EpochParams) : Promise<PoolHistory[]> {
  try {
    const responsePoolHistory = await axios.get<PoolHistory[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pool_history?_pool_bech32=${params.poolId}&_epoch_no=${params.epoch}`)
    return responsePoolHistory.data;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}

export async function fetchPoolHistoryLocal(params : EpochParams) : Promise<PoolHistory[]> {
  try {
    const responsePoolHistory = await axios.get<PoolHistory[]>(`${process.env.NEXT_PUBLIC_API_URL}/local-pool-history/${params.epoch}`)
    return responsePoolHistory.data;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}

//Get delegator stake for calculcating the delegator rewards with their stake
export async function fetchDelegatorStake(params : EpochParams) : Promise<DelegatorStake[]> {

  const allDelegators: DelegatorStake[] = [];
  const limit = 1000;
  let offset = 0;

  try {
    //Has to be fetched on blocks of 1000 entries
    while(true) {
      const responseDelegatorStake = await axios.get<DelegatorStake[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pool_delegators_history?_pool_bech32=${params.poolId}&_epoch_no=${params.epoch}&offset=${offset}&limit=${limit}`);
      const chunk = responseDelegatorStake.data;

      if (chunk.length === 0) {
        break;
      }

      allDelegators.push(...chunk);
      offset += limit;

    }

    return allDelegators;

  } catch (error) {
    console.error("API Error:", error);
    return []
  }
}


//Get toknomic stats for calculating delegator rewards with the ada in circulation
export async function fetchTokenomicStats(params : EpochParams) : Promise<TokenomicStats[]> {
  try {
    const responseTokenomicStats = await axios.get<TokenomicStats[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/totals?_epoch_no=${params.epoch + 1}`);
    return responseTokenomicStats.data;
  } catch (error) {
    console.error("API Error:", error);
    return[];
  }
}

//Get pool owner history to filter the owner from the delegator list
export async function fetchPoolOwnerHistory(params : EpochParams) : Promise<PoolOwnerHistory[]> {

  const data = {
    _pool_bech32_ids: [params.poolId]
  };

  try {
    const responsePoolOwnerHistory = await axios.post<PoolOwnerHistory[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pool_owner_history`, data, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    });
    return responsePoolOwnerHistory.data;
  } catch (error) {
    console.error("API Error:", error);
    return[];
  }
}
