/**
 * Like Hook
 * Instagram-like optimistic UI updates for like/unlike functionality
 */

import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { useAuth } from './useAuth';
import { useToast } from '@/components/Toast';

interface UseLikeOptions {
    caseId: string;
    initialLiked?: boolean;
    initialLikeCount?: number;
}

interface UseLikeReturn {
    isLiked: boolean;
    likeCount: number;
    isLoading: boolean;
    toggleLike: () => Promise<void>;
}

export const useLike = ({ caseId, initialLiked = false, initialLikeCount = 0 }: UseLikeOptions): UseLikeReturn => {
    const { post, del } = useApi();
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();

    // Optimistic state - updated immediately for instant UI feedback
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLoading, setIsLoading] = useState(false);

    const toggleLike = useCallback(async () => {
        if (!isAuthenticated) {
            showToast('warning', "Please log in to like cases");
            return;
        }

        if (isLoading) return; // Prevent multiple rapid clicks

        setIsLoading(true);

        // Optimistic update - update UI immediately
        const newLikedState = !isLiked;
        const newLikeCount = newLikedState ? likeCount + 1 : Math.max(0, likeCount - 1);

        setIsLiked(newLikedState);
        setLikeCount(newLikeCount);

        try {
            if (newLikedState) {
                // Like the case
                await post(`/api/cases/${caseId}/like`, {});
                showToast('success', '❤️ Case liked!');
            } else {
                // Unlike the case
                await del(`/api/cases/${caseId}/like`);
                showToast('info', '💔 Case unliked');
            }
        } catch (error) {
            // Revert optimistic update on error
            setIsLiked(!newLikedState);
            setLikeCount(likeCount);

            const errorMessage = error instanceof Error ? error.message : 'Failed to update like';

            // Handle specific error cases
            if (errorMessage.includes('already liked')) {
                showToast('info', 'You already liked this case!');
            } else if (errorMessage.includes('not liked')) {
                showToast('info', 'You haven\'t liked this case yet!');
            } else {
                showToast('error', errorMessage);
            }

            console.error('Like/unlike error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, isLiked, likeCount, isLoading, caseId, post, del, showToast]);

    return {
        isLiked,
        likeCount,
        isLoading,
        toggleLike,
    };
};
