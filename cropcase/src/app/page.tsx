"use client";

import { useEffect } from "react";
import Navigation from "@/components/homePageComponent/navbar";
import { Sprout, Calendar, PieChart, MapPin, Users, BarChart3, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import CaseCard from "@/components/homePageComponent/CaseCard";
import CreateCaseButton from "@/components/CreateCaseButton";
import Link from "next/link";
import { useCases } from "@/hooks/useCases";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const {
    cases,
    loading,
    error,
    totalStats,
    fetchCases,
    refreshCases
  } = useCases();

  // Fetch cases on component mount only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCases();
    }
  }, [fetchCases, isAuthenticated]);

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

            {/* Create New Case Button or Login CTA */}
            <div className="mt-8">
              {isAuthenticated ? (
                <CreateCaseButton variant="hero" />
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3 border border-primary text-base font-medium rounded-md text-primary bg-transparent hover:bg-primary/10 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
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

      {/* My Cases Section - Only show for authenticated users */}
      {isAuthenticated && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">My Cases</h2>
                <p className="text-muted-foreground mt-1">
                  Manage your crop portfolio • {totalStats.totalCases} cases • {totalStats.totalLandManaged} acres
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshCases}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <CreateCaseButton variant="section" />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading your cases...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={refreshCases}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Cases Grid */}
            {!loading && !error && (
              <>
                {cases.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cases.filter(c => c.isOwner).map((caseData) => (
                      <CaseCard
                        key={caseData.id}
                        caseData={caseData}
                        onCaseDeleted={refreshCases}
                        onCaseUpdated={refreshCases}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                      <Sprout className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No cases yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first crop case to get started with portfolio management
                    </p>
                    <CreateCaseButton variant="section" />
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

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
          {isAuthenticated ? (
            !loading && !error && (
              <>
                {cases.filter(c => !c.isOwner).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cases.filter(c => !c.isOwner).slice(0, 3).map((caseData) => (
                      <CaseCard
                        key={caseData.id}
                        caseData={caseData}
                        isCommunity={true}
                        onCaseDeleted={refreshCases}
                        onCaseUpdated={refreshCases}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-background rounded-full mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No community cases yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to share your farming knowledge with the community
                    </p>
                  </div>
                )}
              </>
            )
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-background rounded-full mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Join the Community</h3>
              <p className="text-muted-foreground mb-4">
                Sign in to explore community cases and share your farming knowledge
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary bg-transparent hover:bg-primary/10 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
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
