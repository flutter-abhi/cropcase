'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { FormField } from '@/components/auth/FormField';
import { SubmitButton } from '@/components/auth/SubmitButton';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { loginWithRedirect, isLoading, error, clearError, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const redirectTo = searchParams.get('redirect') || '/';

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, redirectTo, router]);

    // Show error toast when error changes
    useEffect(() => {
        if (error) {
            showToast('error', error);
            clearError();
        }
    }, [error, clearError, showToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!email || !password) {
            return;
        }

        try {
            await loginWithRedirect(email, password, redirectTo);
        } catch {
            // Error is handled by the store
        }
    };

    if (isAuthenticated) {
        return <LoadingSpinner />;
    }

    const isFormValid = email && password;

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Or"
            linkText="create a new account"
            linkHref="/signup"
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <FormField
                        id="email"
                        name="email"
                        type="email"
                        label="Email address"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />

                    <FormField
                        id="password"
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        showPasswordToggle
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                    />
                </div>

                <SubmitButton
                    isLoading={isLoading}
                    disabled={isLoading || !isFormValid}
                    loadingText="Signing in..."
                >
                    Sign in
                </SubmitButton>

                <div className="text-center">
                    <Link
                        href="/signup"
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        Don&apos;t have an account? Sign up
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <LoginForm />
        </Suspense>
    );
}
