"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateCaseModal from "./CreateCaseModal";
import { UICaseData } from "@/types/ui";
import { useCasesStore } from "@/stores/casesStore";

interface CreateCaseButtonProps {
    variant?: "hero" | "section";
    className?: string;
}

export default function CreateCaseButton({ variant = "hero", className = "" }: CreateCaseButtonProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { addCase } = useCasesStore();

    const handleCreateCase = (caseData: UICaseData) => {
        console.log("Creating case:", caseData);

        // Add to store for immediate UI update
        addCase(caseData);

        // Show success message
        alert(`Case "${caseData.name}" created successfully!`);

        // Close modal
        setIsCreateModalOpen(false);
    };

    const buttonClasses = variant === "hero"
        ? "inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-base transition-all duration-200 hover:bg-primary/90 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        : "inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm transition-all duration-200 hover:bg-primary/90 hover:scale-105";

    return (
        <>
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className={`${buttonClasses} ${className}`}
            >
                <Plus className="h-5 w-5" />
                {variant === "hero" ? "Create New Case" : "New Case"}
            </button>

            <CreateCaseModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateCase}
            />
        </>
    );
}
