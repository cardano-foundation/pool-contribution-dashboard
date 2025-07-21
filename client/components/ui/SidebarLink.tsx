/**
 * @file Used to display links in the sidebar
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

/**
 Props for the SidebarLink component.
 * @interface SidebarLinkProps
 * @property {string} href - The URL the link points to.
 * @property {React.ReactNode} children - The content to be rendered inside the link (e.g., text, icon).
 */
interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * A reusable link component for sidebars, highlighting the active link based on the current pathname.
 *
 * @param {SidebarLinkProps} { href, children } - Props containing the link's destination and content.
 * @returns {JSX.Element} A list item containing a Next.js Link component.
 */
const SidebarLink: React.FC<SidebarLinkProps> = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  const activeClasses = 'bg-cf-gray dark:bg-cf-text text-cf-text dark:text-cf-grey shadow-[0_4px_10px_0_rgba(3,36,67,0.24)] dark:shadow-[0_4px_10px_0px_rgba(23,23,23,0.24)] z-[0]';
  const inactiveClasses = 'hover:bg-cf-gray dark:hover:bg-cf-text hover:text-cf-text dark:hover:text-cf-gray hover:shadow-[0_4px_10px_0_rgba(3,36,67,0.24)] dark:hover:shadow-[0_4px_10px_0px_rgba(23,23,23,0.24)]';

  return (
    <li>
      <Link
        href={href}
        className={`block py-2 px-4 mb-3 rounded-lg text-cf-text dark:text-cf-gray transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
      >
        {children}
      </Link>
    </li>
  );
};

export default SidebarLink;