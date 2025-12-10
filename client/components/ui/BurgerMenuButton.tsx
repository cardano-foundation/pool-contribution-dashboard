/**
 * @file Allows opening and closing the sidebar
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import React from 'react';
import { useSidebar } from '@/app/context/sidebarContext';
import { ListIcon, XIcon } from '@phosphor-icons/react'

/**
 * A burger menu button that toggles the visibility of a sidebar.
 * It changes its icon based on whether the sidebar is open or closed.
 * It consumes the sidebar state and toggle function from `SidebarContext`.
 *
 * @param {BurgerMenuButtonProps} { className } - Props for the component.
 * @returns {JSX.Element} A React button component for toggling a sidebar.
 */
export function BurgerMenuButton() {
  const { toggleSidebar, isSidebarOpen } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="
        bg-cf-gray hover:bg-gray-200 text-cf-text
        dark:bg-cf-text dark:hover:bg-[#303030] dark:text-cf-gray
        transition-colors duration-200
        shadow-[0_8px_26px_0px_rgba(3,36,67,0.1)]
        dark:shadow-[0_4px_14px_0px_rgba(23,23,23,0.24)]
        w-10 h-10
        mr-2
        rounded-lg
        flex items-center justify-center
        self-start
        focus:outline-none
        xl:hidden
      "
      aria-label="Open Sidebar"
    >
      {isSidebarOpen ? <XIcon size={20} weight="bold" /> : <ListIcon size={20} weight="bold" />}
    </button>
  );
}