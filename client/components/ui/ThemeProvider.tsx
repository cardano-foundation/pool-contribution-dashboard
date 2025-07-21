/**
 * @file Provides the context for theme switching (ligt/dark)
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { ThemeContext, ThemeContextType } from '@/app/context/themeContext';

/**
 * Interface for the props of the ThemeProvider component.
 * @interface ThemeProviderProps
 * @property {ReactNode} children - The child components that will consume the theme context.
 */
interface ThemeProviderProps {
    children: ReactNode;
}

/**
 * Provides theme context to its children components, allowing them to access and
 * toggle the current theme (light or dark). The theme is persisted in local storage
 * and respects the user's system preference for dark mode.
 *
 * The initial theme state is also set in `layout.tsx` to minimize a "flash of unstyled content" (FOUC)
 * before the client-side React code hydrates.
 *
 * @param {ThemeProviderProps} { children } - The props for the ThemeProvider, containing the child components.
 * @returns {JSX.Element} A React context provider that makes the theme and toggle function available to its children.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
    //State is read from localStorage or from system preference. 
    //This is already set in layout.tsx aswell to minimize wrong color flashing
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme === 'light' || storedTheme === 'dark') {
                return storedTheme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    // Sets the according theme on the root according to what is set in theme
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            if (theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [theme]);

    // Checks for system preference changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            //Only happens when nothing is set in local storage
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    //Used to change the theme via button or system preference.
    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    };

    const contextValue: ThemeContextType = {
        theme,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}