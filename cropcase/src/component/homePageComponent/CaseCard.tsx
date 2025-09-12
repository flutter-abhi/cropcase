"use client";

import React, { useState, useEffect } from 'react';
import {
    MoreHorizontal,
    Eye,
    MapPin,
    Calendar,
    PieChart,
    TrendingUp,
    Heart,
    Share2
} from 'lucide-react';

interface CaseCardProps {
    caseData: {
        id: string;
        name: string;
        crops: Array<{
            name: string;
            weight: number;
            season: string;
        }>;
        user: {
            name: string;
            email: string;
        };
        createdAt: Date;
        totalLand: number;
        isOwner: boolean;
        // Community features (optional)
        likes?: number;
        views?: number;
        location?: string;
        description?: string;
        tags?: string[];
    };
    // Community mode props (optional)
    isCommunity?: boolean;
    onLike?: (caseId: string) => void;
    isLiked?: boolean;
}

export default function CaseCard({ caseData, isCommunity = false, onLike, isLiked = false }: CaseCardProps) {
    const { name, crops, user, createdAt, totalLand, isOwner, likes, views, location, description, tags } = caseData;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getSeasonColor = (season: string) => {
        switch (season.toLowerCase()) {
            case 'spring':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'summer':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'fall':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'winter':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const topCrop = crops.reduce((max, crop) => crop.weight > max.weight ? crop : max, crops[0]);
    const profitEstimate = Math.round(totalLand * 1500 + (totalLand * 100));

    return (
        <div className="group bg-card border border-border rounded-lg hover:shadow-lg transition-all duration-200 hover:border-primary/50 h-full flex flex-col relative">
            {/* Community Overlays */}
            {isCommunity && (
                <>
                    {/* Like Button */}
                    {onLike && (
                        <button
                            onClick={() => onLike(caseData.id)}
                            className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors ${isLiked
                                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                }`}
                        >
                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                    )}

                    {/* Community Stats */}
                    {(likes !== undefined || views !== undefined) && (
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                            {likes !== undefined && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs text-muted-foreground">
                                    <Heart className="h-3 w-3" />
                                    {likes + (isLiked ? 1 : 0)}
                                </div>
                            )}
                            {views !== undefined && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs text-muted-foreground">
                                    <TrendingUp className="h-3 w-3" />
                                    {views}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Location Badge */}
                    {location && (
                        <div className="absolute top-16 left-4 z-10">
                            <div className="flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {location}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {tags && tags.length > 0 && (
                        <div className="absolute bottom-20 left-4 right-4 z-10">
                            <div className="flex flex-wrap gap-1">
                                {tags.slice(0, 3).map((tag, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {totalLand} acres
                        </div>
                    </div>

                    {isOwner && !isCommunity && (
                        <button className="h-8 w-8 p-0 rounded-md hover:bg-accent flex items-center justify-center">
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Description for Community Cases */}
                {isCommunity && description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {description}
                    </p>
                )}

                <div className="space-y-4 flex-1">
                    {/* Crop Allocation */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">
                                Crop Allocation
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getSeasonColor(topCrop.season)}`}>
                                {topCrop.season}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {crops.slice(0, 3).map((crop, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{crop.name}</span>
                                    <span className="font-medium text-foreground">{crop.weight}%</span>
                                </div>
                            ))}
                            {crops.length > 3 && (
                                <div className="text-sm text-muted-foreground">
                                    +{crops.length - 3} more crops
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                            style={{ width: '85%' }}
                        />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <PieChart className="h-3 w-3 text-primary" />
                                <span className="text-xs text-muted-foreground">Efficiency</span>
                            </div>
                            <div className="font-semibold text-sm text-foreground">85%</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs text-muted-foreground">Est. Profit</span>
                            </div>
                            <div className="font-semibold text-sm text-foreground">
                                ${profitEstimate.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Fixed at bottom */}
                <div className="mt-auto pt-4">
                    {/* User Info and Date */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {isOwner ? 'You' : user.name}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {mounted ? formatDate(createdAt) : 'Loading...'}
                            </div>
                            {isCommunity && (
                                <button className="p-1 rounded hover:bg-accent transition-colors">
                                    <Share2 className="h-3 w-3 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Action Button - Fixed at bottom */}
                    <button className="w-full px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent hover:border-primary/50 transition-colors flex items-center justify-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}
