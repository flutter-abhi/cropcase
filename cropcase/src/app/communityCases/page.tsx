"use client";

import { useState, useEffect } from 'react';
import Navigation from "@/component/homePageComponent/navbar";
import CaseCard from "@/component/homePageComponent/CaseCard";
import { Search, Filter, SortAsc, Users, TrendingUp, Heart } from "lucide-react";

// Dummy JSON data - simulating API response for community cases
const dummyCommunityData = {
    communityCases: [
        {
            id: "1",
            name: "Sustainable Wheat Farm",
            crops: [
                { name: "Wheat", weight: 70, season: "Summer" },
                { name: "Barley", weight: 30, season: "Winter" }
            ],
            user: { name: "Sarah Johnson", email: "sarah@example.com" },
            createdAt: new Date("2024-04-05"),
            totalLand: 40,
            isOwner: false,
            likes: 24,
            views: 156,
            location: "California, USA",
            description: "A sustainable approach to wheat farming with crop rotation",
            tags: ["sustainable", "wheat", "rotation"]
        },
        {
            id: "2",
            name: "Organic Vegetable Paradise",
            crops: [
                { name: "Tomatoes", weight: 35, season: "Summer" },
                { name: "Lettuce", weight: 25, season: "Spring" },
                { name: "Carrots", weight: 20, season: "Fall" },
                { name: "Spinach", weight: 20, season: "Winter" }
            ],
            user: { name: "Mike Chen", email: "mike@example.com" },
            createdAt: new Date("2024-03-20"),
            totalLand: 20,
            isOwner: false,
            likes: 18,
            views: 89,
            location: "Oregon, USA",
            description: "Year-round organic vegetable production with diverse crops",
            tags: ["organic", "vegetables", "year-round"]
        },
        {
            id: "3",
            name: "High-Yield Corn Rotation",
            crops: [
                { name: "Corn", weight: 60, season: "Summer" },
                { name: "Soybeans", weight: 40, season: "Fall" }
            ],
            user: { name: "Emily Davis", email: "emily@example.com" },
            createdAt: new Date("2024-02-15"),
            totalLand: 35,
            isOwner: false,
            likes: 31,
            views: 203,
            location: "Iowa, USA",
            description: "Optimized corn-soybean rotation for maximum yield",
            tags: ["corn", "soybeans", "high-yield"]
        },
        {
            id: "4",
            name: "Greenhouse Innovation",
            crops: [
                { name: "Tomatoes", weight: 40, season: "Summer" },
                { name: "Cucumbers", weight: 30, season: "Summer" },
                { name: "Bell Peppers", weight: 30, season: "Summer" }
            ],
            user: { name: "David Wilson", email: "david@example.com" },
            createdAt: new Date("2024-01-10"),
            totalLand: 5,
            isOwner: false,
            likes: 42,
            views: 278,
            location: "Texas, USA",
            description: "Advanced greenhouse techniques for year-round production",
            tags: ["greenhouse", "innovation", "year-round"]
        },
        {
            id: "5",
            name: "Permaculture Forest Garden",
            crops: [
                { name: "Apples", weight: 30, season: "Fall" },
                { name: "Berries", weight: 25, season: "Summer" },
                { name: "Herbs", weight: 20, season: "Spring" },
                { name: "Mushrooms", weight: 25, season: "Winter" }
            ],
            user: { name: "Lisa Rodriguez", email: "lisa@example.com" },
            createdAt: new Date("2024-05-01"),
            totalLand: 15,
            isOwner: false,
            likes: 67,
            views: 345,
            location: "Washington, USA",
            description: "Permaculture approach with multi-layer forest gardening",
            tags: ["permaculture", "forest", "sustainable"]
        },
        {
            id: "6",
            name: "Hydroponic Lettuce Farm",
            crops: [
                { name: "Lettuce", weight: 50, season: "Spring" },
                { name: "Kale", weight: 30, season: "Winter" },
                { name: "Arugula", weight: 20, season: "Fall" }
            ],
            user: { name: "James Park", email: "james@example.com" },
            createdAt: new Date("2024-06-12"),
            totalLand: 2,
            isOwner: false,
            likes: 29,
            views: 134,
            location: "Nevada, USA",
            description: "Indoor hydroponic system for consistent leafy greens",
            tags: ["hydroponic", "indoor", "leafy-greens"]
        }
    ],
    totalCases: 6,
    totalFarmers: 6,
    totalLikes: 211
};

export default function CommunityCases() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSeason, setFilterSeason] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const [likedCases, setLikedCases] = useState<string[]>([]);

    // Filter and sort cases
    const filteredAndSortedCases = dummyCommunityData.communityCases
        .filter(caseItem => {
            const matchesSearch = caseItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                caseItem.crops.some(crop => crop.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                caseItem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesSeason = filterSeason === "all" ||
                caseItem.crops.some(crop => crop.season.toLowerCase() === filterSeason.toLowerCase());
            return matchesSearch && matchesSeason;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "recent":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "popular":
                    return b.likes - a.likes;
                case "views":
                    return b.views - a.views;
                case "land":
                    return b.totalLand - a.totalLand;
                default:
                    return 0;
            }
        });

    const handleLike = (caseId: string) => {
        setLikedCases(prev =>
            prev.includes(caseId)
                ? prev.filter(id => id !== caseId)
                : [...prev, caseId]
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            {/* Header Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Community</span>
                        </div>
                        <h1 className="text-4xl font-bold text-foreground mb-4">Community Cases</h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Discover innovative farming strategies shared by farmers worldwide.
                            Learn from successful crop portfolios and get inspired for your own farm.
                        </p>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">{dummyCommunityData.totalFarmers}</h3>
                            <p className="text-sm text-muted-foreground">Active Farmers</p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">{dummyCommunityData.totalCases}</h3>
                            <p className="text-sm text-muted-foreground">Shared Cases</p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                                <Heart className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">{dummyCommunityData.totalLikes}</h3>
                            <p className="text-sm text-muted-foreground">Total Likes</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Search and Filter Bar */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search cases, crops, or tags..."
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
                        <div className="flex items-center gap-2">
                            <SortAsc className="h-4 w-4 text-muted-foreground" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="recent">Most Recent</option>
                                <option value="popular">Most Liked</option>
                                <option value="views">Most Viewed</option>
                                <option value="land">Largest Farm</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-6">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredAndSortedCases.length} of {dummyCommunityData.totalCases} community cases
                        </p>
                    </div>

                    {/* Cases Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedCases.map((caseData) => (
                            <CaseCard
                                key={caseData.id}
                                caseData={caseData}
                                isCommunity={true}
                                onLike={handleLike}
                                isLiked={likedCases.includes(caseData.id)}
                            />
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredAndSortedCases.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No community cases found</h3>
                            <p className="text-muted-foreground mb-4">
                                Try adjusting your search terms or filters
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterSeason("all");
                                    setSortBy("recent");
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
