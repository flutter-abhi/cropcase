"use client";

import { Plus, Trash2 } from "lucide-react";
import { Crop } from "@/types/crop";
import { SEASONS } from "@/constants";
import { useFormStore } from "@/stores/formStore";

interface CropSelectionFormProps {
    availableCrops: Crop[];
}

export default function CropSelectionForm({ availableCrops }: CropSelectionFormProps) {
    const { formData, updateField, errors } = useFormStore();
    // Simple functions - easy to understand
    const addCrop = () => {
        const newCrops = [...formData.crops, { id: "", name: "", weight: 0, season: "Summer" }];
        updateField('crops', newCrops);
    };

    const removeCrop = (index: number) => {
        const newCrops = formData.crops.filter((_, i) => i !== index);
        updateField('crops', newCrops);
    };

    const updateCrop = (index: number, field: string, value: string | number) => {
        const newCrops = formData.crops.map((crop, i) =>
            i === index ? { ...crop, [field]: value } : crop
        );
        updateField('crops', newCrops);
    };

    // Simple calculations
    const totalAllocation = formData.crops.reduce((sum, crop) => sum + crop.weight, 0);
    const isAllocationValid = totalAllocation === 100;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                    Crop Selection & Allocation
                </h3>
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
                        {/* Crop Name */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Crop Name
                            </label>
                            <select
                                value={crop.name}
                                onChange={(e) => {
                                    const selectedCrop = availableCrops.find(c => c.name === e.target.value);
                                    if (selectedCrop) {
                                        // Update both name and id when crop is selected
                                        const newCrops = formData.crops.map((c, i) =>
                                            i === index
                                                ? { ...c, id: selectedCrop.id, name: selectedCrop.name, season: selectedCrop.season }
                                                : c
                                        );
                                        updateField('crops', newCrops);
                                    } else {
                                        // Clear selection
                                        updateCrop(index, "name", "");
                                        updateCrop(index, "id", "");
                                    }
                                }}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Select crop</option>
                                {availableCrops.map((cropOption) => (
                                    <option key={cropOption.id} value={cropOption.name}>
                                        {cropOption.name} ({cropOption.season})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Season */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Season
                            </label>
                            <select
                                value={crop.season}
                                onChange={(e) => updateCrop(index, "season", e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                {SEASONS.map((season) => (
                                    <option key={season} value={season}>
                                        {season}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Allocation */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Allocation (%)
                            </label>
                            <input
                                type="number"
                                value={crop.weight}
                                onChange={(e) =>
                                    updateCrop(index, "weight", parseInt(e.target.value) || 0)
                                }
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
                        <span className={`text-sm font-bold ${isAllocationValid
                            ? 'text-green-600'
                            : 'text-red-500'
                            }`}>
                            {totalAllocation}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
