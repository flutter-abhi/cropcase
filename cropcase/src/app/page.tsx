import Navigation from "@/component/homePageComponent/navbar";
import { Sprout, Calendar, PieChart, MapPin, Users, BarChart3, ArrowRight } from "lucide-react";
import CaseCard from "@/component/homePageComponent/CaseCard";
import CreateCaseButton from "@/component/CreateCaseButton";
import Link from "next/link";

export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sprout className="h-6 w-6 text-primary" />
                </div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  AI-Powered Agriculture
                </span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Smart Crop
                <span className="text-primary"> Portfolio</span>
                Management
              </h1>

              <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
                Maximize your harvest with AI-driven crop recommendations. Create optimized farming cases,
                allocate your land efficiently, and learn from the farming community.
              </p>
            </div>

            {/* Create New Case Button */}
            <div className="mt-8">
              <CreateCaseButton variant="hero" />
            </div>
          </div>
        </div>
        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Current Season Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Current Season</h3>
                <p className="text-2xl font-bold text-foreground">Summer</p>
              </div>
            </div>
          </div>

          {/* Active Cases Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Active Cases</h3>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Land Managed Card */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">50</h3>
                <p className="text-sm font-medium text-muted-foreground mb-1">Acres Land Managed</p>
                <p className="text-xs text-muted-foreground">Total land managed</p>
              </div>
            </div>

            {/* Active Cases Card */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">1</h3>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Cases</p>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </div>
            </div>

            {/* Community Cases Card */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">3</h3>
                <p className="text-sm font-medium text-muted-foreground mb-1">Community Cases</p>
                <p className="text-xs text-muted-foreground">Shared by farmers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Cases Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">My Cases</h2>
              <p className="text-muted-foreground mt-1">Manage your crop portfolio</p>
            </div>
            <CreateCaseButton variant="section" />
          </div>

          {/* Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CaseCard
              caseData={{
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
              }}
            />
            <CaseCard
              caseData={{
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
              }}
            />
            <CaseCard
              caseData={{
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
              }}
            />
          </div>
        </div>
      </section>

      {/* Community Cases Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Community Cases</h2>
              <p className="text-muted-foreground mt-1">Learn from other farmers</p>
            </div>
            <Link href="/communityCases">
              <button

                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium text-sm transition-all duration-200 hover:bg-accent hover:border-primary/50 hover:scale-105 group">
                View All Cases
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </Link>
          </div>

          {/* Community Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CaseCard
              caseData={{
                id: "4",
                name: "Community Wheat Farm",
                crops: [
                  { name: "Wheat", weight: 70, season: "Summer" },
                  { name: "Barley", weight: 30, season: "Winter" }
                ],
                user: { name: "Sarah Johnson", email: "sarah@example.com" },
                createdAt: new Date("2024-04-05"),
                totalLand: 40,
                isOwner: false
              }}
            />
            <CaseCard
              caseData={{
                id: "5",
                name: "Organic Vegetable Mix",
                crops: [
                  { name: "Tomatoes", weight: 35, season: "Summer" },
                  { name: "Lettuce", weight: 25, season: "Spring" },
                  { name: "Carrots", weight: 20, season: "Fall" },
                  { name: "Spinach", weight: 20, season: "Winter" }
                ],
                user: { name: "Mike Chen", email: "mike@example.com" },
                createdAt: new Date("2024-03-20"),
                totalLand: 20,
                isOwner: false
              }}
            />
            <CaseCard
              caseData={{
                id: "6",
                name: "Sustainable Corn Rotation",
                crops: [
                  { name: "Corn", weight: 60, season: "Summer" },
                  { name: "Soybeans", weight: 40, season: "Fall" }
                ],
                user: { name: "Emily Davis", email: "emily@example.com" },
                createdAt: new Date("2024-02-15"),
                totalLand: 35,
                isOwner: false
              }}
            />
          </div>
        </div>
      </section>

      {/* Spacer Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Sprout className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">CropCase</span>
            </div>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Ready to optimize your farming portfolio? Start creating your first crop case today
              and join the community of smart farmers making data-driven decisions.
            </p>
          </div>
        </div>
      </section>


    </div>
  );
}
