'use client';

import { RewardData, RewardDataArray } from '@/types/types';
import React from 'react';
import Big from 'big.js';
import Table from '@/components/ui/table'

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
  scrollable?: boolean;
  data: RewardDataArray
}

const Card: React.FC<CardProps> = ({ title, children, className = '', height = 'h-auto', scrollable = false, data }) => {
  const scrollClasses = scrollable ? 'overflow-y-auto' : '';

  const lastEpoch = data[data.length - 1]

  const topItems: RewardData[] = [];

  let bestOf = 5;

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
                      shadow-[0_14px_50px_0_rgba(3,36,67,0.1)]
                      dark:shadow-[0_14px_50px_0px_rgba(23,23,23,0.24)]
                      p-6 ${height} ${scrollClasses} ${className}`}>
      <h3 className="text-3xl ml-2 text-cf-text dark:text-cf-gray transition-colors duration-200">{title}</h3>
      <p className='ml-2 mb-2 text-gray-400 text-xs'>2 epochs ago</p>
      <div className="text-cf-text dark:text-cf-gray transition-colors duration-200">
        <Table values={topItems}></Table>
        {children}
      </div>
    </div>
  );
};

export default Card;