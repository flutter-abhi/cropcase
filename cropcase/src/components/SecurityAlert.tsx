'use client';

import React from 'react';
import { AlertTriangle, Shield, Info } from 'lucide-react';

interface SecurityAlertProps {
    error: string;
    onDismiss: () => void;
}

export const SecurityAlert: React.FC<SecurityAlertProps> = ({ error, onDismiss }) => {
    const isSecurityAlert = error.includes('Security Alert');

    if (!isSecurityAlert) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Security Alert
                        </h3>

                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {error}
                        </p>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                            <div className="flex items-start space-x-3">
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                        How We Detected This Issue:
                                    </h4>
                                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                        <li>• <strong>Token Validation:</strong> We check if your access token belongs to your account</li>
                                        <li>• <strong>User ID Matching:</strong> We verify the tokens user ID matches your stored profile</li>
                                        <li>• <strong>Email Verification:</strong> We confirm the tokens email matches your account email</li>
                                        <li>• <strong>Real-time Monitoring:</strong> We continuously monitor for token manipulation</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                                        What This Means:
                                    </h4>
                                    <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                                        <li>• Your session tokens were manipulated or corrupted</li>
                                        <li>• This could happen if someone manually changed tokens in browser storage</li>
                                        <li>• Or if there was a token synchronization issue</li>
                                        <li>• We logged you out to prevent unauthorized access to your data</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={onDismiss}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                I Understand - Login Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
