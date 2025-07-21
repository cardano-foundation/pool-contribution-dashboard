/**
 * @file Context for which currency to display
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import { createContext, useContext } from 'react';

/**
 * Defines the shape of the currency context.
 * @interface CurrencyContextType
 * @property {'ada' | 'dollar'} currency - The currently selected currency, either 'ada' or 'dollar'.
 * @property {() => void} toggleCurrency - A function to toggle the currency between 'ada' and 'dollar'.
 */
export interface CurrencyContextType {
  currency: 'ada' | 'dollar';
  toggleCurrency: () => void;
}

/**
 * Creates a React Context for managing the application's currency setting.
 * The context value is of type `CurrencyContextType` or `undefined` if no provider is found.
 */
export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

/**
 * A custom hook to access the currency context.
 * This hook simplifies consuming the `CurrencyContext` and ensures that it is
 * used within a `CurrencyProvider`.
 *
 * @returns {CurrencyContextType} The current currency and a function to toggle it.
 * @throws {Error} If `useCurrency` is called outside of a `CurrencyProvider`.
 */
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}