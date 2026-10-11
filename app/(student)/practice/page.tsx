'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import CompilerPanel from '@/components/editor/CompilerPanel';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Code2, LogOut, BookOpen, Trophy, BarChart3 } from 'lucide-react';

const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor'), {
    ssr: false,
    loading: () => (
        <div className="h-[500px] glass rounded-lg flex items-center justify-center animate-pulse text-gray-500 font-bold">
            Loading Editor...
        </div>
    ),
});

export default function PracticePage() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const [compileResult, setCompileResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleRun = async (code: string, language: string, input: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language, input }),
            });

            const result = await response.json();
            setCompileResult(result);
        } catch (error) {
            setCompileResult({
                output: '',
                status: 'Error',
                time: 'N/A',
                memory: 'N/A',
                error: 'Failed to connect to compiler',
            });
        }
        setLoading(false);
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (authLoading || !user) {
        return null;
    }

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Code2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gradient">CodeLearn LMS</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user.name}!</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button onClick={() => router.push('/dashboard')} variant="secondary">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                        <Button onClick={handleLogout} variant="secondary">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card hover className="flex items-center gap-4" onClick={() => router.push('/courses')}>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Courses</p>
                            <p className="text-2xl font-bold">Browse</p>
                        </div>
                    </Card>

                    <Card hover className="flex items-center gap-4" onClick={() => router.push('/assessments')}>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Assessments</p>
                            <p className="text-2xl font-bold">Take Test</p>
                        </div>
                    </Card>

                    <Card className="flex items-center gap-4 bg-gradient-to-r from-primary-500 to-indigo-600 text-white">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <Code2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-white/80">Current Mode</p>
                            <p className="text-2xl font-bold">Practice</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                <Card>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Code2 className="w-6 h-6 text-primary-500" />
                        Code Playground
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Editor */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Code Editor</h3>
                            <CodeEditor onRun={handleRun} height="500px" />
                        </div>

                        {/* Output */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Output</h3>
                            <CompilerPanel result={compileResult} loading={loading} />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
