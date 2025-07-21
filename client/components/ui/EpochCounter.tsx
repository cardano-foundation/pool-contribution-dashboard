/**
 * @file Displays the current epoch
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import React from 'react';
import { useEpoch } from '@/app/context/epochContext';

/**
 * A component that displays the current epoch number.
 * It retrieves the epoch value from the EpochContext.
 *
 * @returns {JSX.Element} A React component displaying the current epoch.
 */
export function EpochCounter() {

  const { currentEpoch } = useEpoch();

  return (
    <div className="px-3 py-2 bg-cf-gray dark:bg-cf-text shadow-[0_8px_26px_0px_rgba(3,36,67,0.1)] dark:shadow-[0_4px_14px_0px_rgba(23,23,23,0.24)] rounded-lg text-center">
      <p className="text-l text-cf-text dark:text-cf-gray">
        Epoch: {currentEpoch}
      </p>
    </div>
  );
};