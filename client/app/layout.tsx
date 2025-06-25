import type { Metadata } from "next";
import "./globals.css";
import SidebarLink from '@/components/ui/SidebarLink';
import { SidebarProvider } from "@/components/ui/SidebarProvider";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export const metadata: Metadata = {
  title: "Cardano Reward Dahsboard",
  description: "Gives insights about Cardano stake pool rewards for the 100% margin pool by the UNHCR.",
};

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

          <SidebarProvider sidebarContent={

            <div>
              <h2 className="text-3xl text-cf-text dark:text-cf-gray transition-colors duration-200 mt-2 mb-6 pl-4">Dashboard</h2>
              <nav>
                <ul>
                  <SidebarLink href="/">Overview</SidebarLink>
                  <SidebarLink href="/epochs">Epochs</SidebarLink>
                  <SidebarLink href="/delegator">Delegator</SidebarLink>
                </ul>
              </nav>

            </div>


          }>
            {children}
          </SidebarProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}
