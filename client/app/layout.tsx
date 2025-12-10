/**
 * @file Root of the next.js project. Surpresses hydration warning for light/dark mode
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

import type { Metadata } from "next";
import "./globals.css";
import SidebarLink from '@/components/ui/SidebarLink';
import { SidebarProvider } from "@/components/ui/SidebarProvider";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { CurrencyProvider } from "@/components/ui/CurrencyProvider";
import { ConfigProvider } from "@/app/context/configContext";

/**
 * Metadata for the entire application.
 * This object defines the title and description that appear in the browser tab and search engine results.
 */
export const metadata: Metadata = {
  title: "Cardano Reward Dahsboard",
  description: "Gives insights about Cardano stake pool rewards for the 100% margin pool by the UNHCR.",
};

/**
 * The root layout component for the Next.js application.
 * This component wraps all pages and provides global elements like HTML structure,
 * theme initialization, and context providers for sidebar, theme, and currency.
 *
 * @param {Readonly<{ children: React.ReactNode }>} { children } - React children to be rendered within the layout.
 * @returns {JSX.Element} The root HTML structure of the application.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //Hydration only gets surpressed for this. Server cant know what clients system preferences are.
    <html lang="de" suppressHydrationWarning>
      <head>
        {/*This is used to initially set the color of the application according to the system preference.*/}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const root = document.documentElement;
              const storedTheme = localStorage.getItem('theme');
              const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

              if (storedTheme === 'dark' || (!("theme" in localStorage) && systemPrefersDark)) {
                root.classList.add('dark');
              } else {
                root.classList.remove('dark');
              }
            })();
          `,
        }} />
      </head>
      <body className="bg-cf-gray dark:bg-cf-text transition-colors duration-200">
        <ThemeProvider>
          <ConfigProvider>
            <SidebarProvider sidebarContent={
              <div className="w-full">
                <h2 className="text-3xl text-cf-text dark:text-cf-gray transition-colors duration-200 mt-2 mb-6 pl-4">Dashboard</h2>
                <nav>
                  <ul>
                    <SidebarLink href="/">Overview</SidebarLink>
                    <SidebarLink href="/epochs">Epochs</SidebarLink>
                  </ul>
                </nav>
              </div>
           }>
              <CurrencyProvider>
                {children}
              </CurrencyProvider>
            </SidebarProvider>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
