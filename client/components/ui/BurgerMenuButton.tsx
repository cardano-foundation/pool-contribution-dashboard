'use client';

import React from 'react';
import { useSidebar } from '@/app/context/sidebarContext';

export function BurgerMenuButton({ className = '' }) {
  const { toggleSidebar, isSidebarOpen } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="
        bg-cf-gray hover:bg-gray-200 text-cf-text
        transition-colors duration-200
        shadow-[0_8px_26px_0px_rgba(3,36,67,0.1)]
        w-10 h-10
        rounded-lg
        flex items-center justify-center
        self-start
        focus:outline-none
        2xl:hidden
      "
      aria-label="Open Sidebar"
    >
      {isSidebarOpen ? "x" : "☰"}
    </button>
  );
}