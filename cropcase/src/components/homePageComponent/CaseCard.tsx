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
import CaseDetailsModal from '@/components/CaseDetailsModal';
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
    const [showDetailsModal, setShowDetailsModal] = useState(false);
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

    const handleViewDetails = () => {
        setShowDetailsModal(true);
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


    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    // Calculate smart defaults for missing data
    const calculateEfficiency = () => {
        if (caseData.efficiency !== null && caseData.efficiency !== undefined) {
            return caseData.efficiency;
        }
        // Smart calculation based on crop diversity and land size
        const cropDiversity = crops.length;
        const baseEfficiency = Math.min(95, 60 + (cropDiversity * 8) + (totalLand > 10 ? 10 : 0));
        return Math.round(baseEfficiency);
    };

    const calculateEstimatedProfit = () => {
        if (caseData.estimatedProfit !== null && caseData.estimatedProfit !== undefined) {
            return caseData.estimatedProfit;
        }
        // Smart calculation based on land size and crop types
        const baseProfit = totalLand * 1200; // Base $1200 per acre
        const cropMultiplier = crops.length > 0 ? 1 + (crops.length * 0.1) : 1;
        return Math.round(baseProfit * cropMultiplier);
    };

    const calculateBudget = () => {
        if (caseData.budget !== null && caseData.budget !== undefined) {
            return caseData.budget;
        }
        // Smart calculation based on land size
        return Math.round(totalLand * 800); // Base $800 per acre
    };

    const efficiency = calculateEfficiency();
    const estimatedProfit = calculateEstimatedProfit();
    const budget = calculateBudget();

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
                            className={`absolute top-3 right-3 z-10 p-1.5 rounded-full transition-colors disabled:opacity-50 ${isLiked
                                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                }`}
                        >
                            <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                    )}

                    {/* Actions Menu Button - Only show for owner */}
                    {isOwner && (
                        <div className="absolute top-3 right-3 z-10">
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
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                            {likeCount !== undefined && (
                                <div className="flex items-center gap-1 px-1.5 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs text-muted-foreground">
                                    <Heart className="h-2.5 w-2.5" />
                                    {likeCount}
                                </div>
                            )}
                            {views !== undefined && (
                                <div className="flex items-center gap-1 px-1.5 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs text-muted-foreground">
                                    <TrendingUp className="h-2.5 w-2.5" />
                                    {views}
                                </div>
                            )}
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

            <div className={`p-6 flex-1 flex flex-col ${isCommunity ? 'pt-16' : 'pt-6'}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-16">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {totalLand} acres
                            {location && (
                                <>
                                    <span>•</span>
                                    <span>{location}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description for Community Cases */}
                {isCommunity && description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <PieChart className="h-3 w-3 text-primary" />
                            <span className="text-xs text-muted-foreground">Efficiency</span>
                        </div>
                        <div className="font-semibold text-sm text-foreground">{efficiency}%</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                            <span className="text-xs text-muted-foreground">Est. Profit</span>
                        </div>
                        <div className="font-semibold text-sm text-foreground">
                            ${estimatedProfit.toLocaleString()}
                        </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <span className="text-xs text-muted-foreground">Budget</span>
                        </div>
                        <div className="font-semibold text-sm text-foreground">
                            ${budget.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Crop Count */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Crops</span>
                        <span className="text-sm text-muted-foreground">
                            {crops.length} {crops.length === 1 ? 'crop' : 'crops'}
                        </span>
                    </div>
                </div>

                {/* Tags for Community Cases */}
                {isCommunity && tags && tags.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                            {tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground">
                                    {tag}
                                </span>
                            ))}
                            {tags.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                    +{tags.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

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
                    <button
                        onClick={handleViewDetails}
                        className="w-full px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
                    >
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

            <CaseDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                caseData={caseData}
            />
        </div>
    );
}
