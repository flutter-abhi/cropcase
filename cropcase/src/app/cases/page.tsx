"use client";

import { useState } from 'react';
import Navigation from "@/component/homePageComponent/navbar";
import CaseCard from "@/component/homePageComponent/CaseCard";
import CreateCaseButton from "@/component/CreateCaseButton";
import { Filter, Search } from "lucide-react";

// Dummy JSON data - simulating API response
const dummyCasesData = {
    userCases: [
        {
            id: "1",
            name: "Summer Wheat & Corn",
            crops: [
                { name: "Wheat", weight: 60, season: "Summer" },
                { name: "Corn", weight: 40, season: "Summer" }
            ],
            user: { name: "John Farmer", email: "john@example.com" },
            createdAt: new Date("2024-01-15"),
            totalLand: 25,
            isOwner: true
        },
        {
            id: "2",
            name: "Mixed Vegetable Garden",
            crops: [
                { name: "Tomatoes", weight: 30, season: "Summer" },
                { name: "Lettuce", weight: 25, season: "Spring" },
                { name: "Carrots", weight: 20, season: "Fall" },
                { name: "Peppers", weight: 25, season: "Summer" }
            ],
            user: { name: "John Farmer", email: "john@example.com" },
            createdAt: new Date("2024-02-10"),
            totalLand: 15,
            isOwner: true
        },
        {
            id: "3",
            name: "Winter Crop Rotation",
            crops: [
                { name: "Barley", weight: 50, season: "Winter" },
                { name: "Oats", weight: 50, season: "Winter" }
            ],
            user: { name: "John Farmer", email: "john@example.com" },
            createdAt: new Date("2024-03-05"),
            totalLand: 10,
            isOwner: true
        },
        {
            id: "4",
            name: "Spring Organic Farm",
            crops: [
                { name: "Spinach", weight: 40, season: "Spring" },
                { name: "Radish", weight: 30, season: "Spring" },
                { name: "Broccoli", weight: 30, season: "Spring" }
            ],
            user: { name: "John Farmer", email: "john@example.com" },
            createdAt: new Date("2024-04-01"),
            totalLand: 12,
            isOwner: true
        },
        {
            id: "5",
            name: "Large Scale Corn Production",
            crops: [
                { name: "Corn", weight: 80, season: "Summer" },
                { name: "Soybeans", weight: 20, season: "Fall" }
            ],
            user: { name: "John Farmer", email: "john@example.com" },
            createdAt: new Date("2024-05-10"),
            totalLand: 50,
            isOwner: true
        },
        {
            id: "6",
            name: "Greenhouse Vegetables",
            crops: [
                { name: "Tomatoes", weight: 35, season: "Summer" },
                { name: "Cucumbers", weight: 25, season: "Summer" },
                { name: "Bell Peppers", weight: 20, season: "Summer" },
                { name: "Herbs", weight: 20, season: "Spring" }
            ],
            user: { name: "John Farmer", email: "john@example.com" },
            createdAt: new Date("2024-06-15"),
            totalLand: 8,
            isOwner: true
        }
    ],
    totalCases: 6,
    totalLandManaged: 120
};

export default function Cases() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSeason, setFilterSeason] = useState("all");

    // Filter cases based on search and season
    const filteredCases = dummyCasesData.userCases.filter(caseItem => {
        const matchesSearch = caseItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            caseItem.crops.some(crop => crop.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSeason = filterSeason === "all" ||
            caseItem.crops.some(crop => crop.season.toLowerCase() === filterSeason.toLowerCase());
        return matchesSearch && matchesSeason;
    });

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            {/* Header Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-foreground">My Cases</h1>
                            <p className="text-muted-foreground mt-2">
                                Manage your crop portfolio • {dummyCasesData.totalCases} cases • {dummyCasesData.totalLandManaged} acres
                            </p>
                        </div>
                        <CreateCaseButton variant="hero" />
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search cases or crops..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select
                                value={filterSeason}
                                onChange={(e) => setFilterSeason(e.target.value)}
                                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="all">All Seasons</option>
                                <option value="spring">Spring</option>
                                <option value="summer">Summer</option>
                                <option value="fall">Fall</option>
                                <option value="winter">Winter</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-6">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredCases.length} of {dummyCasesData.totalCases} cases
                        </p>
                    </div>

                    {/* Cases Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCases.map((caseData) => (
                            <CaseCard key={caseData.id} caseData={caseData} />
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredCases.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No cases found</h3>
                            <p className="text-muted-foreground mb-4">
                                Try adjusting your search terms or filters
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterSeason("all");
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
}
