

import React from 'react';
import { Eye } from 'lucide-react';
import { useFormStore } from '@/stores/formStore';

export default function ReviewStep() {
    const { formData, errors } = useFormStore();
    return (
        <div className="space-y-6">
            <div className="text-center">
                <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Review Your Case</h3>
                <p className="text-sm text-muted-foreground">Please review all details before creating your case</p>
            </div>

            <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Basic Information</h4>
                    <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Name:</span> {formData.name}</p>
                        <p><span className="text-muted-foreground">Description:</span> {formData.description || 'None'}</p>
                        <p><span className="text-muted-foreground">Total Land:</span> {formData.totalLand} acres</p>
                        <p><span className="text-muted-foreground">Location:</span> {formData.location || 'None'}</p>
                        <p><span className="text-muted-foreground">Start Date:</span> {formData.startDate || 'None'}</p>
                        <p><span className="text-muted-foreground">End Date:</span> {formData.endDate || 'None'}</p>
                    </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Crops ({formData.crops.length})</h4>
                    <div className="space-y-2">
                        {formData.crops.map((crop, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span>{crop.name} ({crop.season})</span>
                                <span className="font-medium">{crop.weight}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Settings</h4>
                    <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Budget:</span> ${formData.budget || 'None'}</p>
                        <p><span className="text-muted-foreground">Public:</span> {formData.isPublic ? 'Yes' : 'No'}</p>
                        <p><span className="text-muted-foreground">Tags:</span> {formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}</p>
                        <p><span className="text-muted-foreground">Notes:</span> {formData.notes || 'None'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
