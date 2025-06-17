'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  const activeClasses = 'bg-cf-gray text-cf-text shadow-[0_4px_10px_0_rgba(3,36,67,0.24)]';
  const inactiveClasses = 'hover:bg-cf-gray hover:text-cf-text hover:shadow-[0_4px_10px_0_rgba(3,36,67,0.24)]';

  return (
    <li>
      <Link
        href={href}
        className={`block py-2 px-4 mb-3 rounded-lg text-cf-text ${isActive ? activeClasses : inactiveClasses}`}
      >
        {children}
      </Link>
    </li>
  );
};

export default SidebarLink;