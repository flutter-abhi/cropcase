/**
 * Filter Controls Component
 * Production-ready filter UI with search, sort, and advanced filters
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, SortAsc, SortDesc } from 'lucide-react';
import { UseFiltersReturn } from '@/types/pagination';
import { SORT_OPTIONS } from '@/constants/pagination';
import { debounce } from 'lodash';

interface FilterControlsProps {
    filters: UseFiltersReturn;
    className?: string;
    showAdvancedFilters?: boolean;
    availableSeasons?: string[];
    availableTags?: string[];
}

export const FilterControls: React.FC<FilterControlsProps> = ({
    filters,
    className = '',
    showAdvancedFilters = true,
    availableSeasons = ['Spring', 'Summer', 'Autumn', 'Winter'],
    availableTags = ['Organic', 'Hydroponic', 'Traditional', 'Experimental'],
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm);

    // Debounced search to avoid excessive API calls
    const debouncedSetSearchTerm = useMemo(
        () => debounce(filters.setSearchTerm, 300),
        [filters.setSearchTerm]
    );

    const handleSearchChange = useCallback((value: string) => {
        setLocalSearchTerm(value);
        debouncedSetSearchTerm(value);
    }, [debouncedSetSearchTerm]);

    const handleTagToggle = useCallback((tag: string) => {
        const newTags = filters.tags.includes(tag)
            ? filters.tags.filter(t => t !== tag)
            : [...filters.tags, tag];
        filters.setTags(newTags);
    }, [filters]);

    const handleLandRangeChange = useCallback((min?: number, max?: number) => {
        filters.setLandRange(min, max);
    }, [filters]);

    const sortOptions = [
        { value: SORT_OPTIONS.RECENT, label: 'Most Recent' },
        { value: SORT_OPTIONS.POPULAR, label: 'Most Popular' },
        { value: SORT_OPTIONS.VIEWS, label: 'Most Viewed' },
        { value: SORT_OPTIONS.ALPHABETICAL, label: 'Alphabetical' },
    ];

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Main Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search cases, crops, or tags..."
                        value={localSearchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {localSearchTerm && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={filters.sortBy}
                        onChange={(e) => filters.setSortBy(e.target.value as 'recent' | 'popular' | 'views' | 'alphabetical')}
                        className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Sort Order Toggle */}
                <button
                    onClick={() => filters.setSortOrder(filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                    {filters.sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                    ) : (
                        <SortDesc className="h-4 w-4" />
                    )}
                </button>

                {/* Advanced Filters Toggle */}
                {showAdvancedFilters && (
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showAdvanced || filters.hasActiveFilters
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-foreground hover:bg-accent'
                            }`}
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        {filters.filterCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                {filters.filterCount}
                            </span>
                        )}
                    </button>
                )}

                {/* Clear Filters */}
                {filters.hasActiveFilters && (
                    <button
                        onClick={filters.clearFilters}
                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && showAdvanced && (
                <div className="border border-border rounded-lg p-4 bg-card space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Season Filter */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Season
                            </label>
                            <select
                                value={filters.season}
                                onChange={(e) => filters.setSeason(e.target.value)}
                                className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="all">All Seasons</option>
                                {availableSeasons.map((season) => (
                                    <option key={season} value={season.toLowerCase()}>
                                        {season}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Land Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Land Range (acres)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.landRange.min || ''}
                                    onChange={(e) => handleLandRangeChange(
                                        e.target.value ? parseInt(e.target.value) : undefined,
                                        filters.landRange.max
                                    )}
                                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.landRange.max || ''}
                                    onChange={(e) => handleLandRangeChange(
                                        filters.landRange.min,
                                        e.target.value ? parseInt(e.target.value) : undefined
                                    )}
                                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Tags Filter */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagToggle(tag)}
                                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${filters.tags.includes(tag)
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-background text-foreground hover:bg-accent'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {filters.hasActiveFilters && (
                        <div className="pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Active filters:</span>
                                <div className="flex flex-wrap gap-2">
                                    {filters.searchTerm && (
                                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                            Search: &quot;{filters.searchTerm}&quot;
                                        </span>
                                    )}
                                    {filters.season !== 'all' && (
                                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                            Season: {filters.season}
                                        </span>
                                    )}
                                    {filters.tags.length > 0 && (
                                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                            Tags: {filters.tags.join(', ')}
                                        </span>
                                    )}
                                    {(filters.landRange.min || filters.landRange.max) && (
                                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                            Land: {filters.landRange.min || 0} - {filters.landRange.max || '∞'} acres
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
