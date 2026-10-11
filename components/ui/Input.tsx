import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <input
                className={[
                    'w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-200 outline-none',
                    // Light mode
                    'bg-white text-gray-900 border-gray-200 placeholder-gray-400',
                    'hover:border-blue-300',
                    'focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15',
                    // Dark mode
                    'dark:bg-[#0d1117] dark:text-gray-100 dark:border-[#30363d] dark:placeholder-gray-600',
                    'dark:hover:border-[#3d444d]',
                    'dark:focus:border-[#00ffcc] dark:focus:ring-3 dark:focus:ring-[#00ffcc]/10',
                    // Error state
                    error ? 'border-red-400 dark:border-red-600 focus:ring-red-400/20 dark:focus:ring-red-600/20' : '',
                    className,
                ].join(' ')}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>
            )}
        </div>
    );
}
