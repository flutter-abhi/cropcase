
import Link from 'next/link';
import { Sprout } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    linkText: string;
    linkHref: string;
}

export function AuthLayout({ children, title, subtitle, linkText, linkHref }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-card rounded-2xl shadow-xl border p-8 space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                            <Sprout className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
                        <p className="text-muted-foreground">
                            {subtitle}{' '}
                            <Link href={linkHref} className="font-medium text-primary hover:text-primary/80 transition-colors">
                                {linkText}
                            </Link>
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
