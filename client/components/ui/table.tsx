import { RewardData } from '@/types/types';
import React from 'react';
import Big from 'big.js';

export default function Table({values}: {values: RewardData[]}) {
  return (
    <div className="container">
      <div className="overflow-hidden">

        <div className="ml-2">
          <table className="min-w-full">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="pr-6 py-2 text-left text-xs text-gray-500 uppercase tracking-wider w-170"
                >
                  Delegator Address
                </th>
                <th
                  scope="col"
                  className="pr-6 py-2 text-left text-xs text-gray-500 uppercase tracking-wider"
                >
                  Stake
                </th>
                <th
                  scope="col"
                  className="pr-6 py-2 text-left text-xs text-gray-500 uppercase tracking-wider"
                >
                  Reward
                </th>
              </tr>
            </thead>
            <tbody>
              {values.map((row, index) => (
                <tr key={row.delegator}>
                  <td className="pr-6 py-2 whitespace-nowrap text-cf-text dark:text-cf-gray transition-colors duration-200 max-w-20 truncate">
                    <span className='text-gray-400 mr-2'>{index + 1}.</span> {row.delegator}
                  </td>
                  <td className="pr-6 py-2 whitespace-nowrap text-blue-600">
                    {String(Big(row.stake).div(1000000).round(2, Big.roundHalfUp))} Ada
                  </td>
                  <td className="pr-6 py-2 whitespace-nowrap text-green-600">
                    +{String(Big(row.reward).div(1000000).round(2, Big.roundHalfUp))} Ada
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
