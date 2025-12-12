/**
 * @file Allows controll over the currently displayed epoch
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import React from 'react';
import { useEpoch } from '@/app/context/epochContext';
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react'

/**
 * A component that provides controls for navigating through different epochs.
 * It includes "previous" and "next" buttons, and a range slider to select an epoch directly.
 * The epoch state and navigation functions are consumed from the EpochContext.
 *
 * @returns {JSX.Element} A React component with epoch navigation controls.
 */
export function EpochControls() {
    const { currentEpoch, goToNextEpoch, goToPreviousEpoch, goToEpoch, minEpoch, maxEpoch } = useEpoch();

    return (
        <div className="flex items-center justify-center w-full gap-3">
            <button
                onClick={goToPreviousEpoch}
                disabled={currentEpoch === minEpoch}
                className="bg-cf-gray dark:bg-cf-text shadow-[0_8px_26px_0px_rgba(3,36,67,0.1)] dark:shadow-[0_4px_14px_0px_rgba(23,23,23,0.24)] w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-[#303030] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 text-cf-text dark:text-cf-gray"
                aria-label="Previous Epoch"
            >
                <ArrowLeftIcon size={20} weight='bold' />
            </button>
            <div className="bg-cf-gray dark:bg-cf-text shadow-[0_8px_26px_0px_rgba(3,36,67,0.1)] dark:shadow-[0_4px_14px_0px_rgba(23,23,23,0.24)] flex-grow h-10 flex items-center px-4 rounded-lg">
                <input
                    type="range"
                    min={minEpoch}
                    max={maxEpoch}
                    value={currentEpoch}
                    onChange={(e) => goToEpoch(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 text-cf-text dark:bg-gray-600 dark:text-cf-gray rounded-lg appearance-none cursor-pointer range-lg"
                />
            </div>
            <button
                onClick={goToNextEpoch}
                disabled={currentEpoch === maxEpoch}
                className="bg-cf-gray dark:bg-cf-text shadow-[0_8px_26px_0px_rgba(3,36,67,0.1)] dark:shadow-[0_4px_14px_0px_rgba(23,23,23,0.24)] w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-[#303030] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 text-cf-text dark:text-cf-gray"
                aria-label="Next Epoch"
            >
                <ArrowRightIcon size={20} weight='bold' />
            </button>
        </div>
    );
};

export default EpochControls;
