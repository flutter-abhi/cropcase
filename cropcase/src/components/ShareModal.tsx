/**
 * Share Modal Component
 * Modal for sharing case with various options
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Copy, Mail, MessageSquare, X, ExternalLink, Check } from 'lucide-react';
import { UICaseData } from '@/types/ui';
import { useToast } from '@/components/Toast';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseData: UICaseData;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    caseData
}) => {
    const [shareUrl, setShareUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const urlInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const generateShareUrl = useCallback(async () => {
        setIsGenerating(true);
        try {
            // Generate proper share URL
            const baseUrl = window.location.origin;
            const shareUrl = `${baseUrl}/cases/${caseData.id}`;
            setShareUrl(shareUrl);
        } catch (error) {
            console.error('Failed to generate share URL:', error);
            setShareUrl(`${window.location.origin}/cases/${caseData.id}`);
        } finally {
            setIsGenerating(false);
        }
    }, [caseData.id]);

    // Generate share URL when modal opens
    useEffect(() => {
        if (isOpen) {
            generateShareUrl();
        }
    }, [isOpen, generateShareUrl]);

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Focus management
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            if (firstElement) {
                firstElement.focus();
            }
        }
    }, [isOpen]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            showToast('success', 'Share link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Fallback for older browsers
            if (urlInputRef.current) {
                urlInputRef.current.select();
                document.execCommand('copy');
                setCopied(true);
                showToast('success', 'Share link copied to clipboard!');
                setTimeout(() => setCopied(false), 2000);
            } else {
                showToast('error', 'Failed to copy link. Please try again.');
            }
        }
    };

    const shareViaEmail = () => {
        const subject = `Check out this farming case: ${caseData.name}`;
        const body = `I wanted to share this farming case with you:\n\n${caseData.name}\n${caseData.description || 'A detailed farming case study'}\n\nLand Size: ${caseData.totalLand} acres\nCrops: ${caseData.crops.length} crop(s)\n${caseData.location ? `Location: ${caseData.location}\n` : ''}\nView the full case details here: ${shareUrl}\n\nThis case might be helpful for your farming insights!`;
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl);
        showToast('info', 'Email client opened with case details');
    };

    const shareViaSocial = (platform: string) => {
        const baseText = `Check out this farming case: ${caseData.name}`;
        const detailedText = `${baseText}\n\n🌱 ${caseData.totalLand} acres • ${caseData.crops.length} crop(s)${caseData.location ? ` • 📍 ${caseData.location}` : ''}\n\n${caseData.description || 'A detailed farming case study'}`;
        let url = '';

        switch (platform) {
            case 'twitter':
                // Twitter has character limit, use shorter text
                const twitterText = `${baseText} 🌱 ${caseData.totalLand} acres • ${caseData.crops.length} crop(s)`;
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}&hashtags=Farming,Agriculture,CropCase`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(detailedText)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(caseData.name)}&summary=${encodeURIComponent(caseData.description || 'A detailed farming case study')}`;
                break;
            default:
                return;
        }

        window.open(url, '_blank', 'width=600,height=400');
        showToast('info', `Opening ${platform} to share case`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-modal-title"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close modal"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Share2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>

                {/* Title */}
                <h2
                    id="share-modal-title"
                    className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2"
                >
                    Share Case
                </h2>

                {/* Case Info */}
                <div className="text-center mb-6">
                    <h3 className="font-medium text-gray-900 dark:text-white">{caseData.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {caseData.totalLand} acres • {caseData.crops.length} crop(s)
                    </p>
                </div>

                {/* Share URL */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Share Link
                    </label>
                    <div className="flex gap-2">
                        <input
                            ref={urlInputRef}
                            type="text"
                            value={isGenerating ? 'Generating...' : shareUrl}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm"
                        />
                        <button
                            onClick={copyToClipboard}
                            disabled={isGenerating || !shareUrl}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Share Options */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Share via
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={shareViaEmail}
                            className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium">Email</span>
                        </button>

                        <button
                            onClick={() => shareViaSocial('twitter')}
                            className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium">Twitter</span>
                        </button>

                        <button
                            onClick={() => shareViaSocial('facebook')}
                            className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ExternalLink className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium">Facebook</span>
                        </button>

                        <button
                            onClick={() => shareViaSocial('linkedin')}
                            className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ExternalLink className="h-5 w-5 text-blue-700" />
                            <span className="text-sm font-medium">LinkedIn</span>
                        </button>
                    </div>
                </div>

                {/* Close Button */}
                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
