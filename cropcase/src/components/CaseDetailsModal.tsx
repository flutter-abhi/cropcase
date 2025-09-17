"use client";

import React, { useEffect } from 'react';
import { X, MapPin, Calendar, PieChart, TrendingUp, User, Tag, FileText } from 'lucide-react';
import { UICaseData } from '@/types/ui';

interface CaseDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseData: UICaseData;
}

export default function CaseDetailsModal({ isOpen, onClose, caseData }: CaseDetailsModalProps) {

    const {
        name,
        crops,
        user,
        createdAt,
        totalLand,
        location,
        description,
        tags,
        efficiency,
        estimatedProfit,
        budget,
        status
    } = caseData;

    // Calculate smart defaults for missing data
    const calculateEfficiency = () => {
        if (efficiency !== null && efficiency !== undefined) {
            return efficiency;
        }
        const cropDiversity = crops.length;
        const baseEfficiency = Math.min(95, 60 + (cropDiversity * 8) + (totalLand > 10 ? 10 : 0));
        return Math.round(baseEfficiency);
    };

    const calculateEstimatedProfit = () => {
        if (estimatedProfit !== null && estimatedProfit !== undefined) {
            return estimatedProfit;
        }
        const baseProfit = totalLand * 1200;
        const cropMultiplier = crops.length > 0 ? 1 + (crops.length * 0.1) : 1;
        return Math.round(baseProfit * cropMultiplier);
    };

    const calculateBudget = () => {
        if (budget !== null && budget !== undefined) {
            return budget;
        }
        return Math.round(totalLand * 800);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

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

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Handle ESC key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">{name}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-accent rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Overview Section */}
                    <div>
                        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-primary" />
                            Overview
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(status || 'active')}`}>
                                        {status || 'Active'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Efficiency</span>
                                    <span className="text-sm font-medium text-foreground">{calculateEfficiency()}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Est. Profit</span>
                                    <span className="text-sm font-medium text-foreground">${calculateEstimatedProfit().toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Budget</span>
                                    <span className="text-sm font-medium text-foreground">${calculateBudget().toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Land</span>
                                    <span className="text-sm font-medium text-foreground">{totalLand} acres</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Crops</span>
                                    <span className="text-sm font-medium text-foreground">{crops.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location & Dates */}
                    <div>
                        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Location & Timeline
                        </h3>
                        <div className="space-y-3">
                            {location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-foreground">{location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">Created on {formatDate(createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Crop Distribution */}
                    {crops.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Crop Distribution
                            </h3>
                            <div className="space-y-3">
                                {crops.map((crop, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-foreground">{crop.name}</span>
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getSeasonColor(crop.season)}`}>
                                                {crop.season}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{crop.weight}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {tags && tags.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                                <Tag className="h-5 w-5 text-primary" />
                                Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {description && (
                        <div>
                            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Description
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                        </div>
                    )}

                    {/* User Info */}
                    <div>
                        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Case Owner
                        </h3>
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-foreground">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
