/**
 * Case Skeleton Loading Component
 * Production-ready skeleton for case cards
 */

import React from 'react';

export const CaseSkeleton: React.FC = () => {
    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-pulse">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    {/* Title */}
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    {/* User info */}
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
                {/* Season badge */}
                <div className="h-6 w-16 bg-muted rounded-full"></div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-1"></div>
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                </div>
                <div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-1"></div>
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                </div>
            </div>

            {/* Crops section */}
            <div className="mb-4">
                <div className="h-4 bg-muted rounded w-1/4 mb-3"></div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="h-3 bg-muted rounded w-2/5"></div>
                        <div className="h-3 bg-muted rounded w-1/5"></div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-muted rounded"></div>
                    <div className="h-8 w-8 bg-muted rounded"></div>
                </div>
            </div>
        </div>
    );
};

export const CaseSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <CaseSkeleton key={index} />
            ))}
        </div>
    );
};

export const CaseSkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                        {/* Image placeholder */}
                        <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                            <div className="h-5 bg-muted rounded w-3/4"></div>
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                            <div className="flex gap-2">
                                <div className="h-3 bg-muted rounded w-16"></div>
                                <div className="h-3 bg-muted rounded w-20"></div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <div className="h-8 w-8 bg-muted rounded"></div>
                            <div className="h-8 w-8 bg-muted rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
