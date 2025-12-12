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
    <div className="flex flex-col h-[100dvh] overflow-hidden">

      <EpochProvider initialEpoch={rewardData.length - 1} minEpoch={389} maxEpoch={rewardData.length - 1}>

        <div className="relative z-30 flex-shrink-0">

          <div className="absolute inset-0 bg-cf-gray dark:bg-cf-text transition-colors duration-200" />

          {/* Points in the Button Bar */}
          <div
            className="absolute inset-0 transition-opacity duration-200 z-10"
            style={{
              backgroundImage: 'url(/images/Dots.svg)',
              backgroundRepeat: 'repeat',
              backgroundPosition: '12px 12px',
              opacity: 'var(--svg-opacity)'
            }}
          />

          <div className="relative z-20 flex items-center px-4 md:px-6 xl:px-8 pt-4 xl:pt-6 mb-4 gap-4">

            <div className="flex items-center flex-shrink-0">
              <BurgerMenuButton></BurgerMenuButton>
              <EpochCounter></EpochCounter>
            </div>

            <div className="flex-grow justify-center min-w-0 hidden md:flex">
               <EpochControls />
            </div>

            <div className="flex-shrink-0 ml-auto">
              <div className="flex flex-row gap-3">
                <ThemeSwitcherButton />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto overscroll-contain">

          <div className="min-h-full flex flex-col px-4 md:px-6 xl:px-8 pt-4 pb-6 xl:pb-8">

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_2fr] xl:grid-rows-[1fr_1fr] flex-grow h-auto xl:min-h-[550px]">

              <EpochOverviewCard
                className="xl:col-span-1"
                height="h-auto xl:h-full"
                title="Grouped Delegator Count"
                data={rewardData}
              >
                {null}
              </EpochOverviewCard>

              <PaginatedDelegatorCard
                scrollable={true}
                className="xl:col-start-2 xl:row-span-2"
                height="h-auto xl:h-full"
                title="Grouped Rewards"
                data={rewardData}
                exchangeRate={rate}
              >
                {null}
              </PaginatedDelegatorCard>

              <EpochRewardOverviewCard
                className="xl:col-span-1"
                height="h-auto xl:h-full"
                title="Grouped Rewards"
                data={rewardData}
              >
                {null}
              </EpochRewardOverviewCard>
            </div>
          </div>
        </div>

        <div className="relative z-30 flex-shrink-0 md:hidden">
            
            {/* For card coverage */}
            <div className="absolute inset-0 bg-cf-gray dark:bg-cf-text transition-colors duration-200" />
            
            {/* Layer for dots */}
            <div
                className="absolute inset-0 transition-opacity duration-200 z-10"
                style={{
                backgroundImage: 'url(/images/Dots.svg)',
                backgroundRepeat: 'repeat',
                backgroundPosition: '12px 12px',
                opacity: 'var(--svg-opacity)'
                }}
            />

            {/* Controls Content */}
            <div className="relative z-20 flex justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))">
                <EpochControls />
            </div>
        </div>

      </EpochProvider>
    </div>
  );
}
