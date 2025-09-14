/**
 * Pagination Controls Component
 * Production-ready pagination UI with accessibility
 */

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { UsePaginationReturn } from '@/types/pagination';

interface PaginationControlsProps {
    pagination: UsePaginationReturn;
    showFirstLast?: boolean;
    showPageNumbers?: boolean;
    maxPageNumbers?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
    pagination,
    showFirstLast = true,
    showPageNumbers = true,
    maxPageNumbers = 5,
    size = 'md',
    className = '',
}) => {
    const {
        currentPage,
        totalPages,
        hasNext,
        hasPrev,
        loading,
        goToPage,
        nextPage,
        prevPage,
        firstPage,
        lastPage,
        canGoNext,
        canGoPrev,
    } = pagination;

    // Calculate visible page numbers
    const getVisiblePages = () => {
        if (totalPages <= maxPageNumbers) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const halfVisible = Math.floor(maxPageNumbers / 2);
        let start = Math.max(1, currentPage - halfVisible);
        const end = Math.min(totalPages, start + maxPageNumbers - 1);

        // Adjust start if we're near the end
        if (end - start < maxPageNumbers - 1) {
            start = Math.max(1, end - maxPageNumbers + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    // Size variants
    const sizeClasses = {
        sm: {
            button: 'h-8 w-8 text-sm',
            container: 'gap-1',
        },
        md: {
            button: 'h-10 w-10 text-sm',
            container: 'gap-2',
        },
        lg: {
            button: 'h-12 w-12 text-base',
            container: 'gap-3',
        },
    };

    const { button: buttonSize, container: containerGap } = sizeClasses[size];

    // Base button classes
    const baseButtonClasses = `
    ${buttonSize}
    inline-flex items-center justify-center
    rounded-lg border border-border
    bg-background text-foreground
    hover:bg-accent hover:text-accent-foreground
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200
  `;

    const activeButtonClasses = `
    ${buttonSize}
    inline-flex items-center justify-center
    rounded-lg border border-primary
    bg-primary text-primary-foreground
    hover:bg-primary/90
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
    transition-all duration-200
  `;

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav
            role="navigation"
            aria-label="Pagination"
            className={`flex items-center justify-center ${containerGap} ${className}`}
        >
            {/* First page button */}
            {showFirstLast && totalPages > maxPageNumbers && (
                <button
                    onClick={firstPage}
                    disabled={!canGoPrev || loading}
                    className={baseButtonClasses}
                    aria-label="Go to first page"
                    title="First page"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <ChevronsLeft className="h-4 w-4" />
                    )}
                </button>
            )}

            {/* Previous page button */}
            <button
                onClick={prevPage}
                disabled={!canGoPrev || loading}
                className={baseButtonClasses}
                aria-label="Go to previous page"
                title="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page number buttons */}
            {showPageNumbers && (
                <>
                    {getVisiblePages().map((pageNumber) => (
                        <button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber)}
                            disabled={loading}
                            className={
                                pageNumber === currentPage
                                    ? activeButtonClasses
                                    : baseButtonClasses
                            }
                            aria-label={`Go to page ${pageNumber}`}
                            aria-current={pageNumber === currentPage ? 'page' : undefined}
                            title={`Page ${pageNumber}`}
                        >
                            {pageNumber}
                        </button>
                    ))}
                </>
            )}

            {/* Next page button */}
            <button
                onClick={nextPage}
                disabled={!canGoNext || loading}
                className={baseButtonClasses}
                aria-label="Go to next page"
                title="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>

            {/* Last page button */}
            {showFirstLast && totalPages > maxPageNumbers && (
                <button
                    onClick={lastPage}
                    disabled={!canGoNext || loading}
                    className={baseButtonClasses}
                    aria-label="Go to last page"
                    title="Last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </button>
            )}
        </nav>
    );
};

/**
 * Pagination Info Component
 * Shows current page info and total count
 */
interface PaginationInfoProps {
    pagination: UsePaginationReturn;
    itemName?: string;
    className?: string;
}

export const PaginationInfo: React.FC<PaginationInfoProps> = ({
    pagination,
    itemName = 'items',
    className = '',
}) => {
    const { currentPage, pageSize, totalCount, totalPages } = pagination;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className={`text-sm text-muted-foreground ${className}`}>
            {totalCount > 0 ? (
                <>
                    Showing <span className="font-medium">{startItem}</span> to{' '}
                    <span className="font-medium">{endItem}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> {itemName}
                    {totalPages > 1 && (
                        <>
                            {' '}(Page <span className="font-medium">{currentPage}</span> of{' '}
                            <span className="font-medium">{totalPages}</span>)
                        </>
                    )}
                </>
            ) : (
                `No ${itemName} found`
            )}
        </div>
    );
};

/**
 * Complete Pagination Component
 * Combines controls and info
 */
interface PaginationProps {
    pagination: UsePaginationReturn;
    itemName?: string;
    showInfo?: boolean;
    showFirstLast?: boolean;
    showPageNumbers?: boolean;
    maxPageNumbers?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    pagination,
    itemName = 'items',
    showInfo = true,
    showFirstLast = true,
    showPageNumbers = true,
    maxPageNumbers = 5,
    size = 'md',
    className = '',
}) => {
    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            {showInfo && (
                <PaginationInfo
                    pagination={pagination}
                    itemName={itemName}
                    className="order-2 sm:order-1"
                />
            )}

            <PaginationControls
                pagination={pagination}
                showFirstLast={showFirstLast}
                showPageNumbers={showPageNumbers}
                maxPageNumbers={maxPageNumbers}
                size={size}
                className="order-1 sm:order-2"
            />
        </div>
    );
};
