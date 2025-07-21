/**
 * @file Displays the grouped rewards of the epoch selected in the epoch context via a pie chart
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import { ExchangeValue, RewardDataArray } from '@/types/types';
import React from 'react';
import Big from 'big.js';
import { useCurrency } from '@/app/context/currencyContext'
import { calculateValueWithExchangeRate } from '../logic/currencyCalculator';
import { useEpoch } from '@/app/context/epochContext';
import SimplePieChart from '../forms/simplePieChart';

/**
 * Props for the EpochRewardOverviewCard component.
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
 * A card component that provides an overview of epoch rewards,
 * categorized by delegator stake ranges, displayed as a pie chart.
 * It uses the current epoch from context to display relevant data.
 *
 * @param {CardProps} { title, children, className, height, scrollable, data } - Props for the component.
 * @returns {JSX.Element} A React component displaying epoch reward distribution.
 */
export function EpochRewardOverviewCard({ title, children, className = '', height = 'h-auto', scrollable = false, data }: CardProps) {
    const scrollClasses = scrollable ? 'overflow-y-auto' : '';

    const { currency } = useCurrency();
    const { currentEpoch } = useEpoch();

    let pieData = [
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
    
    let totalReward = Big(0);

    //Calculates the values based on epoch
    const dataToDisplay = data[currentEpoch];

    for (let i = 0; i < dataToDisplay.length; i++) {

        totalReward = totalReward.add(Big(dataToDisplay[i].reward))

        if (Big(dataToDisplay[i].stake).lt(Big(100000000))) {

            pieData[0].value = Number(Big(pieData[0].value).add(Big(dataToDisplay[i].reward).div(1000000).round(2, 1)));

        } else if (Big(dataToDisplay[i].stake).gte(Big(100000000)) && Big(dataToDisplay[i].stake).lt(Big(1000000000))) {

            pieData[1].value = Number(Big(pieData[1].value).add(Big(dataToDisplay[i].reward).div(1000000).round(2, 1)));

        } else if (Big(dataToDisplay[i].stake).gte(Big(1000000000)) && Big(dataToDisplay[i].stake).lt(Big(3000000000))) {

            pieData[2].value = Number(Big(pieData[2].value).add(Big(dataToDisplay[i].reward).div(1000000).round(2, 1)));

        } else if (Big(dataToDisplay[i].stake).gte(Big(3000000000)) && Big(dataToDisplay[i].stake).lt(Big(10000000000))) {

            pieData[3].value = Number(Big(pieData[3].value).add(Big(dataToDisplay[i].reward).div(1000000).round(2, 1)));

        } else if (Big(dataToDisplay[i].stake).gte(Big(10000000000)) && Big(dataToDisplay[i].stake).lt(Big(40000000000))) {

            pieData[4].value = Number(Big(pieData[4].value).add(Big(dataToDisplay[i].reward).div(1000000).round(2, 1)));

        } else if (Big(dataToDisplay[i].stake).gte(Big(40000000000)) && Big(dataToDisplay[i].stake).lt(Big(100000000000))) {

            pieData[5].value = Number(Big(pieData[5].value).add(Big(dataToDisplay[i].reward).div(1000000).round(2, 1)));

        } else if (Big(dataToDisplay[i].stake).gte(Big(100000000000)) && Big(dataToDisplay[i].stake).lt(Big(300000000000))) {

            pieData[6].value = Number(Big(pieData[6].value).add(Big(dataToDisplay[i].reward).div(1000000).round(2, 1)));

        } else if (Big(dataToDisplay[i].stake).gte(Big(300000000000)) && Big(dataToDisplay[i].stake).lt(Big(2000000000000))) {

            pieData[7].value = Number(Big(pieData[7].value).add(Big(dataToDisplay[i].reward).div(1000000).round(2, 1)));

        } else if (Big(dataToDisplay[i].stake).gte(Big(2000000000000))) {

            pieData[8].value = Number(Big(pieData[8].value).add(Big(dataToDisplay[i].reward).div(1000000).round(2, 1)));

        }
    }

    let numberTotalReward = Number(totalReward.div(1000000).round(2, 1))



    return (
        <div className={`bg-cf-gray dark:bg-cf-text transition-colors duration-200 rounded-2xl 
                      shadow-[0_14px_50px_0_rgba(3,36,67,0.1)]
                      dark:shadow-[0_14px_50px_0px_rgba(23,23,23,0.24)]
                      p-6 ${height} ${scrollClasses} ${className}`}>
            <h3 className="text-3xl ml-2 text-cf-text dark:text-cf-gray transition-colors duration-200">{title}</h3>
            <p className='ml-3 text-gray-400 text-xs'>Total reward: {numberTotalReward} ₳</p>
            <div className="text-cf-text ml-2">

                <SimplePieChart data={pieData}></SimplePieChart>

                {children}
            </div>
        </div>
    );
};