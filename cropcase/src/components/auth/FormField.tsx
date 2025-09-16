
import { Eye, EyeOff } from 'lucide-react';

interface FormFieldProps {
    id: string;
    name: string;
    type: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autoComplete?: string;
    required?: boolean;
    error?: string;
    showPasswordToggle?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
}

export function FormField({
    id,
    name,
    type,
    label,
    placeholder,
    value,
    onChange,
    autoComplete,
    required = false,
    error,
    showPasswordToggle = false,
    showPassword = false,
    onTogglePassword,
}: FormFieldProps) {
    const hasError = Boolean(error);
    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-medium text-foreground">
                {label} {!required && <span className="text-muted-foreground text-xs">(Optional)</span>}
            </label>
            <div className="relative">
                <input
                    id={id}
                    name={name}
                    type={inputType}
                    autoComplete={autoComplete}
                    required={required}
                    value={value}
                    onChange={onChange}
                    className={`block w-full px-4 py-3 border rounded-xl text-foreground placeholder-muted-foreground 
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            transition-all duration-200 ${hasError
                            ? 'border-destructive bg-destructive/5'
                            : 'border-input bg-background hover:border-input/80'
                        } ${showPasswordToggle ? 'pr-12' : ''}`}
                    placeholder={placeholder}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        onClick={onTogglePassword}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
