/**
 * @file Page.tsx for /epochs. Displays the delegators grouped regarding rewards and count. Also shows a table containing all delegators of the current epoch.
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

"use client";

import { useRewardData, useExchangeRate } from "@/components/hooks/useData";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { BurgerMenuButton } from '@/components/ui/BurgerMenuButton';
import { ThemeSwitcherButton } from "@/components/ui/ThemeSwitcherButton";
import { CurrencySwitcherButton } from '@/components/ui/CurrencySwitcherButton'
import { EpochProvider } from '@/components/ui/EpochProvider';
import EpochControls from '@/components/ui/EpochControls'
import { EpochCounter } from "@/components/ui/EpochCounter";
import { EpochOverviewCard } from "@/components/ui/EpochOverviewCard";
import { EpochRewardOverviewCard } from "@/components/ui/EpochRewardOverviewCard"
import PaginatedDelegatorCard from "@/components/ui/PaginatedDelegatorCard"

/**
 * The `Epochs` component provides a detailed view of Cardano staking rewards,
 * allowing users to navigate through different epochs and see associated data.
 * It handles data fetching, loading states, and error displays, integrating
 * various UI components for a comprehensive user experience.
 *
 * @returns {JSX.Element} A React component displaying epoch-specific reward data.
 */
export default function Epochs() {

  const { rewardData, rewardLoading, rewardError } = useRewardData();

  //Fetch exchangeRate

  const { rate, rateError, rateLoading } = useExchangeRate();

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

      <EpochProvider initialEpoch={rewardData.length - 1} minEpoch={389} maxEpoch={rewardData.length - 1}>
        <div className="mb-6 flex items-center">
          <BurgerMenuButton></BurgerMenuButton>

          <EpochCounter></EpochCounter>
          <div className="ml-auto">
          </div>
          <div className="ml-auto">
            <div className="flex flex-row gap-3">
              <ThemeSwitcherButton />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 pb-8 2xl:mb-4 2xl:pb-0 2xl:grid-cols-[1fr_2fr] flex-grow">

          <EpochOverviewCard className="2xl:col-span-1 h-full" title="Grouped Delegator Count" data={rewardData}>
            {null}
          </EpochOverviewCard>

          <PaginatedDelegatorCard
            scrollable={true}
            className="2xl:col-span-1 2xl:row-span-2 h-full"
            height="min-h-90"
            title="Grouped Rewards"
            data={rewardData}
            exchangeRate={rate}
          >
            {null}
          </PaginatedDelegatorCard>

          <EpochRewardOverviewCard className="2xl:col-span-1 h-full" title="Grouped Rewards" data={rewardData}>
            {null}
          </EpochRewardOverviewCard>

        </div>
        <EpochControls />
      </EpochProvider>

    </div>
  );
}
