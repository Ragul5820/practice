'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, Database } from 'lucide-react';
import Card from '../ui/Card';

interface CompileResult {
    output: string;
    status: string;
    time: string;
    memory: string;
    error?: string;
    passed?: boolean;
}

interface CompilerPanelProps {
    result: CompileResult | null;
    loading: boolean;
}

export default function CompilerPanel({ result, loading }: CompilerPanelProps) {
    if (loading) {
        return (
            <Card className="bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-primary-600 dark:text-primary-400 font-medium">Compiling and running...</p>
                </div>
            </Card>
        );
    }

    if (!result) {
        return (
            <Card className="bg-gray-50 dark:bg-dark-800/50">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    Click "Run Code" to see the output
                </p>
            </Card>
        );
    }

    const isSuccess = result.status === 'Accepted' || result.passed === true;
    const isError = result.error || result.status.includes('Error');

    return (
        <div className="space-y-4">
            {/* Status Header */}
            <Card className={`${isSuccess ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                    isError ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                        'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isSuccess ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                        <span className={`font-semibold ${isSuccess ? 'text-green-700 dark:text-green-300' :
                                isError ? 'text-red-700 dark:text-red-300' :
                                    'text-yellow-700 dark:text-yellow-300'
                            }`}>
                            {result.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{result.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Database className="w-4 h-4" />
                            <span>{result.memory}</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Output */}
            {result.output && (
                <div>
                    <h3 className="text-sm font-semibold mb-2">Output:</h3>
                    <Card className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-green-400">
                        <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                            {result.output}
                        </pre>
                    </Card>
                </div>
            )}

            {/* Error */}
            {result.error && (
                <div>
                    <h3 className="text-sm font-semibold mb-2 text-red-600 dark:text-red-400">Error:</h3>
                    <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        <pre className="text-sm font-mono whitespace-pre-wrap break-words text-red-700 dark:text-red-300">
                            {result.error}
                        </pre>
                    </Card>
                </div>
            )}
        </div>
    );
}
