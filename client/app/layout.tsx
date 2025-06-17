import type { Metadata } from "next";
import "./globals.css";
import SidebarLink from '@/components/ui/SidebarLink';

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
        <div className="relative min-h-screen flex">
          <aside className="fixed inset-y-0 left-0 w-64 bg-cf-gray z-10 text-white p-6 hidden md:block">
            <h2 className="text-3xl text-cf-text mt-2 mb-6 pl-4">Dashboard</h2>
            <nav>
              <ul>
                <SidebarLink href="/">Overview</SidebarLink>
                <SidebarLink href="/epochs">Epochs</SidebarLink>
                <SidebarLink href="/delegator">Delegator</SidebarLink>
              </ul>
            </nav>
          </aside>
          <div className="fixed inset-0 z-20 bg-cf-gray shadow-[-4px_0_80px_0px_rgba(3,36,67,0.24)] rounded-l-3xl lg:ml-64"
          style={{ 
                backgroundImage: 'url(/images/dots.svg)',
                backgroundRepeat: 'repeat',
                backgroundAttachment: 'fixed',
                backgroundPosition: '0 12px',
              }}
          >
            <div className="relative w-full h-full p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col overflow-auto">
              <button className="md:hidden p-2 text-gray-800 focus:outline-none">
                ☰
              </button>
              {children}
            </div>
          </div>

          {/* Mobile Sidebar */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            style={{ display: 'none' }} 
          >
            <aside
              className="fixed inset-y-0 left-0 w-64 bg-cf-gray z-40 text-white p-6 transform -translate-x-full transition-transform duration-300 ease-in-out"
            >
              <button className="absolute top-4 right-4 text-white">
                ✕
              </button>
            </aside>
          </div>
        </div>
      </body>
    </html>
  );
}
