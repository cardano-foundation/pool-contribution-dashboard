'use client';

import React from 'react';
import SimpleBarChart from '@/components/forms/simpleBarChart'
import { RewardDataArray, BarChartData } from '@/types/types';
import Big from 'big.js';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
  scrollable?: boolean;
  data: RewardDataArray
}

export function AllTimeCard({ title, children, className = '', height = 'h-auto', scrollable = false, data }: CardProps) {
  const scrollClasses = scrollable ? 'overflow-y-auto' : '';

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

    epochData.push({ name: String(i), epoch: i, reward: addedReward.div(1000000).round(2, Big.roundHalfUp).toNumber() })


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
        <SimpleBarChart values={epochData}></SimpleBarChart>
        {children}
      </div>
    </div>
  );
};