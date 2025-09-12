
import React, { useState } from 'react';
import { DollarSign, Tag, X } from 'lucide-react';

interface FormData {
    name: string;
    description: string;
    totalLand: number;
    location: string;
    startDate: string;
    endDate: string;
    budget: number;
    isPublic: boolean;
    tags: string[];
    crops: Array<{
        name: string;
        weight: number;
        season: string;
    }>;
    notes: string;
}

interface SettingsStepProps {
    formData: {
        budget: number;
        isPublic: boolean;
        tags: string[];
        notes: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    errors: Record<string, string>;
}

export default function SettingsStep({ formData, setFormData, errors }: SettingsStepProps) {
    const [newTag, setNewTag] = useState('');

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove)
        }));
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Budget (Optional)
                </label>
                <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="0.01"
                />
            </div>

            <div>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                        className="rounded border-border"
                    />
                    <span className="text-sm font-medium text-foreground">
                        Make this case public (share with community)
                    </span>
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    <Tag className="inline h-4 w-4 mr-1" />
                    Tags
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Add a tag"
                    />
                    <button
                        onClick={addTag}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                            {tag}
                            <button
                                onClick={() => removeTag(tag)}
                                className="hover:text-red-500 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Notes
                </label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Additional notes or observations"
                />
            </div>
        </div>
    );
}
