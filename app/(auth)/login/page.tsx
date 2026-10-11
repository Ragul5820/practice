'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { LogIn, Code2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Login failed');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
                        <Code2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gradient mb-2">CodeLearn LMS</h1>
                    <p className="text-gray-600 dark:text-gray-400">Master coding, one challenge at a time</p>
                </div>

                {/* Login Card */}
                <Card className="animate-slide-up">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <LogIn className="w-6 h-6 text-primary-500" />
                        Sign In
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            className="w-full"
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-primary-500 hover:text-primary-600 font-semibold">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </Card>

                {/* Demo Credentials */}
                <Card className="mt-4 border-blue-100 dark:border-blue-900/30">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">Demo Credentials:</p>
                    <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                        <p>Student: student@demo.com / password</p>
                        <p>Teacher: teacher@demo.com / password</p>
                        <p>Admin: admin@demo.com / password</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
