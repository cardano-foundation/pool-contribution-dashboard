"use client";

import { useState } from "react";

import SearchForm from "@/components/forms/searchForm";
import {fetchDelegatorStakeLocal, fetchDelegatorStake, fetchPoolHistory, fetchTokenomicStats, fetchPoolOwnerHistory} from "@/components/api/apiService";
import { EpochParams, PoolHistory, DelegatorStake, TokenomicStats, PoolOwnerHistory, Delegator} from "@/types/types";
import { calculateRewards } from "@/components/logic/rewardCalculator";

export default function Home() {

  const [data, setData] = useState("");

  const handleSearch = async (filters : EpochParams) => {
    const poolHistory: PoolHistory[] = await fetchPoolHistory(filters);
    const delegatorStake: DelegatorStake[] = await fetchDelegatorStakeLocal(filters);
    const tokenomicStats: TokenomicStats[] = await fetchTokenomicStats(filters);
    const poolOwnerHistory: PoolOwnerHistory[] = await fetchPoolOwnerHistory(filters);

    const rewards: Delegator[] =  calculateRewards(filters, poolHistory, delegatorStake, tokenomicStats, poolOwnerHistory);
    setData(JSON.stringify(rewards));
  } 


  return (
    <div>
      <SearchForm onSearch={handleSearch}/>
      <div>{data}</div>
    </div>
  );
}
