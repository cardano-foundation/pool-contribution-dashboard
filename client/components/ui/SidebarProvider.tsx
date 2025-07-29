/**
 * @file Allows page.tsx files to be displayed with a sidebar
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import React, { useEffect, useState } from 'react';
import { SidebarContext } from '@/app/context/sidebarContext';

/**
 * Defines the props for the SidebarProvider component.
 * @interface SidebarProviderProps
 * @property {React.ReactNode} children - The main content of the application that will be rendered alongside the sidebar.
 * @property {React.ReactNode} sidebarContent - The content to be displayed inside the sidebar.
 */
interface SidebarProviderProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
}

//Tailwind w-64 for margin in desktop view
const SIDEBAR_WIDTH_PX = 256;
//Taiwlind 2xl for mobile breakpoint
const DESKTOP_BREAKPOINT_PX = 1536;


/**
 * Provides a context for managing sidebar state and responsiveness.
 * It dynamically adjusts sidebar visibility based on window width and user interaction.
 *
 * @param {SidebarProviderProps} { children, sidebarContent } - Props for the component.
 * @returns {JSX.Element} A React component that wraps the application content and sidebar.
 */
export function SidebarProvider({ children, sidebarContent }: SidebarProviderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [disableTransition, setDisableTransition] = useState(true);
  const [isContentReady, setIsContentReady] = useState(false);

  //Used to check if view is mobile
  const isMobileView = windowWidth < DESKTOP_BREAKPOINT_PX;

  //Always uses transition animations when changing manually
  const toggleSidebar = () => {
    setDisableTransition(false);
    setIsSidebarOpen(prev => !prev);
  };

  useEffect(() => {

    if (typeof window !== 'undefined') {
      //Initial width of the window
      const initialWidth = window.innerWidth;
      setWindowWidth(initialWidth);

      //Check if the initial width needs mobile view
      const initialIsMobileView = initialWidth < DESKTOP_BREAKPOINT_PX;

      //Set Sidebar accordingly
      if (initialIsMobileView) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }

      
      //Function for event listener in resize
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      //Event listener that checks if the window was resized and saves accordingly
      window.addEventListener('resize', handleResize);

      //Check for mobile Breakpoint
      const desktopMediaQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`);
      const handleMediaQueryChange = (e: MediaQueryListEvent | MediaQueryList) => {
        //Deactivate transistion on change
        setDisableTransition(true);
        //Use short timer until the transitions get activated again
        const timer = setTimeout(() => {
          setDisableTransition(false);
        }, 50);
        
        if (e.matches) {
          //Desktop
          setIsSidebarOpen(true);
        } else {
          //Mobile
          setIsSidebarOpen(false);
        }
        return () => clearTimeout(timer);
      };
      
      //Event listener for mobile breakpoint
      desktopMediaQuery.addEventListener('change', handleMediaQueryChange);

      //Only show content when everythin has been setup
      setIsContentReady(true)
      
      //Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        desktopMediaQuery.removeEventListener('change', handleMediaQueryChange);
      };
    }
  }, []);

  //Only show content, when it has been loaded
  const contentVisibilityClass = isContentReady
    ? 'opacity-100 transition-opacity duration-100 ease-out'
    : 'opacity-0 pointer-events-none';

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      <div className={`flex h-screen ${isMobileView ? 'relative w-screen overflow-hidden' : ''} ${contentVisibilityClass}`}>
        {/* Sidebar */}
        <div
          className={`
            h-full p-5 z-50
            ${isMobileView ? 'absolute top-0 left-0 w-64' : 'relative flex-shrink-0'}
            ${disableTransition ? 'transition-none' : 'transform transition-transform duration-300 ease-in-out'}
            ${isMobileView && isSidebarOpen ? 'translate-x-0' : ''}
            ${isMobileView && !isSidebarOpen ? '-translate-x-full' : ''}
            ${!isMobileView && isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}
          `}
        >
          {sidebarContent}
        </div>

        {/* Main Content */}
        <div
          className={`
            h-full z-10 flex flex-col flex-grow
            ${disableTransition ? 'transition-none' : 'transform transition-transform duration-300 ease-in-out'}
            ${isMobileView && isSidebarOpen ? 'absolute top-0 left-0 w-full translate-x-64' : ''}
            ${isMobileView && !isSidebarOpen ? 'absolute top-0 left-0 w-full translate-x-0' : ''}
            ${!isMobileView && isSidebarOpen ? `ml-[${SIDEBAR_WIDTH_PX}px]` : ''}
            ${!isMobileView && !isSidebarOpen ? 'ml-0' : ''}
          `}
        >
          {/* Div with rounded edges on left side */}
          <div
            className={`
              relative
              flex-1 min-h-screen bg-cf-gray dark:bg-cf-text z-[0] 
              transition-colors duration-200 
              shadow-[-4px_0_80px_0px_rgba(3,36,67,0.24)]
              dark:shadow-[-4px_0_80px_0px_rgba(23,23,23,0.24)]
              rounded-l-3xl
            `}
          >
            {/* Special class only for the dots in the Background */}
            <div
              className="absolute inset-0 z-[-1] transition-opacity duration-200"
              style={{
                backgroundImage: 'url(/images/Dots.svg)',
                backgroundRepeat: 'repeat',
                backgroundPosition: '12px 12px',
                opacity: 'var(--svg-opacity)'
              }} />
            {/* Div for content from page.tsx */}
            <div className="relative w-full h-full p-4 pt-6 2xl:p-10 flex flex-col overflow-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}