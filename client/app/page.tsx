"use client";

import SimpleLineGraph from "@/components/forms/simpleLineGraph";
import {useRewardData, useCalculatorData} from "@/components/hooks/useData";
import OverviewCard from '@/components/ui/OverviewCard';
import AllTimeCard from '@/components/ui/AllTimeCard';
import CallculatorCard from '@/components/ui/CalculatorCard';
import TopDelegatorCard from '@/components/ui/TopDelegatorCard';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { BurgerMenuButton } from '@/components/ui/BurgerMenuButton';

export default function Home() {

  const { rewardData, rewardLoading, rewardError } = useRewardData();
  const {calculatorData, calculatorLoading, calculatorError} = useCalculatorData();
  const calculatorCollection = {calculatorData, calculatorLoading, calculatorError}

  if (rewardLoading) return <LoadingSpinner
            bigCircleDiameter={100}
            smallCircleDiameter={90}
            animationDuration={1}
          />;
  if (rewardError) return <p>Error while loading data: {rewardError}</p>;
  if (!rewardData) return <p>No data found</p>;
   
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex">
        <BurgerMenuButton></BurgerMenuButton>
        <h1 className="text-3xl text-cf-text flex items-center justify-center ml-3 2xl:ml-0">Overview</h1>
      </div>
      <div className="grid grid-cols-1 gap-6 pb-8 2xl:pb-0 2xl:grid-cols-3 flex-grow">

        <OverviewCard title="Rewards" className="2xl:col-span-1" data={rewardData}>
          {null}
        </OverviewCard>

        <AllTimeCard title="All time" scrollable={true} className="2xl:col-span-2" data={rewardData}>
          {null}
        </AllTimeCard>

        <CallculatorCard title="Reward Calculator" className="2xl:col-span-1" height="min-h-90" data={calculatorCollection}>
          {null}
        </CallculatorCard>

        <TopDelegatorCard title="Top 5 Delegator" scrollable={true} className="2xl:col-span-2" height="min-h-90" data={rewardData}>
          {null}
        </TopDelegatorCard>

      </div>
    </div>
  );
}
