'use client';

import React, { useEffect, useState } from 'react';
import { SidebarContext } from '@/app/context/sidebarContext';

interface SidebarProviderProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
}

const SIDEBAR_WIDTH_PX = 256; // Entspricht Tailwind 'w-64'
const DESKTOP_BREAKPOINT_PX = 1536; // Entspricht Tailwind '2xl'

export function SidebarProvider({ children, sidebarContent }: SidebarProviderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState<number>(DESKTOP_BREAKPOINT_PX);
  const [disableTransition, setDisableTransition] = useState(false);

  // isMobileView wird basierend auf dem windowWidth berechnet
  const isMobileView = windowWidth < DESKTOP_BREAKPOINT_PX;

  const toggleSidebar = () => {
    setDisableTransition(false); // Transition für manuelle Aktionen immer aktivieren
    setIsSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    // Initialen windowWidth setzen und Event-Listener hinzufügen
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Beim Mounten und bei jeder Größenänderung die Größe aktualisieren
    handleResize(); // Initialen Wert setzen
    window.addEventListener('resize', handleResize);

    // Medienanfragen-Logik für Desktop-Breakpoint
    const desktopMediaQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`);
    const handleMediaQueryChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setDisableTransition(true); // Transition deaktivieren, um Springen beim Wechsel zu vermeiden
      const timer = setTimeout(() => {
        setDisableTransition(false); // Transition wieder aktivieren
      }, 50); // Kurze Verzögerung

      if (e.matches) {
        // Desktop-Ansicht: Sidebar immer offen halten
        setIsSidebarOpen(true);
      } else {
        // Mobile-Ansicht: Sidebar schließen für manuelle Steuerung
        setIsSidebarOpen(false);
      }
      return () => clearTimeout(timer); // Cleanup für setTimeout
    };

    // Event-Listener für Medienanfragen
    desktopMediaQuery.addEventListener('change', handleMediaQueryChange);

    // Cleanup-Funktion für useEffect
    return () => {
      window.removeEventListener('resize', handleResize);
      desktopMediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []); // Leeres Array bedeutet, der Effekt läuft nur einmal beim Mounten

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      <div className={`flex h-screen ${isMobileView ? 'relative w-screen overflow-hidden' : ''}`}>
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

        {/* Hauptinhalt */}
        <div
          className={`
            h-full bg-cf-gray z-10 flex flex-col flex-grow
            ${disableTransition ? 'transition-none' : 'transform transition-transform duration-300 ease-in-out'}
            ${isMobileView && isSidebarOpen ? 'absolute top-0 left-0 w-full translate-x-64' : ''}
            ${isMobileView && !isSidebarOpen ? 'absolute top-0 left-0 w-full translate-x-0' : ''}
            ${!isMobileView && isSidebarOpen ? `ml-[${SIDEBAR_WIDTH_PX}px]` : ''}
            ${!isMobileView && !isSidebarOpen ? 'ml-0' : ''}
          `}
        >
          <div
            className={`
              flex-1 min-h-screen bg-cf-gray shadow-[-4px_0_80px_0px_rgba(3,36,67,0.24)] rounded-l-3xl
            `}
            style={{
              backgroundImage: 'url(/images/dots.svg)',
              backgroundRepeat: 'repeat',
              backgroundPosition: '12px 12px',
            }}
          >
            <div className="relative w-full h-full p-4 pt-6 2xl:p-10 flex flex-col overflow-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}