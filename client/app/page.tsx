/**
 * @file Default page.tsx that gets loaded when visiting the site via /
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

"use client";

import { useRewardData, useCalculatorData, useExchangeRate } from "@/components/hooks/useData";
import { OverviewCard } from '@/components/ui/OverviewCard';
import { AllTimeCard } from '@/components/ui/AllTimeCard';
import { CalculatorCard } from '@/components/ui/CalculatorCard';
import { TopDelegatorCard } from '@/components/ui/TopDelegatorCard';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { BurgerMenuButton } from '@/components/ui/BurgerMenuButton';
import { ThemeSwitcherButton } from "@/components/ui/ThemeSwitcherButton";
import { CurrencySwitcherButton } from '@/components/ui/CurrencySwitcherButton'

/**
 * The main Home component for the application dashboard.
 * This component orchestrates data fetching, manages loading and error states,
 * and lays out various UI cards to display information about staking rewards.
 *
 * @returns {JSX.Element} The rendered dashboard page.
 */
export default function Home() {

  const { rewardData, rewardLoading, rewardError } = useRewardData();
  const { calculatorData, calculatorLoading, calculatorError } = useCalculatorData();
  const calculatorCollection = { calculatorData, calculatorLoading, calculatorError };

  //Fetch exchangeRate

  const {rate, rateError, rateLoading} = useExchangeRate();

  if (rewardLoading || rateLoading) return <LoadingSpinner
    bigCircleDiameter={100}
    smallCircleDiameter={90}
    animationDuration={1}
  />;
  if (rewardError) return <p>Error while loading data: {rewardError}</p>;
  if (rateError) return <p>Error while fetching current exchange rate: {rateError}</p>
  if (!rewardData) return <p>No data found</p>;
  if (!rate) return <p>No exchange rate data recieved</p>

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex items-center">
        <BurgerMenuButton></BurgerMenuButton>
        <h1 className="text-3xl text-cf-text dark:text-cf-gray transition-colors duration-200 flex items-center justify-center ml-3 xl:ml-0">Overview</h1>
        <div className="ml-auto">
        </div>
        <div className="ml-auto">
          <div className="flex flex-row gap-3">
            <CurrencySwitcherButton />
            <ThemeSwitcherButton />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 pb-6 xl:grid-cols-3 flex-grow">

        <OverviewCard 
          title="Rewards" 
          className="xl:col-span-1" 
          data={rewardData} 
          exchangeRate={rate}
        >
          {null}
        </OverviewCard>

        <AllTimeCard 
          title="All time" 
          scrollable={true} 
          className="xl:col-span-2" 
          data={rewardData} 
          exchangeRate={rate}
        >
          {null}
        </AllTimeCard>

        <CalculatorCard 
          title="Reward Calculator" 
          className="xl:col-span-1" 
          height="min-h-90"
          data={calculatorCollection} 
          exchangeRate={rate}
        >
          {null}
        </CalculatorCard>

        <TopDelegatorCard 
          title="Top 5 Delegator" 
          scrollable={true} 
          className="xl:col-span-2"
          height="min-h-90"
          data={rewardData} 
          exchangeRate={rate}
        >
          {null}
        </TopDelegatorCard>

      </div>
    </div>
  );
}
