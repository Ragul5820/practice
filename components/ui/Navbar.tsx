'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Code2,
    Trophy,
    LogOut,
    Menu,
    X,
    Sun,
    Moon
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['student'] },
    { label: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard, roles: ['teacher', 'admin'] },
    { label: 'Courses', href: '/courses', icon: BookOpen },
    { label: 'Create Course', href: '/courses/create', icon: Code2, roles: ['teacher', 'admin'] },
    { label: 'Students', href: '/admin/students', icon: BookOpen, roles: ['admin'] },
    { label: 'Assessments', href: '/admin/assessments', icon: Trophy, roles: ['admin', 'teacher'] },
    { label: 'Practice', href: '/practice', icon: Code2, roles: ['student'] },
    { label: 'Assessments', href: '/assessments', icon: Trophy, roles: ['student'] },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy, roles: ['student'] },
];

export default function Navbar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { resolvedTheme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const filteredNavItems = navItems.filter(item =>
        !item.roles || (user && item.roles.includes(user.role))
    );

    const isLight = resolvedTheme === 'light';

    return (
        <nav className={[
            'sticky top-0 z-50 px-6 py-3',
            'backdrop-blur-xl',
            // Light: crisp white bar with subtle blue bottom border
            'bg-white/95 border-b border-blue-100/80 shadow-[0_1px_8px_rgba(59,130,246,0.06)]',
            // Dark: dark glass with neon accent border
            'dark:bg-[rgba(13,17,23,0.96)] dark:border-b dark:border-[rgba(0,255,204,0.12)] dark:shadow-none',
        ].join(' ')}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className={[
                        'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                        // Light: solid blue square
                        'bg-blue-600 shadow-[0_2px_8px_rgba(59,130,246,0.35)]',
                        'group-hover:shadow-[0_4px_16px_rgba(59,130,246,0.45)] group-hover:scale-105',
                        // Dark: black with neon glow border
                        'dark:bg-black dark:border dark:border-primary-500/60',
                        'dark:shadow-[0_0_12px_rgba(0,255,204,0.2)]',
                        'dark:group-hover:shadow-[0_0_22px_rgba(0,255,204,0.35)]',
                    ].join(' ')}>
                        <Code2 className="w-5 h-5 text-white dark:text-primary-400" />
                    </div>
                    <div className="hidden sm:flex flex-col">
                        <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white dark:text-glow">
                            CodeLearn
                        </span>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold">
                                System Online
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={[
                                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all font-medium',
                                    isActive
                                        // Active: light=blue pill, dark=neon tint
                                        ? 'bg-blue-600 text-white dark:bg-primary-500/10 dark:text-primary-400'
                                        // Inactive
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:bg-dark-700 dark:hover:text-gray-200',
                                ].join(' ')}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    <div className="h-5 w-px bg-gray-200 dark:bg-dark-700 mx-2" />

                    {/* Theme toggle */}
                    <button
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        className={[
                            'relative p-2 rounded-lg transition-all',
                            // Light: gray icon, blue hover bg
                            'text-gray-500 hover:text-blue-600 hover:bg-blue-50',
                            // Dark: gray icon, dark hover bg
                            'dark:text-gray-400 dark:hover:bg-dark-700 dark:hover:text-gray-200',
                        ].join(' ')}
                        title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute top-2 left-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </button>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden pt-3 pb-2 space-y-1 border-t border-gray-100 dark:border-dark-700 mt-3 animate-fade-in">
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={[
                                    'flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all',
                                    isActive
                                        ? 'bg-blue-600 text-white dark:bg-primary-500/10 dark:text-primary-400'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700',
                                ].join(' ')}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => { setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'); setIsOpen(false); }}
                        className="w-full flex items-center gap-3 p-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-all"
                    >
                        <div className="relative w-4 h-4">
                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute top-0 left-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </div>
                        <span>Toggle Theme</span>
                    </button>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium mt-1"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </nav>
    );
}
