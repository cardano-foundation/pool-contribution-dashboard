/**
 * @file Used to display a paginated table with data from the currentyl selected epoch via the epoch context
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

'use client';

import { ExchangeValue, RewardDataArray } from '@/types/types';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Big from 'big.js';
import Table from '@/components/ui/table';
import { useEpoch } from '@/app/context/epochContext';
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';


/**
 * Defines the possible sorting criteria for the table data.
 * @typedef {'reward' | 'stake'} SortBy
 */
type SortBy = 'reward' | 'stake';

/**
 * Props for the PaginatedDelegatorTableCard component.
 * @interface CardProps
 * @property {string} title - The title displayed at the top of the card.
 * @property {React.ReactNode} [children] - Optional child elements to render within the card.
 * @property {string} [className=''] - Optional additional CSS classes for styling the card.
 * @property {string} [height='h-auto'] - Optional CSS class to set the height of the card.
 * @property {boolean} [scrollable=false] - If true, enables vertical scrolling for the card's content.
 * @property {RewardDataArray} data - The array of reward data, typically indexed by epoch.
 * @property {ExchangeValue} exchangeRate - The current exchange rate used for value conversions.
 * @property {number} [itemsPerPage=12] - The number of items to display per page in the table.
 * @property {SortBy} [sortBy='reward'] - The column by which the data should be sorted.
 * @property {'asc' | 'desc'} [sortOrder='desc'] - The order of sorting ('asc' for ascending, 'desc' for descending).
 */
interface CardProps {
    title: string;
    children?: React.ReactNode;
    className?: string;
    height?: string;
    scrollable?: boolean;
    data: RewardDataArray;
    exchangeRate: ExchangeValue;
    itemsPerPage?: number;
    sortBy?: SortBy;
    sortOrder?: 'asc' | 'desc';
}

/**
 * A card component that displays paginated and sortable delegator reward data in a table.
 * It integrates with an epoch context to display data relevant to the current epoch.
 *
 * @param {CardProps} { title, children, className, height, scrollable, data, exchangeRate, itemsPerPage, sortBy, sortOrder } - Props for the component.
 * @returns {JSX.Element} A React component displaying a paginated table of delegator data.
 */
export default function PaginatedDelegatorTableCard({
    title,
    children,
    className = '',
    height = 'h-auto',
    scrollable = false,
    data,
    exchangeRate,
    itemsPerPage = 10,
    sortBy = 'reward',
    sortOrder = 'desc',
}: CardProps) {
    const scrollClasses = scrollable ? 'overflow-y-auto' : '';

    const [currentPage, setCurrentPage] = useState(1);

    const [dynamicItemsPerPage, setDynamicItemsPerPage] = useState(itemsPerPage);

    const cardRef = useRef<HTMLDivElement>(null);

    const { currentEpoch } = useEpoch();

    useEffect(() => {
        if (!cardRef.current) return;

        const calculateItems = () => {
            if (cardRef.current) {
                const containerHeight = cardRef.current.clientHeight;
                
                const fixedContentHeight = 210; 
                
                const rowHeight = 40;

                const availableSpace = containerHeight - fixedContentHeight;
                
                const calculatedItems = Math.floor(availableSpace / rowHeight);
                
                setDynamicItemsPerPage(Math.max(10, calculatedItems));
            }
        };

        calculateItems();

        const observer = new ResizeObserver(() => {
            calculateItems();
        });

        observer.observe(cardRef.current);

        return () => observer.disconnect();
    }, []);

    const sortedData = useMemo(() => {

        if (!data || data.length === 0 || currentEpoch === undefined || data[currentEpoch] === undefined) {
            return [];
        }


        const currentEpochItems = [...data[currentEpoch]];

        currentEpochItems.sort((a, b) => {
            let comparison = 0;

            const valA = (a)[sortBy];
            const valB = (b)[sortBy];

            const valueA = new Big(valA);
            const valueB = new Big(valB);

            if (valueA.lt(valueB)) {
                comparison = -1;
            } else if (valueA.gt(valueB)) {
                comparison = 1;
            }
            return sortOrder === 'desc' ? comparison * -1 : comparison;
        });

        return currentEpochItems;
    }, [data, currentEpoch, sortBy, sortOrder]);

    //Resets the page on epoch change
    useEffect(() => {
        setCurrentPage(1);
    }, [currentEpoch]);

    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / dynamicItemsPerPage);

    const currentItems = useMemo(() => {
        const startIndex = (currentPage - 1) * dynamicItemsPerPage;
        const endIndex = startIndex + dynamicItemsPerPage;
        return sortedData.slice(startIndex, endIndex);
    }, [currentPage, dynamicItemsPerPage, sortedData]);

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const goToPrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    return (
        <div 
            ref={cardRef}
            className={`bg-cf-gray dark:bg-cf-text transition-colors duration-200 rounded-2xl
                     shadow-[0_6px_20px_0_rgba(3,36,67,0.1)]
                     dark:shadow-[0_6px_20px_0px_rgba(23,23,23,0.24)]
                     p-6 ${height} ${scrollClasses} ${className}`}>
            <h3 className="text-3xl ml-2 text-cf-text dark:text-cf-gray transition-colors duration-200">{title}</h3>

            <p className='ml-2 mb-2 text-gray-400 text-xs'>Data from Epoch {currentEpoch !== undefined ? currentEpoch : 'N/A'}</p>
            <div className="text-cf-text dark:text-cf-gray transition-colors duration-200">
                {currentItems.length > 0 ? (
                    <Table values={currentItems} exchangeRate={exchangeRate}></Table>
                ) : (
                    <p className="text-center text-gray-500 py-8">No data available for this epoch or page.</p>
                )}
                {children}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className="px-2 py-2 rounded-md bg-cf-gray text-cf-text hover:bg-gray-200 dark:bg-cf-text dark:text-cf-gray dark:hover:bg-[#303030] shadow-[0_8px_26px_0px_rgba(3,36,67,0.1)]
                                dark:shadow-[0_4px_14px_0px_rgba(23,23,23,0.24)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        <ArrowLeftIcon size={20} weight='bold' />
                    </button>

                    <span className="text-cf-text dark:text-cf-gray text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="px-2 py-2 rounded-md bg-cf-gray text-cf-text hover:bg-gray-200 dark:bg-cf-text dark:text-cf-gray dark:hover:bg-[#303030] shadow-[0_8px_26px_0px_rgba(3,36,67,0.1)]
                                dark:shadow-[0_4px_14px_0px_rgba(23,23,23,0.24)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        <ArrowRightIcon size={20} weight='bold' />
                    </button>
                </div>
            )}
        </div>
    );
}