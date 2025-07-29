/**
 * @file Provider for the eopchs page.tsx to keep track of which epoch to display
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import React, { useState, useCallback } from 'react';
import { EpochContext } from '@/app/context/epochContext'

/**
 * Provides a context for managing and sharing the current epoch state throughout the application.
 * It allows components to access and update the current epoch, respecting defined minimum and maximum bounds.
 *
 * @param {EpochProviderProps} { children, initialEpoch, minEpoch, maxEpoch } - Props for the component.
 * @returns {JSX.Element} A React context provider for epoch-related state and functions.
 */
export function EpochProvider({ children, initialEpoch = 0, minEpoch = 0, maxEpoch = 10 }: { children: React.ReactNode; initialEpoch?: number; minEpoch?: number; maxEpoch?: number; }) {
  const [currentEpoch, setCurrentEpoch] = useState(initialEpoch);

  const goToNextEpoch = useCallback(() => {
    setCurrentEpoch(prev => Math.min(prev + 1, maxEpoch));
  }, [maxEpoch]);

  const goToPreviousEpoch = useCallback(() => {
    setCurrentEpoch(prev => Math.max(prev - 1, minEpoch));
  }, [minEpoch]);

  const goToEpoch = useCallback((epoch: number) => {
    setCurrentEpoch(Math.max(minEpoch, Math.min(epoch, maxEpoch)));
  }, [minEpoch, maxEpoch]);

  const contextValue = {
    currentEpoch,
    goToNextEpoch,
    goToPreviousEpoch,
    goToEpoch,
    minEpoch,
    maxEpoch,
  };

  return (
    <EpochContext.Provider value={contextValue}>
      {children}
    </EpochContext.Provider>
  );
};
