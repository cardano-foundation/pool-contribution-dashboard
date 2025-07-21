/**
 * @file Context for the light/dark mode
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import { createContext, useContext } from 'react';

/**
 * Defines the shape of the theme context.
 * @interface ThemeContextType
 * @property {'light' | 'dark'} theme - The current theme mode, either 'light' or 'dark'.
 * @property {() => void} toggleTheme - A function to toggle the theme between 'light' and 'dark'.
 */
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

/**
 * Creates a React Context for managing the application's theme.
 * The context value is of type `ThemeContextType` or `undefined` if no provider is found.
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * A custom hook to access the theme context.
 * This hook simplifies consuming the `ThemeContext` and ensures that
 * it is used within a `ThemeProvider`.
 *
 * @returns {ThemeContextType} The current theme and a function to toggle it.
 * @throws {Error} If `useTheme` is called outside of a `ThemeProvider`.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}