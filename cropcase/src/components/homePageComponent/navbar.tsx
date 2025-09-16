"use client";

import { useState, useEffect } from 'react';
import {
    Sprout,
    Sun,
    Moon,
    Menu,
    X,
    Home,
    PieChart,
    Users,
    LogIn,
    LogOut,
    User
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const { isAuthenticated, user, logoutWithRedirect } = useAuth();

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const navigation = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'My Cases', href: '/cases', icon: PieChart, requiresAuth: true },
        { name: 'Community', href: '/communityCases', icon: Users, requiresAuth: true },
        // { name: 'AI Suggestions', href: '/suggestions', icon: Sparkles },
    ];

    return (
        <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Sprout className="h-6 w-6 text-primary" />
                            </div>
                            <span className="ml-2 text-xl font-bold text-foreground">
                                CropCase
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                // Only show auth-required items if user is authenticated
                                if (item.requiresAuth && !isAuthenticated) {
                                    return null;
                                }
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Icon className="h-4 w-4 mr-2" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Authentication Buttons */}
                        {isAuthenticated ? (
                            <div className="hidden md:flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {user?.name || user?.email}
                                    </span>
                                </div>
                                <button
                                    onClick={() => logoutWithRedirect()}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-3">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="inline-flex items-center px-3 py-2 border border-primary text-sm font-medium rounded-md text-primary bg-transparent hover:bg-primary/10 transition-colors"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? (
                                    <Moon className="h-4 w-4" />
                                ) : (
                                    <Sun className="h-4 w-4" />
                                )}
                                <span className="sr-only">Toggle theme</span>
                            </button>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <Menu className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                // Only show auth-required items if user is authenticated
                                if (item.requiresAuth && !isAuthenticated) {
                                    return null;
                                }
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Icon className="h-5 w-5 mr-3" />
                                        {item.name}
                                    </Link>
                                );
                            })}

                            {/* Mobile Authentication */}
                            {isAuthenticated ? (
                                <div className="px-3 py-2 border-t border-border">
                                    <div className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground">
                                        <User className="h-5 w-5 mr-3" />
                                        {user?.name || user?.email}
                                    </div>
                                    <button
                                        onClick={() => {
                                            logoutWithRedirect();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <LogOut className="h-5 w-5 mr-3" />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="px-3 py-2 border-t border-border space-y-1">
                                    <Link
                                        href="/login"
                                        className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <LogIn className="h-5 w-5 mr-3" />
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <User className="h-5 w-5 mr-3" />
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Theme Toggle */}
                            {mounted && (
                                <div className="px-3 py-2 border-t border-border">
                                    <button
                                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                        className="flex items-center w-full text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {theme === 'light' ? (
                                            <Moon className="h-5 w-5 mr-3" />
                                        ) : (
                                            <Sun className="h-5 w-5 mr-3" />
                                        )}
                                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}