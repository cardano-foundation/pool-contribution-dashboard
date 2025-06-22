import type { Metadata } from "next";
import "./globals.css";
import SidebarLink from '@/components/ui/SidebarLink';
import { SidebarProvider } from "@/components/ui/SidebarProvider";

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
    <html lang="de">
      <body className="bg-cf-gray">
        <SidebarProvider sidebarContent={

          <div>
            <h2 className="text-3xl text-cf-text mt-2 mb-6 pl-4">Dashboard</h2>
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
      </body>
    </html>
  );
}
