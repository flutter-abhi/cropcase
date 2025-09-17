/**
 * Delete Confirmation Modal Component
 * Modal for confirming case deletion with proper warnings
 */

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { UICaseData } from '@/types/ui';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    caseData: UICaseData;
    isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    caseData,
    isLoading = false
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isLoading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose, isLoading]);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
                aria-describedby="delete-modal-description"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    aria-label="Close modal"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>

                {/* Title */}
                <h2
                    id="delete-modal-title"
                    className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2"
                >
                    Delete Case
                </h2>

                {/* Description */}
                <p
                    id="delete-modal-description"
                    className="text-gray-600 dark:text-gray-300 text-center mb-6"
                >
                    Are you sure you want to delete <strong>&quot;{caseData.name}&quot;</strong>?
                    This action cannot be undone and will permanently remove all case data,
                    including crops, notes, and analytics.
                </p>

                {/* Case Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <div><strong>Case:</strong> {caseData.name}</div>
                        <div><strong>Land Size:</strong> {caseData.totalLand} acres</div>
                        <div><strong>Crops:</strong> {caseData.crops.length} crop(s)</div>
                        {caseData.location && (
                            <div><strong>Location:</strong> {caseData.location}</div>
                        )}
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-800 dark:text-red-200">
                            <strong>Warning:</strong> This will permanently delete all data associated with this case.
                            This includes crop information, notes, and any analytics data.
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete Case
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
