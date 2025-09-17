"use client";

import React, { useState, useEffect } from 'react';
import {
    Eye,
    MapPin,
    Calendar,
    PieChart,
    TrendingUp,
    Heart,
    Share2
} from 'lucide-react';
import { UICaseData } from '@/types/ui';
import { useLike } from '@/hooks/useLike';
import { CaseActionsMenu, MenuButton } from '@/components/CaseActionsMenu';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { ShareModal } from '@/components/ShareModal';
import CreateCaseModal from '@/components/CreateCaseModal';
import { useToast } from '@/components/Toast';
import { useApi } from '@/hooks/useApi';

interface CaseCardProps {
    caseData: UICaseData;
    // Community mode props (optional)
    isCommunity?: boolean;
    // Callback when case is deleted
    onCaseDeleted?: (caseId: string) => void;
    // Callback when case is updated
    onCaseUpdated?: (caseData: UICaseData) => void;
}

export default function CaseCard({ caseData, isCommunity = false, onCaseDeleted, onCaseUpdated }: CaseCardProps) {
    const { name, crops, user, createdAt, totalLand, isOwner, likes, isLiked: initialIsLiked, views, location, description, tags, id } = caseData;
    const [mounted, setMounted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { showToast } = useToast();
    const { del } = useApi();

    // Use like functionality for community cases
    const { isLiked, likeCount, isLoading, toggleLike } = useLike({
        caseId: id,
        initialLiked: initialIsLiked || false,
        initialLikeCount: likes || 0,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Menu handlers
    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleMenuClose = () => {
        setIsMenuOpen(false);
    };

    const handleEdit = () => {
        setShowEditModal(true);
        handleMenuClose();
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
        handleMenuClose();
    };

    const handleShare = () => {
        setShowShareModal(true);
        handleMenuClose();
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await del(`/api/cases/${id}`);
            console.log('Case deleted successfully:', id);

            // Close modal
            setShowDeleteModal(false);

            // Show success toast
            showToast('success', `Case "${name}" deleted successfully`);

            // Notify parent component
            if (onCaseDeleted) {
                onCaseDeleted(id);
            }
        } catch (error) {
            console.error('Failed to delete case:', error);
            // Show error toast
            showToast('error', `Failed to delete case "${name}". Please try again.`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditSubmit = (updatedCaseData: UICaseData) => {
        console.log('Case updated successfully:', updatedCaseData);
        setShowEditModal(false);

        // Show success toast
        showToast('success', `Case "${updatedCaseData.name}" updated successfully`);

        // Notify parent component
        if (onCaseUpdated) {
            onCaseUpdated(updatedCaseData);
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

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const topCrop = crops.length > 0 ? crops.reduce((max, crop) => crop.weight > max.weight ? crop : max, crops[0]) : null;
    const profitEstimate = Math.round(totalLand * 1500 + (totalLand * 100));

    return (
        <div className="group bg-card border border-border rounded-lg hover:shadow-lg transition-all duration-200 hover:border-primary/50 h-full flex flex-col relative">
            {/* Community Overlays */}
            {isCommunity && (
                <>
                    {/* Like Button */}
                    {!isOwner && (
                        <button
                            onClick={toggleLike}
                            disabled={isLoading}
                            className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors disabled:opacity-50 ${isLiked
                                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                }`}
                        >
                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                    )}

                    {/* Actions Menu Button - Only show for owner */}
                    {isOwner && (
                        <div className="absolute top-4 right-4 z-10">
                            <MenuButton
                                onClick={handleMenuToggle}
                                isOpen={isMenuOpen}
                                aria-label="Case actions menu"
                            />
                            <CaseActionsMenu
                                isOpen={isMenuOpen}
                                onClose={handleMenuClose}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onShare={handleShare}
                            />
                        </div>
                    )}

                    {/* Community Stats */}
                    {(likeCount !== undefined || views !== undefined) && (
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                            {likeCount !== undefined && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs text-muted-foreground">
                                    <Heart className="h-3 w-3" />
                                    {likeCount}
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

            {/* Actions Menu for Non-Community Cases (User's Own Cases) */}
            {!isCommunity && isOwner && (
                <div className="absolute top-4 right-4 z-10">
                    <MenuButton
                        onClick={handleMenuToggle}
                        isOpen={isMenuOpen}
                        aria-label="Case actions menu"
                    />
                    <CaseActionsMenu
                        isOpen={isMenuOpen}
                        onClose={handleMenuClose}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onShare={handleShare}
                    />
                </div>
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
                            {topCrop && (
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getSeasonColor(topCrop.season)}`}>
                                    {topCrop.season}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            {crops.length > 0 ? (
                                <>
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
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-2">
                                    No crops added yet
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

            {/* Modals */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                caseData={caseData}
                isLoading={isDeleting}
            />

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                caseData={caseData}
            />

            <CreateCaseModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleEditSubmit}
                editData={caseData}
                mode="edit"
            />
        </div>
    );
}
