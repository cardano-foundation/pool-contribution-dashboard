/**
 * @file Allows toggling between light and dark mode in the theme context
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import React from 'react';
import { useTheme } from '@/app/context/themeContext';
import { SunIcon, MoonIcon } from '@phosphor-icons/react';

/**
 * A button component that allows users to toggle between light and dark themes.
 * It uses the `useTheme` hook to access and update the current theme.
 *
 * @returns {JSX.Element} The rendered theme switcher button.
 */
export function ThemeSwitcherButton() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
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
            aria-label="Change Theme"
        >
            {theme === "light" ? <MoonIcon size={20} weight="bold" /> : <SunIcon size={20} weight='bold' />}
        </button>
    );
};