/**
 * @file Displays the combined rewards from all delegators per epoch in a bar chart
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import React, { use } from 'react';
import SimpleBarChart from '@/components/forms/simpleBarChart'
import { RewardDataArray, BarChartData, ExchangeValue } from '@/types/types';
import Big from 'big.js';
import { useCurrency } from '@/app/context/currencyContext';
import { calculateValueWithExchangeRate } from '../logic/currencyCalculator';

/**
 * Props for the AllTimeCard component.
 * @interface CardProps
 * @property {string} title - The title displayed at the top of the card.
 * @property {React.ReactNode} children - Child elements to be rendered within the card's content area.
 * @property {string} [className=''] - Optional additional CSS classes for custom styling.
 * @property {string} [height='h-auto'] - Optional CSS class to control the card's height.
 * @property {boolean} [scrollable=false] - If true, enables vertical scrolling for the card's content.
 * @property {RewardDataArray} data - An array of reward data, typically organized by epoch.
 * @property {ExchangeValue} exchangeRate - The current exchange rate for currency conversions.
 */
interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
  scrollable?: boolean;
  data: RewardDataArray;
  exchangeRate: ExchangeValue
}

/**
 * A card component that displays the total rewards per epoch over time in a bar chart.
 * It aggregates reward data for each epoch and allows currency conversion (ADA or USD)
 * based on the global currency context.
 *
 * @param {CardProps} { title, children, className, height, scrollable, data, exchangeRate } - Props for the component.
 * @returns {JSX.Element} A React component displaying epoch rewards over time.
 */
export function AllTimeCard({ title, children, className = '', height = 'h-auto', scrollable = false, data, exchangeRate }: CardProps) {
  const scrollClasses = scrollable ? 'overflow-y-auto' : '';

  const { currency } = useCurrency();

  let delegatorEpoch = data[data.length - 1]

  let epochData: BarChartData[] = [];

  //Calculate the total reward for every epoch and bring it in a form, that the graph can read
  for (let i = 0; i < data.length; i++) {
    if (data[i] === null) {
      continue;
    }

    let addedReward = Big(0)

    for (let x = 0; x < data[i].length; x++) {
      addedReward = addedReward.add(data[i][x].reward)
    }

    //Currency change
    if (currency === "ada") {
      epochData.push({ name: String(i), epoch: i, reward: addedReward.div(1000000).round(2, Big.roundHalfUp).toNumber() })
    } else if (currency === "dollar") {

      let dollarReward = calculateValueWithExchangeRate(exchangeRate.cardano.usd, addedReward.div(1000000))

      epochData.push({ name: String(i), epoch: i, reward: dollarReward.toNumber() })
    }



  }

  console.log(epochData)

  return (
    <div className={`bg-cf-gray dark:bg-cf-text transition-colors duration-200 rounded-2xl 
                      shadow-[0_14px_50px_0_rgba(3,36,67,0.1)] 
                      dark:shadow-[0_14px_50px_0px_rgba(23,23,23,0.24)]
                      p-6 ${height} ${scrollClasses} ${className}`}>
      <h3 className="text-3xl ml-2 text-cf-text dark:text-cf-gray transition-colors duration-200">{title}</h3>
      <p className='ml-2 mb-6 text-gray-400 text-xs'>Reward/Epoch</p>
      <div className="text-cf-text dark:text-cf-gray transition-colors duration-200">
        <SimpleBarChart values={epochData} exchangeRate={exchangeRate}></SimpleBarChart>
        {children}
      </div>
    </div>
  );
};