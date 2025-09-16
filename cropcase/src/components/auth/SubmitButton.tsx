
interface SubmitButtonProps {
    isLoading: boolean;
    disabled: boolean;
    loadingText: string;
    children: React.ReactNode;
}

export function SubmitButton({ isLoading, disabled, loadingText, children }: SubmitButtonProps) {
    return (
        <button
            type="submit"
            disabled={disabled}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent 
        text-sm font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary
        transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                    {loadingText}
                </div>
            ) : (
                children
            )}
        </button>
    );
}
