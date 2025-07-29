/**
 * @file Provides the currency context 
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import React, { useState, ReactNode } from 'react';
import { CurrencyContext, CurrencyContextType } from '@/app/context/currencyContext';

/**
 * Props for the CurrencyProvider component.
 * @interface CurrencyProviderProps
 * @property {ReactNode} children - The child components that will consume the currency context.
 */
interface CurrencyProviderProps {
    children: ReactNode;
}

/**
 * Provides a context for managing and sharing the application's currency display preference.
 * The currency state is persisted in local storage.
 *
 * @param {CurrencyProviderProps} { children } - Props for the component.
 * @returns {JSX.Element} A React context provider for currency-related state and functions.
 */
export function CurrencyProvider({ children }: CurrencyProviderProps) {
    //State is read from localStorage. Default is dollar
    const [currency, setCurrency] = useState<'ada' | 'dollar'>(() => {
        if (typeof window !== 'undefined') {
            const storedCurrency = localStorage.getItem('currency');
            if (storedCurrency === 'ada' || storedCurrency === 'dollar') {
                return storedCurrency;
            }
            return 'dollar';
        }
        return 'dollar';
    });

    //Used to change the theme via button or system preference.
    const toggleCurrency = () => {
        setCurrency(prevCurrency => {
            const newCurrency = prevCurrency === 'ada' ? 'dollar' : 'ada';
            localStorage.setItem('currency', newCurrency);
            return newCurrency;
        });
    };

    const contextValue: CurrencyContextType = {
        currency,
        toggleCurrency,
    };

    return (
        <CurrencyContext.Provider value={contextValue}>
            {children}
        </CurrencyContext.Provider>
    );
}