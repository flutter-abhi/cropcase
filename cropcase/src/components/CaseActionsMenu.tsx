/**
 * Case Actions Menu Component
 * Dropdown menu with case action options (Edit, Delete, Share)
 */

import React, { useRef, useEffect } from 'react';
import { Edit, Trash2, Share2, MoreVertical } from 'lucide-react';

interface CaseActionsMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onShare: () => void;
    className?: string;
}

export const CaseActionsMenu: React.FC<CaseActionsMenuProps> = ({
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onShare,
    className = ''
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Close menu on escape key
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

    if (!isOpen) return null;

    const menuItems = [
        {
            icon: Edit,
            label: 'Edit Case',
            onClick: () => onEdit(),
            className: 'text-blue-600 hover:bg-blue-50'
        },
        {
            icon: Share2,
            label: 'Share Case',
            onClick: () => onShare(),
            className: 'text-green-600 hover:bg-green-50'
        },
        {
            icon: Trash2,
            label: 'Delete Case',
            onClick: () => onDelete(),
            className: 'text-red-600 hover:bg-red-50'
        }
    ];

    return (
        <div
            ref={menuRef}
            className={`absolute right-0 top-8 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 ${className}`}
            role="menu"
            aria-orientation="vertical"
        >
            {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <button
                        key={index}
                        onClick={item.onClick}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${item.className}`}
                        role="menuitem"
                    >
                        <Icon className="h-4 w-4" />
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
};

/**
 * 3-Dot Menu Button Component
 * Reusable button that can be used independently
 */
interface MenuButtonProps {
    onClick: () => void;
    isOpen: boolean;
    className?: string;
    'aria-label'?: string;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
    onClick,
    isOpen,
    className = '',
    'aria-label': ariaLabel = 'Open menu'
}) => {
    return (
        <button
            onClick={onClick}
            className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${className}`}
            aria-label={ariaLabel}
            aria-expanded={isOpen}
            aria-haspopup="menu"
        >
            <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
    );
};
