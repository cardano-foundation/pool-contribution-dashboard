/**
 * @file Context for the sidebar
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import { createContext, useContext } from 'react';

/**
 * Defines the shape of the sidebar context.
 * @interface SidebarContextType
 * @property {boolean} isSidebarOpen - Indicates whether the sidebar is currently open.
 * @property {() => void} toggleSidebar - A function to toggle the sidebar's open/closed state.
 */
interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

/**
 * Creates a React Context for managing the sidebar's state.
 * The context value is of type `SidebarContextType` or `undefined` if no provider is found.
 */
export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

/**
 * A custom hook to access the sidebar context.
 * This hook simplifies consuming the `SidebarContext` and ensures that it is
 * used within a `SidebarProvider`.
 *
 * @returns {SidebarContextType} The current sidebar state (`isSidebarOpen`) and a function to toggle it (`toggleSidebar`).
 * @throws {Error} If `useSidebar` is called outside of a `SidebarProvider`.
 */
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}