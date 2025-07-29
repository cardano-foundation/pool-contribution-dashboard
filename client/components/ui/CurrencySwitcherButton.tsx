/**
 * @file Allows toggling between ada or dollar
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import React from 'react';
import { useCurrency } from '@/app/context/currencyContext';
import { CurrencyDollarIcon } from '@phosphor-icons/react';

/**
 * A button component that allows users to toggle between different currency displays.
 * It uses the useCurrency hook to access and update the global currency state.
 *
 * @returns {JSX.Element} A React button component for currency switching.
 */
export function CurrencySwitcherButton() {
    const { currency, toggleCurrency } = useCurrency();

    return (
        <button
            onClick={toggleCurrency}
            className="
        bg-cf-gray hover:bg-gray-200 text-cf-text
        dark:bg-cf-text dark:hover:bg-[#303030] dark:text-cf-gray
        transition-colors duration-200
        shadow-[0_8px_26px_0px_rgba(3,36,67,0.1)]
        dark:shadow-[0_4px_14px_0px_rgba(23,23,23,0.24)]
        w-10 h-10
        rounded-lg
        flex items-center justify-center
        self-start
        focus:outline-none
      "
            aria-label="Change currency"
        >
            {currency === "dollar" ? <CurrencyDollarIcon size={20} weight="bold" /> : <p className='text-lg' >₳</p>}
        </button>
    );
};