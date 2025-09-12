
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

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

interface CropSelectionStepProps {
    formData: {
        crops: Array<{
            name: string;
            weight: number;
            season: string;
        }>;
    };
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    errors: Record<string, string>;
}

const availableCrops = [
    { name: "Wheat", season: "Summer" },
    { name: "Corn", season: "Summer" },
    { name: "Barley", season: "Winter" },
    { name: "Tomatoes", season: "Summer" },
    { name: "Lettuce", season: "Spring" },
    { name: "Carrots", season: "Fall" },
    { name: "Spinach", season: "Winter" },
    { name: "Peppers", season: "Summer" },
    { name: "Oats", season: "Winter" },
    { name: "Soybeans", season: "Fall" },
    { name: "Broccoli", season: "Spring" },
    { name: "Radish", season: "Spring" }
];

const seasons = ["Spring", "Summer", "Fall", "Winter"];

export default function CropSelectionStep({ formData, setFormData, errors }: CropSelectionStepProps) {
    const addCrop = () => {
        setFormData((prev) => ({
            ...prev,
            crops: [...prev.crops, { name: '', weight: 0, season: 'Summer' }]
        }));
    };

    const removeCrop = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            crops: prev.crops.filter((_, i) => i !== index)
        }));
    };

    const updateCrop = (index: number, field: string, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            crops: prev.crops.map((crop, i) =>
                i === index ? { ...crop, [field]: value } : crop
            )
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">Crop Selection & Allocation</h3>
                <button
                    onClick={addCrop}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Crop
                </button>
            </div>

            {formData.crops.map((crop, index) => (
                <div key={index} className="p-4 border border-border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-foreground">Crop {index + 1}</h4>
                        <button
                            onClick={() => removeCrop(index)}
                            className="p-1 hover:bg-accent rounded transition-colors"
                        >
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Crop Name
                            </label>
                            <select
                                value={crop.name}
                                onChange={(e) => updateCrop(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Select crop</option>
                                {availableCrops.map(cropOption => (
                                    <option key={cropOption.name} value={cropOption.name}>
                                        {cropOption.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Season
                            </label>
                            <select
                                value={crop.season}
                                onChange={(e) => updateCrop(index, 'season', e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                {seasons.map(season => (
                                    <option key={season} value={season}>
                                        {season}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Allocation (%)
                            </label>
                            <input
                                type="number"
                                value={crop.weight}
                                onChange={(e) => updateCrop(index, 'weight', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                </div>
            ))}

            {errors.crops && <p className="text-sm text-red-500">{errors.crops}</p>}

            {formData.crops.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Total Allocation:</span>
                        <span className={`text-sm font-bold ${formData.crops.reduce((sum, crop) => sum + crop.weight, 0) === 100
                            ? 'text-green-600'
                            : 'text-red-500'
                            }`}>
                            {formData.crops.reduce((sum, crop) => sum + crop.weight, 0)}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
