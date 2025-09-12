
import React from 'react';
import { MapPin, Calendar } from 'lucide-react';

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

interface BasicInfoStepProps {
    formData: {
        name: string;
        description: string;
        totalLand: number;
        location: string;
        startDate: string;
        endDate: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    errors: Record<string, string>;
}

export default function BasicInfoStep({ formData, setFormData, errors }: BasicInfoStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Case Name *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter case name"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Describe your farming case"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Total Land (acres) *
                    </label>
                    <input
                        type="number"
                        value={formData.totalLand}
                        onChange={(e) => setFormData((prev) => ({ ...prev, totalLand: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.1"
                    />
                    {errors.totalLand && <p className="text-sm text-red-500 mt-1">{errors.totalLand}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Location
                    </label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Farm location"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        End Date
                    </label>
                    <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
                </div>
            </div>
        </div>
    );
}
