'use client';

import React from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useCommunityPaginatedCases } from '@/hooks/usePaginatedCases';
import { useCommunityCasesStore } from '@/stores/communityCasesStore';
import { UICaseData } from '@/types/ui';
import Navigation from '@/components/homePageComponent/navbar';
import { FilterControls } from '@/components/filters/FilterControls';
import { Pagination } from '@/components/pagination/PaginationControls';
import { RefreshCw, Loader2, Users } from 'lucide-react';
import CaseCard from '@/components/homePageComponent/CaseCard';
import CreateCaseButton from '@/components/CreateCaseButton';

export default function CommunityCasesPage() {
    const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

    // Use your existing community pagination system
    const pagination = useCommunityPaginatedCases();
    const communityStore = useCommunityCasesStore();

    // Create filters object that matches the expected interface
    const filters = {
        searchTerm: communityStore.filters.searchTerm,
        sortBy: communityStore.filters.sortBy,
        sortOrder: communityStore.filters.sortOrder,
        season: communityStore.filters.season,
        tags: communityStore.filters.tags,
        landRange: {
            min: communityStore.filters.minLand,
            max: communityStore.filters.maxLand,
        },
        setSearchTerm: communityStore.setSearchTerm,
        setSortBy: communityStore.setSortBy,
        setSortOrder: communityStore.setSortOrder,
        setSeason: communityStore.setSeason,
        setTags: communityStore.setTags,
        setLandRange: communityStore.setLandRange,
        clearFilters: communityStore.clearFilters,
        hasActiveFilters:
            communityStore.filters.searchTerm !== '' ||
            communityStore.filters.season !== 'all' ||
            communityStore.filters.tags.length > 0 ||
            communityStore.filters.minLand !== undefined ||
            communityStore.filters.maxLand !== undefined,
        filterCount: [
            communityStore.filters.searchTerm !== '',
            communityStore.filters.season !== 'all',
            communityStore.filters.tags.length > 0,
            communityStore.filters.minLand !== undefined || communityStore.filters.maxLand !== undefined,
        ].filter(Boolean).length,
    };

    // Handle case deletion
    const handleCaseDeleted = async (caseId: string) => {
        console.log('Case deleted, refreshing data:', caseId);
        // Refresh the data to remove the deleted case
        await communityStore.refresh();
    };

    // Handle case update
    const handleCaseUpdated = async (updatedCaseData: UICaseData) => {
        console.log('Case updated, refreshing data:', updatedCaseData.id);
        // Refresh the data to show updated case
        await communityStore.refresh();
    };

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
                            <h1 className="text-3xl font-bold text-foreground">Community Cases</h1>
                            <p className="mt-2 text-muted-foreground">
                                Explore and learn from other farmers • {pagination.stats.totalCases} cases
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
                                <p className="text-muted-foreground">Loading community cases...</p>
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
                                        <CaseCard
                                            key={caseData.id}
                                            caseData={caseData}
                                            isCommunity={true}
                                            onCaseDeleted={handleCaseDeleted}
                                            onCaseUpdated={handleCaseUpdated}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {filters.hasActiveFilters ? 'No community cases match your filters' : 'No community cases yet'}
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {filters.hasActiveFilters
                                            ? 'Try adjusting your search criteria or clear filters to see more cases'
                                            : 'Be the first to share your farming knowledge with the community by making your cases public'
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
                                itemName="community cases"
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