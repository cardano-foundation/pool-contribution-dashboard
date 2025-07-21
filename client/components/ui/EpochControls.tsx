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
        <div className='sticky bottom-0 left-0 right-0 z-50 flex justify-center w-full'>
            <div className="flex-grow p-2 bg-cf-gray dark:bg-cf-text shadow-[0_8px_26px_0px_rgba(3,36,67,0.1)] dark:shadow-[0_4px_14px_0px_rgba(23,23,23,0.24)] rounded-2xl max-w-[600px]">
                <div className="flex items-center w-full space-x-4">
                    <button
                        onClick={goToPreviousEpoch}
                        disabled={currentEpoch === minEpoch}
                        className="px-2 py-2 bg-cf-gray dark:bg-cf-text text-cf-text dark:text-cf-gray rounded-lg shadow-[0_8px_26px_0px_rgba(3,36,67,0.1)] dark:shadow-[0_4px_14px_0px_rgba(23,23,23,0.24)] hover:bg-gray-200 dark:hover:bg-[#303030] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        <ArrowLeftIcon size={20} weight='bold' />
                    </button>
                    <input
                        type="range"
                        min={minEpoch}
                        max={maxEpoch}
                        value={currentEpoch}
                        onChange={(e) => goToEpoch(Number(e.target.value))}
                        className="flex-grow h-2 bg-gray-200 text-cf-text dark:bg-gray-600 dark:text-cf-gray rounded-lg appearance-none cursor-pointer range-lg"
                    />
                    <button
                        onClick={goToNextEpoch}
                        disabled={currentEpoch === maxEpoch}
                        className="px-2 py-2 bg-cf-gray dark:bg-cf-text text-cf-text dark:text-cf-gray rounded-lg shadow-[0_8px_26px_0px_rgba(3,36,67,0.1)] dark:shadow-[0_4px_14px_0px_rgba(23,23,23,0.24)] hover:bg-gray-200 dark:hover:bg-[#303030] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        <ArrowRightIcon size={20} weight='bold' />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default EpochControls;
