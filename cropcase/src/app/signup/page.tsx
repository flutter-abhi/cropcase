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

function SignupForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { signupWithRedirect, isLoading, error, clearError, isAuthenticated } = useAuth();
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

        if (!email || !password || !confirmPassword) {
            return;
        }

        if (password !== confirmPassword) {
            return;
        }

        if (password.length < 6) {
            return;
        }

        try {
            await signupWithRedirect(email, password, name || undefined, redirectTo);
        } catch {
            // Error is handled by the store
        }
    };

    if (isAuthenticated) {
        return <LoadingSpinner />;
    }

    // Validation logic
    const passwordTooShort = password && password.length < 6;
    const passwordsDontMatch = confirmPassword && password !== confirmPassword;
    const isFormValid = email && password && confirmPassword && password === confirmPassword && password.length >= 6;

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Or"
            linkText="sign in to your existing account"
            linkHref="/login"
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <FormField
                        id="name"
                        name="name"
                        type="text"
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required={false}
                    />

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
                        autoComplete="new-password"
                        required
                        showPasswordToggle
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        error={passwordTooShort ? 'Password must be at least 6 characters long' : undefined}
                    />

                    <FormField
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        showPasswordToggle
                        showPassword={showConfirmPassword}
                        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                        error={passwordsDontMatch ? 'Passwords do not match' : undefined}
                    />
                </div>

                <SubmitButton
                    isLoading={isLoading}
                    disabled={isLoading || !isFormValid}
                    loadingText="Creating account..."
                >
                    Create account
                </SubmitButton>

                <div className="text-center">
                    <Link
                        href="/login"
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        Already have an account? Sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <SignupForm />
        </Suspense>
    );
}
