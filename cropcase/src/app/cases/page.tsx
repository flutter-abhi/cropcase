"use client";

import React from 'react';
import Navigation from "@/components/homePageComponent/navbar";
import CaseCard from "@/components/homePageComponent/CaseCard";
import CreateCaseButton from "@/components/CreateCaseButton";
import { RefreshCw, Sprout } from "lucide-react";
import { usePaginatedCases, useFilters, usePagination } from "@/hooks/usePaginatedCases";
import { Pagination } from "@/components/pagination/PaginationControls";
import { FilterControls } from "@/components/filters/FilterControls";
import { CaseSkeletonGrid } from "@/components/loading/CaseSkeleton";

export default function Cases() {
    const paginatedCases = usePaginatedCases();
    const filters = useFilters();
    const pagination = usePagination();

    const {
        data: cases,
        loading,
        error,
        stats,
        refresh,
        isEmpty,
    } = paginatedCases;

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            {/* Header Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">My Cases</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your crop portfolio • {stats.totalCases} cases • {stats.totalLand} acres
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={refresh}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <CreateCaseButton variant="section" />
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="mb-8">
                        <FilterControls
                            filters={filters}
                            availableSeasons={['Spring', 'Summer', 'Autumn', 'Winter']}
                            availableTags={['Organic', 'Hydroponic', 'Traditional', 'Experimental']}
                        />
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="mb-8">
                            <CaseSkeletonGrid count={6} />
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-800 mb-8">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                            <button
                                onClick={refresh}
                                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Cases Grid */}
                    {!loading && !error && (
                        <>
                            {!isEmpty ? (
                                <>
                                    {/* Cases Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        {cases.filter(c => c.isOwner).map((caseData) => (
                                            <CaseCard key={caseData.id} caseData={caseData} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    <Pagination
                                        pagination={pagination}
                                        itemName="cases"
                                        className="mt-8"
                                    />
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                                        <Sprout className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No cases found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {filters.hasActiveFilters
                                            ? "Try adjusting your filters or create a new case"
                                            : "Create your first crop case to get started with portfolio management"
                                        }
                                    </p>
                                    <div className="flex items-center justify-center gap-3">
                                        {filters.hasActiveFilters && (
                                            <button
                                                onClick={filters.clearFilters}
                                                className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                        <CreateCaseButton variant="section" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}