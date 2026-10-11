'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Play, Copy, Check } from 'lucide-react';
import Button from '../ui/Button';

interface CodeEditorProps {
    initialCode?: string;
    language?: string;
    onRun?: (code: string, language: string, input: string) => void;
    onChange?: (code: string) => void;
    readOnly?: boolean;
    height?: string;
}

const LANGUAGE_OPTIONS = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
];

export default function CodeEditor({
    initialCode = '// Write your code here\n',
    language: initialLanguage = 'python',
    onRun,
    onChange,
    readOnly = false,
    height = '400px',
}: CodeEditorProps) {
    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState(initialLanguage);
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState(false);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRun = () => {
        if (onRun) {
            onRun(code, language, input);
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">Language:</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-dark-600"
                        disabled={readOnly}
                    >
                        {LANGUAGE_OPTIONS.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="p-2 glass rounded-lg hover:bg-white/90 dark:hover:bg-dark-700/90 transition-colors"
                        title="Copy code"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {onRun && !readOnly && (
                        <Button onClick={handleRun} variant="primary" className="flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Run Code
                        </Button>
                    )}
                </div>
            </div>

            {/* Editor */}
            <div className="glass rounded-lg overflow-hidden border border-gray-200 dark:border-dark-700">
                <Editor
                    height={height}
                    language={language === 'cpp' ? 'cpp' : language}
                    value={code}
                    onChange={(value) => {
                        const newCode = value || '';
                        setCode(newCode);
                        if (onChange) onChange(newCode);
                    }}
                    theme={mounted && resolvedTheme === 'light' ? 'light' : 'vs-dark'}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        readOnly,
                        automaticLayout: true,
                    }}
                />
            </div>

            {/* Input Section (only if onRun is provided) */}
            {onRun && !readOnly && (
                <div>
                    <label className="block text-sm font-medium mb-2">Input (optional):</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter input for your program..."
                        className="w-full h-24 px-4 py-3 glass rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            )}
        </div>
    );
}
