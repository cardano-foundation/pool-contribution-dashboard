/**
 * @file Context for selecting an epoch to display data from
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

import { createContext, useContext } from 'react';

/**
 * Defines the shape of the epoch context.
 * @interface EpochContextType
 * @property {number} currentEpoch - The currently selected epoch number.
 * @property {() => void} goToNextEpoch - A function to advance to the next epoch.
 * @property {() => void} goToPreviousEpoch - A function to go back to the previous epoch.
 * @property {(epoch: number) => void} goToEpoch - A function to set the current epoch to a specific number.
 * @property {number} minEpoch - The minimum allowable epoch number.
 * @property {number} maxEpoch - The maximum allowable epoch number.
 */
export interface EpochContextType {
  currentEpoch: number;
  goToNextEpoch: () => void;
  goToPreviousEpoch: () => void;
  goToEpoch: (epoch: number) => void;
  minEpoch: number;
  maxEpoch: number;
}

/**
 * Creates a React Context for managing the application's current epoch state.
 * The context value is of type `EpochContextType` or `undefined` if no provider is found.
 */
export const EpochContext = createContext<EpochContextType | undefined>(undefined);

/**
 * A custom hook to access the epoch context.
 * This hook simplifies consuming the `EpochContext` and ensures that it is
 * used within an `EpochProvider`.
 *
 * @returns {EpochContextType} The current epoch state and functions to navigate epochs.
 * @throws {Error} If `useEpoch` is called outside of an `EpochProvider`.
 */
export function useEpoch() {
  const context = useContext(EpochContext);
  if (context === undefined) {
    throw new Error('useEpoch must be used inside of an epochProvider');
  }
  return context;
};