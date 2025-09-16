'use client';

import React from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { usePaginatedCases, useFilters } from '@/hooks/usePaginatedCases';
import Navigation from '@/components/homePageComponent/navbar';
import { FilterControls } from '@/components/filters/FilterControls';
import { Pagination } from '@/components/pagination/PaginationControls';
import { RefreshCw, Loader2, Plus } from 'lucide-react';
import CaseCard from '@/components/homePageComponent/CaseCard';
import CreateCaseButton from '@/components/CreateCaseButton';

export default function CasesPage() {
    const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

    // Use your existing pagination system
    const pagination = usePaginatedCases();
    const filters = useFilters();

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect to login
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            {/* Page Header */}
            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">My Cases</h1>
                            <p className="mt-2 text-muted-foreground">
                                Manage your crop portfolio • {pagination.stats.totalCases} cases • {pagination.stats.totalLand} acres
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={pagination.refresh}
                                disabled={pagination.loading}
                                className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${pagination.loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <CreateCaseButton />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="px-4 pb-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <FilterControls filters={filters} />
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Loading State */}
                    {pagination.loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                <p className="text-muted-foreground">Loading your cases...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {pagination.error && (
                        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/10">
                            <p className="text-destructive">{pagination.error}</p>
                            <button
                                onClick={pagination.refresh}
                                className="mt-2 px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 text-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Cases Grid */}
                    {!pagination.loading && !pagination.error && (
                        <>
                            {pagination.data.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pagination.data.map((caseData) => (
                                        <CaseCard key={caseData.id} caseData={caseData} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                                        <Plus className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {filters.hasActiveFilters ? 'No cases match your filters' : 'No cases yet'}
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {filters.hasActiveFilters
                                            ? 'Try adjusting your search criteria or clear filters to see more cases'
                                            : 'Create your first crop case to get started with portfolio management'
                                        }
                                    </p>
                                    {filters.hasActiveFilters ? (
                                        <button
                                            onClick={filters.clearFilters}
                                            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    ) : (
                                        <CreateCaseButton />
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Pagination Controls */}
                    {!pagination.loading && !pagination.error && pagination.totalPages > 1 && (
                        <div className="pt-6">
                            <Pagination
                                pagination={pagination}
                                itemName="cases"
                                showInfo={true}
                                showFirstLast={true}
                                showPageNumbers={true}
                                maxPageNumbers={5}
                                size="md"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}