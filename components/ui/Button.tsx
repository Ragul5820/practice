import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1';

    const variants = {
        // Light: solid filled blue. Dark: cyberpunk outline neon.
        primary: [
            'relative overflow-hidden animate-scan',
            // Light mode
            'bg-blue-600 text-white border border-blue-700 shadow-sm',
            'hover:bg-blue-700 hover:shadow-[0_4px_14px_rgba(59,130,246,0.4)]',
            'focus:ring-blue-500',
            // Dark mode override
            'dark:bg-black dark:text-primary-400 dark:border-primary-500/60',
            'dark:hover:border-primary-400 dark:hover:text-primary-300',
            'dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]',
            'dark:focus:ring-primary-500',
        ].join(' '),

        secondary: [
            'border',
            // Light
            'bg-white text-gray-700 border-gray-200 shadow-sm',
            'hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm',
            'focus:ring-gray-300',
            // Dark
            'dark:bg-slate-900 dark:text-gray-400 dark:border-slate-700',
            'dark:hover:bg-slate-800 dark:hover:border-slate-600',
            'dark:focus:ring-slate-600',
        ].join(' '),

        danger: [
            'border',
            // Light
            'bg-white text-red-600 border-red-200 shadow-sm',
            'hover:bg-red-50 hover:border-red-400 hover:shadow-[0_2px_8px_rgba(239,68,68,0.15)]',
            'focus:ring-red-400',
            // Dark
            'dark:bg-black dark:text-red-400 dark:border-red-900/60',
            'dark:hover:border-red-500 dark:hover:shadow-[0_0_16px_rgba(239,68,68,0.25)]',
            'dark:focus:ring-red-600',
        ].join(' '),
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    <span>Loading...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}
