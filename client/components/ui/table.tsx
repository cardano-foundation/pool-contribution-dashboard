/**
 * @file Alows displaying given values in a table
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

import { RewardData, ExchangeValue } from '@/types/types';
import React from 'react';
import Big from 'big.js';
import { useCurrency } from '@/app/context/currencyContext'
import { calculateValueWithExchangeRate } from '../logic/currencyCalculator';

/**
 * Interface for the props of the Table component.
 * @interface TableProps
 * @property {RewardData[]} values - An array of `RewardData` objects to be displayed in the table. Each object should contain delegator, stake, and reward information.
 * @property {ExchangeValue} exchangeRate - An object containing the current exchange rates, used for converting ada values to fiat.
 */
interface TableProps {
  values: RewardData[];
  exchangeRate: ExchangeValue;
}

/**
 * A reusable table component designed to display delegator stake and reward data.
 * It dynamically adjusts the displayed currency (ADA or USD) based on the global currency context.
 * Values are formatted for readability using `Big.js` for precision.
 *
 * @param {TableProps} { values, exchangeRate } - The props for the Table component.
 * @returns {JSX.Element} The rendered HTML table displaying delegator data.
 */
export default function Table({ values, exchangeRate }: TableProps) {

  const { currency } = useCurrency();

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
                    {currency === "ada" ? String(Big(row.stake).div(1000000).round(2, Big.roundHalfUp)) + " ₳" : calculateValueWithExchangeRate(exchangeRate.cardano.usd, Big(row.stake).div(1000000).round(2, Big.roundHalfUp)) + " $"}
                  </td>
                  <td className="pr-6 py-2 whitespace-nowrap text-green-600">
                    {currency ==="ada" ? "+" + String(Big(row.reward).div(1000000).round(2, Big.roundHalfUp)) + " ₳" : "+" + calculateValueWithExchangeRate(exchangeRate.cardano.usd, Big(row.reward).div(1000000).round(2, Big.roundHalfUp)) + " $"}
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
