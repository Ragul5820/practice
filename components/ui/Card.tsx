import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
    // Light: clean white card with soft blue-tinted shadow
    // Dark: dark glass panel with cyberpunk border
    const baseStyles = [
        'relative overflow-hidden transition-all duration-300',
        'rounded-2xl p-6',
        // Light mode
        'bg-white border border-blue-100/60 shadow-[0_2px_16px_rgba(59,130,246,0.06),0_1px_4px_rgba(0,0,0,0.04)]',
        // Dark mode
        'dark:bg-[#0d1117] dark:border-[#21262d] dark:shadow-[0_0_20px_rgba(0,0,0,0.4)]',
        'backdrop-blur-sm',
    ].join(' ');

    const hoverStyles = hover
        ? 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.12),0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:border-blue-200/80 dark:hover:shadow-[0_0_30px_rgba(0,255,204,0.08)] dark:hover:border-[#30363d] cursor-pointer'
        : '';

    return (
        <div className={`${baseStyles} ${hoverStyles} ${className}`} onClick={onClick}>
            {/* Subtle top highlight in light mode */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/60 to-transparent dark:via-white/[0.06] pointer-events-none" />
            {children}
        </div>
    );
}
