
import { Sprout } from 'lucide-react';

export function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary/30 animate-ping"></div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                    <Sprout className="h-5 w-5 text-primary" />
                    <p className="text-muted-foreground font-medium">Redirecting...</p>
                </div>
            </div>
        </div>
    );
}
