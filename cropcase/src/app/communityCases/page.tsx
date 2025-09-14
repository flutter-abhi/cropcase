"use client";

import React, { useState } from 'react';
import Navigation from "@/components/homePageComponent/navbar";
import CaseCard from "@/components/homePageComponent/CaseCard";
import { Users, TrendingUp, Heart, RefreshCw } from "lucide-react";
import { useCommunityPaginatedCases, useFilters } from "@/hooks/usePaginatedCases";
import { Pagination } from "@/components/pagination/PaginationControls";
import { FilterControls } from "@/components/filters/FilterControls";
import { CaseSkeletonGrid } from "@/components/loading/CaseSkeleton";

export default function CommunityCases() {
    const paginatedCases = useCommunityPaginatedCases();
    const filters = useFilters();

    const [likedCases, setLikedCases] = useState<string[]>([]);

    const {
        data: cases,
        loading,
        error,
        refresh,
        isEmpty,
        stats,
        currentPage,
        pageSize,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        goToPage,
        nextPage,
        prevPage,
        firstPage,
        lastPage,
        canGoNext,
        canGoPrev,
    } = paginatedCases;

    // Cases are already filtered by service (excludes current user)
    const communityCases = cases;

    // Stats for community cases
    const communityStats = {
        totalCases: stats.totalCases, // Use stats from pagination
        totalViews: communityCases.reduce((total, case_) => total + (case_.views || 0), 0),
        totalLikes: communityCases.reduce((total, case_) => total + (case_.likes || 0), 0),
        avgEfficiency: communityCases.length > 0
            ? communityCases.reduce((total, case_) => total + (case_.efficiency || 0), 0) / communityCases.length
            : 0,
    };

    const handleLike = (caseId: string) => {
        setLikedCases(prev =>
            prev.includes(caseId)
                ? prev.filter(id => id !== caseId)
                : [...prev, caseId]
        );
    };

    // Create pagination object for the Pagination component
    const pagination = {
        currentPage,
        pageSize,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        loading,
        error,
        data: cases,
        isEmpty,
        goToPage,
        nextPage,
        prevPage,
        firstPage,
        lastPage,
        refresh,
        canGoNext,
        canGoPrev,
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            {/* Header Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Page Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Community Knowledge</span>
                        </div>
                        <h1 className="text-4xl font-bold text-foreground mb-4">Community Cases</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Learn from experienced farmers and discover innovative crop management strategies
                            shared by our community.
                        </p>
                    </div>

                    {/* Community Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <div className="bg-card border border-border rounded-xl p-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-1">{communityStats.totalCases}</h3>
                            <p className="text-sm text-muted-foreground">Community Cases</p>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-3">
                                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-1">{communityStats.totalViews.toLocaleString()}</h3>
                            <p className="text-sm text-muted-foreground">Total Views</p>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mb-3">
                                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-1">{communityStats.totalLikes}</h3>
                            <p className="text-sm text-muted-foreground">Community Likes</p>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mb-3">
                                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-1">{communityStats.avgEfficiency.toFixed(1)}%</h3>
                            <p className="text-sm text-muted-foreground">Avg Efficiency</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Explore Cases</h2>
                            <p className="text-muted-foreground mt-1">
                                Discover innovative farming strategies from the community
                            </p>
                        </div>
                        <button
                            onClick={refresh}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
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
                            <CaseSkeletonGrid count={9} />
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
                            {!isEmpty && communityCases.length > 0 ? (
                                <>
                                    {/* Cases Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        {communityCases.map((caseData) => (
                                            <CaseCard
                                                key={caseData.id}
                                                caseData={caseData}
                                                isCommunity={true}
                                                isLiked={likedCases.includes(caseData.id)}
                                                onLike={() => handleLike(caseData.id)}
                                            />
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
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No community cases found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {filters.hasActiveFilters
                                            ? "Try adjusting your filters to find more cases"
                                            : "Be the first to share your farming knowledge with the community"
                                        }
                                    </p>
                                    {filters.hasActiveFilters && (
                                        <button
                                            onClick={filters.clearFilters}
                                            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}