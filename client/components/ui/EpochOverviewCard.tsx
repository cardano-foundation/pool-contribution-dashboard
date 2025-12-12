/**
 * @file Displays the amount of delegators in specific groups grouped by stake amount via pie chart
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import { RewardDataArray } from '@/types/types';
import React from 'react';
import Big from 'big.js';
import { useEpoch } from '@/app/context/epochContext';
import SimplePieChart from '../forms/SimplePieChart';

/**
 * Props for the EpochOverviewCard component.
 * @interface CardProps
 * @property {string} title - The title displayed at the top of the card.
 * @property {React.ReactNode} children - Child elements to be rendered within the card's content area.
 * @property {string} [className=''] - Optional additional CSS classes for custom styling.
 * @property {string} [height='h-auto'] - Optional CSS class to control the card's height.
 * @property {boolean} [scrollable=false] - If true, enables vertical scrolling for the card's content.
 * @property {RewardDataArray} data - An array of reward data, typically organized by epoch.
 */
interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
  scrollable?: boolean;
  data: RewardDataArray;
}

/**
 * A card component that provides an overview of delegator distribution
 * by stake amount for the current epoch, visualized as a pie chart.
 * It uses the current epoch from context to display relevant data.
 *
 * @param {CardProps} { title, children, className, height, scrollable, data } - Props for the component.
 * @returns {JSX.Element} A React component displaying delegator distribution by stake.
 */
export function EpochOverviewCard({ title, children, className = '', height = 'h-auto', scrollable = false, data }: CardProps) {
  const scrollClasses = scrollable ? 'overflow-y-auto' : '';

  const {currentEpoch} = useEpoch();

  const pieData = [
    { name: '< 100 ₳', value: 0 },
    { name: '100 - 1k ₳', value: 0 },
    { name: '1k - 3k ₳', value: 0 },
    { name: '3k - 10k ₳', value: 0 },
    { name: '10k - 40k ₳', value: 0 },
    { name: '40k - 100k ₳', value: 0 },
    { name: '100k - 300k ₳', value: 0 },
    { name: '300k - 2M ₳', value: 0 },
    { name: '> 2M ₳', value: 0 },
  ];


  //Calculates the values based on epoch
  const dataToDisplay = data[currentEpoch];

  for (let i = 0; i < dataToDisplay.length; i++) {

    if (Big(dataToDisplay[i].stake).lt(Big(100000000))) {

      pieData[0].value += 1;

    } else if (Big(dataToDisplay[i].stake).gte(Big(100000000)) && Big(dataToDisplay[i].stake).lt(Big(1000000000))) {

      pieData[1].value += 1;

    } else if (Big(dataToDisplay[i].stake).gte(Big(1000000000)) && Big(dataToDisplay[i].stake).lt(Big(3000000000))) {

      pieData[2].value += 1;

    } else if (Big(dataToDisplay[i].stake).gte(Big(3000000000)) && Big(dataToDisplay[i].stake).lt(Big(10000000000))) {

      pieData[3].value += 1;

    } else if (Big(dataToDisplay[i].stake).gte(Big(10000000000)) && Big(dataToDisplay[i].stake).lt(Big(40000000000))) {

      pieData[4].value += 1;

    } else if (Big(dataToDisplay[i].stake).gte(Big(40000000000)) && Big(dataToDisplay[i].stake).lt(Big(100000000000))) {

      pieData[5].value += 1;

    } else if (Big(dataToDisplay[i].stake).gte(Big(100000000000)) && Big(dataToDisplay[i].stake).lt(Big(300000000000))) {

      pieData[6].value += 1;

    } else if (Big(dataToDisplay[i].stake).gte(Big(300000000000)) && Big(dataToDisplay[i].stake).lt(Big(2000000000000))) {

      pieData[7].value += 1;

    } else if (Big(dataToDisplay[i].stake).gte(Big(2000000000000))) {

      pieData[8].value += 1;

    }
  }

  let totalDelegator = 0

  for (let i = 0; i < pieData.length; i++) {
    totalDelegator += pieData[i].value
  }
  

  return (
    <div className={`bg-cf-gray dark:bg-cf-text transition-colors duration-200 rounded-2xl 
                      shadow-[0_6px_20px_0_rgba(3,36,67,0.1)]
                      dark:shadow-[0_6px_20px_0px_rgba(23,23,23,0.24)]
                      p-6 ${height} ${scrollClasses} ${className}`}>
      <h3 className="text-3xl ml-2 text-cf-text dark:text-cf-gray transition-colors duration-200">{title}</h3>
      <p className='ml-3 text-gray-400 text-xs'>Total Delegator: {totalDelegator}</p>
      <div className="text-cf-text ml-2">
        
        <SimplePieChart data={pieData}></SimplePieChart>

        {children}
      </div>
    </div>
  );
};