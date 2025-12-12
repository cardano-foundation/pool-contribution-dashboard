/**
 * @file Draws a card in a page.tsx that shows the top 5 delegator in the last calculatable epoch
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import { ExchangeValue, RewardData, RewardDataArray } from '@/types/types';
import React from 'react';
import Big from 'big.js';
import Table from '@/components/ui/table'

/**
 * Interface for the props needed for a TopDelegatorCard.
 * @interface CardProps
 * @property {string} title - The title displayed at the top of the card.
 * @property {React.ReactNode} children - React children to be rendered inside the card, below the table.
 * @property {string} [className=''] - Optional Tailwind CSS classes for additional styling of the card container.
 * @property {string} [height='h-auto'] - Optional Tailwind CSS height class for the card container (e.g., 'h-96', 'h-auto').
 * @property {boolean} [scrollable=false] - If true, enables vertical scrolling for the card's content area.
 * @property {RewardDataArray} data - The reward data for all epochs. The component processes the last epoch.
 * @property {ExchangeValue} exchangeRate - The current exchange rate, passed to the Table component for value conversion.
 */
interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
  scrollable?: boolean;
  data: RewardDataArray
  exchangeRate: ExchangeValue
}


/**
 * A reusable card component that displays the top 5 delegators from the last calculatable epoch.
 * It filters the provided `RewardDataArray` to find the top delegators based on their 'reward' value.
 *
 * @param {CardProps} props - The props for the TopDelegatorCard component.
 * @returns {JSX.Element} The rendered card component with a title, a brief epoch note, and a table of top delegators.
 */
export function TopDelegatorCard({ title, children, className = '', height = 'h-auto', scrollable = false, data, exchangeRate }: CardProps) {
  const scrollClasses = scrollable ? 'overflow-y-auto' : '';

  const lastEpoch = data[data.length - 1]

  const topItems: RewardData[] = [];

  const bestOf = 5;

  for (let i = 0; i < lastEpoch.length; i++) {
    const itemScore = Big(lastEpoch[i].stake);

    // If topItems is not full yet, or if current item is better than the worst in topItems
    if (topItems.length < bestOf || itemScore.gt(Big(topItems[topItems.length - 1].reward))) {
      // Add the item
      topItems.push(lastEpoch[i]);
      // Re-sort the small topItems list (descending)
       topItems.sort((a, b) => {
        const rewardA = new Big(a.reward);
        const rewardB = new Big(b.reward);

        return rewardB.cmp(rewardA);
      });

      // If it exceeds N, remove the worst one
      if (topItems.length > bestOf) {
        topItems.pop();
      }
    }
  }

  return (
    <div className={`bg-cf-gray dark:bg-cf-text transition-colors duration-200 rounded-2xl
                      shadow-[0_6px_20px_0_rgba(3,36,67,0.1)]
                      dark:shadow-[0_6px_20px_0px_rgba(23,23,23,0.24)]
                      p-6 ${height} ${scrollClasses} ${className}`}>
      <h3 className="text-3xl ml-2 text-cf-text dark:text-cf-gray transition-colors duration-200">{title}</h3>
      <p className='ml-2 mb-2 text-gray-400 text-xs'>2 epochs ago</p>
      <div className="text-cf-text dark:text-cf-gray transition-colors duration-200">
        <Table values={topItems} exchangeRate={exchangeRate}></Table>
        {children}
      </div>
    </div>
  );
}