'use client';

import { RewardDataArray } from '@/types/types';
import React from 'react';
import Big from 'big.js';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
  scrollable?: boolean;
  data: RewardDataArray
}

export function OverviewCard({ title, children, className = '', height = 'h-auto', scrollable = false, data }: CardProps) {
  const scrollClasses = scrollable ? 'overflow-y-auto' : '';

  //Calcualte gained rewards over the past month (6 epochs)
  let addedReward = Big(0);

  let addedStake = Big(0);

  let allDelegators = data[data.length - 1].length


  if (data.length >= 6) {
    for (let i = data.length - 1; i > data.length - 7; i--) {
      for (let x = 0; x < data[i].length; x++) {
        if (i === data.length - 1) {
          addedStake = addedStake.add(Big(data[i][x].stake))
        }
        addedReward = addedReward.add(Big(data[i][x].reward))
      }
    }
  }

  addedReward = addedReward.div(1000000).round(2, Big.roundHalfUp)
  addedStake = addedStake.div(1000000).round(2, Big.roundHalfUp)


  return (
    <div className={`bg-cf-gray dark:bg-cf-text transition-colors duration-200 rounded-2xl 
                      shadow-[0_14px_50px_0_rgba(3,36,67,0.1)]
                      dark:shadow-[0_14px_50px_0px_rgba(23,23,23,0.24)]
                      p-6 ${height} ${scrollClasses} ${className}`}>
      <h3 className="text-3xl ml-2 text-cf-text dark:text-cf-gray transition-colors duration-200">{title}</h3>
      <p className='ml-2 mb-6 text-gray-400 text-xs'>Always calcualted from ~10 days ago</p>
      <div className="text-cf-text ml-2">
        <p className='text-xl mb-2 text-cf-text dark:text-cf-gray transition-colors duration-200'>Last month</p>
        <p className="text-green-600 mb-10 text-4xl">+{String(addedReward)} Ada</p>
        <p className='text-xl mb-2 text-cf-text dark:text-cf-gray transition-colors duration-200'>Last epoch</p>
        <p className='text-cf-text dark:text-cf-gray transition-colors duration-200'>Total delegator stake:</p>
        <p className="text-blue-600 mb-2">{String(addedStake)} Ada</p>
        <p className='text-cf-text dark:text-cf-gray transition-colors duration-200'>Total delegators:</p>
        <p className="text-blue-600">{allDelegators}</p>
        {children}
      </div>
    </div>
  );
};