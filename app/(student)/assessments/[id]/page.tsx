'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CodeEditor from '@/components/editor/CodeEditor';
import {
    Trophy, Clock, CheckCircle2, XCircle,
    AlertTriangle, ChevronRight, ChevronLeft,
    Award, ArrowLeft, RotateCcw, Code2, ListTodo,
    Eye, FileText, HelpCircle, Layout, Info
} from 'lucide-react';
import Link from 'next/link';

type Question = {
    type?: 'mcq' | 'programming';
    question: string;
    options: string[];
    correctOption: number;
    // Programming fields
    title?: string;
    description?: string;
    initialCode?: string;
    language?: string;
    sampleTestCases?: { input: string; output: string }[];
    hiddenTestCases?: { input: string; output: string }[];
};

type Assessment = {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    points: number;
    questions: Question[];
};

type ResultBreakdown = {
    question: string;
    type: 'mcq' | 'programming';
    selectedOption?: number;
    correctOption?: number;
    isCorrect: boolean;
    testsPassed?: number;
    totalTests?: number;
    testResults?: any[];
};

type Result = {
    score: number;
    percentage: number;
    correct: number;
    total: number;
    breakdown: ResultBreakdown[];
};

export default function TakeAssessmentPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<(number | string)[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [phase, setPhase] = useState<'loading' | 'intro' | 'taking' | 'submitting' | 'result'>('loading');
    const [result, setResult] = useState<Result | null>(null);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [sidebarTab, setSidebarTab] = useState<'details' | 'testcases'>('details');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const res = await fetch(`/api/assessments/${id}`);
                if (!res.ok) throw new Error('Not found');
                const data = await res.json();
                setAssessment(data);
                
                // Initialize answers with initial code for programming questions
                const initialAnswers = data.questions.map((q: Question) => 
                    q.type === 'programming' ? (q.initialCode || '') : -1
                );
                setAnswers(initialAnswers);
                setTimeLeft((data.timeLimit || 30) * 60);

                // Check if already submitted
                const token = localStorage.getItem('token');
                const subRes = await fetch('/api/submissions', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const subs = await subRes.json();
                const prev = Array.isArray(subs) && subs.find((s: any) => s.assessmentId === id);
                if (prev) {
                    setResult(prev);
                    setAlreadySubmitted(true);
                    setPhase('result');
                } else {
                    setPhase('intro');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                router.push('/assessments');
            } finally {
                setLoading(false);
            }
        };
        fetchAssessment();
    }, [id, router]);

    // Countdown timer
    useEffect(() => {
        if (phase !== 'taking') return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current!);
    }, [phase]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (val: number | string) => {
        const newAnswers = [...answers];
        newAnswers[currentQ] = val;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        clearInterval(timerRef.current!);
        setPhase('submitting');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/assessments/${id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ answers })
            });
            const data = await res.json();
            setResult(data);
            setPhase('result');
        } catch {
            setPhase('taking');
        }
    };

    const answered = answers.filter(a => a !== -1 && a !== '').length;
    const total = assessment?.questions.length || 0;

    if (loading || phase === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!assessment) return null;

    /* ─── INTRO ─── */
    if (phase === 'intro') return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-black">
            <Card className="max-w-xl w-full text-center space-y-8 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 via-indigo-500 to-primary-500" />
                <div className="w-24 h-24 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary-500/10 border border-primary-500/20">
                    <Trophy className="w-12 h-12 text-primary-500" />
                </div>
                <div>
                    <h1 className="text-4xl font-black mb-3 uppercase tracking-tighter text-gradient">{assessment.title}</h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{assessment.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-6 py-8 border-y border-white/5">
                    <div>
                        <p className="text-3xl font-black text-primary-500 leading-none">{total}</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Questions</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-orange-500 leading-none">{assessment.timeLimit}m</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Duration</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-green-500 leading-none">{assessment.points}</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Points</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-yellow-500/10 rounded-2xl text-left border border-yellow-500/20">
                    <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-400 mb-1">Important Instructions</h4>
                        <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80 leading-relaxed font-bold">
                            Do not refresh the page. The timer will start immediately. Ensure you have a stable internet connection.
                        </p>
                    </div>
                </div>
                <Button className="w-full h-16 text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary-500/20" onClick={() => setPhase('taking')}>
                    Begin Challenge →
                </Button>
                <Link href="/assessments" className="block text-xs font-black text-gray-500 hover:text-primary-500 transition-colors uppercase tracking-widest">
                    Return to Portal
                </Link>
            </Card>
        </div>
    );

    /* ─── SUBMITTING ─── */
    if (phase === 'submitting') return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center space-y-6">
                <div className="w-24 h-24 border-8 border-primary-500/10 border-t-primary-500 rounded-full animate-spin mx-auto shadow-2xl shadow-primary-500/20" />
                <div>
                    <p className="text-2xl font-black uppercase tracking-tighter">Analyzing Performance</p>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Evaluating test cases and finalizing reports...</p>
                </div>
            </div>
        </div>
    );

    /* ─── RESULT ─── */
    if (phase === 'result' && result) {
        const passed = result.percentage >= 60;
        return (
            <div className="min-h-screen p-6 max-w-4xl mx-auto pb-32">
                <div className="mb-12">
                    <Link href="/assessments" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary-500 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to Portal
                    </Link>
                    <Card className={`text-center p-12 border-2 relative overflow-hidden ${passed ? 'border-green-500/30' : 'border-red-500/30'}`}>
                        <div className={`absolute top-0 left-0 w-full h-2 ${passed ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl ${passed ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {passed
                                ? <Award className="w-12 h-12" />
                                : <XCircle className="w-12 h-12" />
                            }
                        </div>
                        <h1 className="text-5xl font-black mb-3 uppercase tracking-tighter leading-none">
                            {passed ? 'Assessment Passed' : 'Assessment Failed'}
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-10">{assessment.title}</p>

                        <div className="grid grid-cols-3 gap-8 mb-10">
                            <div className="p-6 glass rounded-3xl border border-white/5">
                                <p className={`text-5xl font-black leading-none ${passed ? 'text-green-500' : 'text-red-500'}`}>
                                    {result.percentage}%
                                </p>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-3">Final Grade</p>
                            </div>
                            <div className="p-6 glass rounded-3xl border border-white/5">
                                <p className="text-5xl font-black text-primary-500 leading-none">{result.score}</p>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-3">Points Earned</p>
                            </div>
                            <div className="p-6 glass rounded-3xl border border-white/5">
                                <p className="text-5xl font-black leading-none">{result.correct}/{result.total}</p>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-3">Accuracy</p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button onClick={() => router.push('/assessments')} variant="secondary" className="px-10 h-14 font-black uppercase tracking-widest">
                                <RotateCcw className="w-5 h-5 mr-2" /> All Tasks
                            </Button>
                            <Button onClick={() => router.push('/dashboard')} className="px-10 h-14 font-black uppercase tracking-widest shadow-xl shadow-primary-500/20">
                                View Leaderboard
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <ListTodo className="w-7 h-7 text-primary-500" />
                        Detailed Performance Report
                    </h2>
                    <div className="space-y-4">
                        {result.breakdown.map((item, i) => (
                            <Card key={i} className={`border border-white/5 relative overflow-hidden transition-all hover:border-white/10 ${item.isCorrect ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${item.isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                                <div className="flex items-start gap-6">
                                    <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${item.isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                        {item.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-black text-xl uppercase tracking-tight">Question {i + 1}</h3>
                                                <p className="text-sm font-bold text-gray-500">{item.question}</p>
                                            </div>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${item.type === 'programming' ? 'bg-indigo-500 text-white' : 'bg-primary-500 text-white'}`}>
                                                {item.type}
                                            </span>
                                        </div>

                                        {item.type === 'programming' ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 glass rounded-2xl border border-white/5">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Execution Metrics</p>
                                                        <div className="flex items-end gap-2">
                                                            <span className={`text-2xl font-black ${item.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                                                {item.testsPassed}/{item.totalTests}
                                                            </span>
                                                            <span className="text-xs font-bold text-gray-500 pb-1">Tests Passed</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {item.testResults && (
                                                    <div className="space-y-2">
                                                        {item.testResults.map((tr: any, tri: number) => (
                                                            <div key={tri} className="p-4 glass rounded-2xl border border-white/5 text-[11px] font-mono group/tc">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="px-2 py-0.5 bg-white/5 rounded uppercase text-[9px] font-black text-gray-500 tracking-tighter">Case #{tri + 1}</span>
                                                                        {tr.isHidden && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded uppercase text-[9px] font-black tracking-tighter">Hidden</span>}
                                                                    </div>
                                                                    <span className={`font-black ${tr.isPassed ? 'text-green-500' : 'text-red-500'}`}>
                                                                        {tr.isPassed ? 'PASSED' : 'FAILED'}
                                                                    </span>
                                                                </div>
                                                                
                                                                {!tr.isHidden && !tr.isPassed && (
                                                                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/5">
                                                                        <div>
                                                                            <p className="text-[9px] font-black uppercase text-gray-500 mb-1">Expected Output</p>
                                                                            <pre className="bg-black/40 p-2 rounded-lg text-green-500 overflow-x-auto">{tr.expectedOutput}</pre>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[9px] font-black uppercase text-gray-500 mb-1">Actual Output</p>
                                                                            <pre className="bg-red-500/10 p-2 rounded-lg text-red-400 overflow-x-auto">{tr.actualOutput || 'Empty/Error'}</pre>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {assessment.questions[i].options?.map((opt, oi) => (
                                                    <div key={oi} className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${oi === item.correctOption
                                                            ? 'bg-green-500/10 text-green-500 border-green-500/30'
                                                            : oi === item.selectedOption && !item.isCorrect
                                                                ? 'bg-red-500/10 text-red-500 border-red-500/30'
                                                                : 'glass border-white/5 text-gray-500'
                                                        }`}>
                                                        <span className="opacity-50 mr-2">{String.fromCharCode(65 + oi)}.</span>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /* ─── TAKING ─── */
    const q = assessment.questions[currentQ];
    const urgency = timeLeft < 60;
    const isProgramming = q.type === 'programming';

    return (
        <div className="min-h-screen p-6 max-w-[1600px] mx-auto flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center border border-primary-500/20 shadow-xl shadow-primary-500/5">
                        <Trophy className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                        <h1 className="font-black text-xl uppercase tracking-tighter leading-none">{assessment.title}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{answered}/{total} COMPLETED</span>
                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${(answered/total)*100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-mono font-black text-2xl border-2 transition-all ${urgency
                        ? 'bg-red-500/10 border-red-500/40 text-red-500 animate-pulse'
                        : 'glass border-white/10 text-primary-500 shadow-xl shadow-primary-500/5'
                    }`}>
                    <Clock className="w-6 h-6" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden pb-4">
                {/* Side Nav / Map */}
                <aside className="w-16 flex flex-col gap-2 shrink-0">
                    {assessment.questions.map((qItem, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentQ(i)}
                            className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border-2 group relative ${i === currentQ
                                    ? 'border-primary-500 bg-primary-500 text-white shadow-xl shadow-primary-500/20'
                                    : answers[i] !== -1 && answers[i] !== ''
                                        ? 'border-green-500/30 bg-green-500/10 text-green-500'
                                        : 'border-white/5 glass hover:bg-white/10'
                                }`}
                        >
                            <span className="text-xs font-black">{i + 1}</span>
                            <div className="absolute -right-12 bg-black text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 uppercase tracking-widest">
                                {qItem.type}
                            </div>
                        </button>
                    ))}
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex gap-6 overflow-hidden">
                    {isProgramming ? (
                        <>
                            {/* Problem Sidebar */}
                            <div className="w-1/3 flex flex-col gap-4 overflow-hidden h-full">
                                <Card className="flex-1 flex flex-col p-0 border-white/5 overflow-hidden">
                                    <div className="flex border-b border-white/5 bg-white/5 p-1 shrink-0">
                                        <button 
                                            onClick={() => setSidebarTab('details')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'details' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            <Info className="w-3.5 h-3.5" /> Details
                                        </button>
                                        <button 
                                            onClick={() => setSidebarTab('testcases')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'testcases' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Examples
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                        {sidebarTab === 'details' ? (
                                            <div className="space-y-6 animate-slide-up">
                                                <div>
                                                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2">{q.title || q.question}</h2>
                                                    <div className="flex gap-2">
                                                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-500 text-[9px] font-black rounded uppercase tracking-widest">Programming</span>
                                                        <span className="px-2 py-1 bg-white/5 text-gray-400 text-[9px] font-black rounded uppercase tracking-widest">{q.language}</span>
                                                    </div>
                                                </div>
                                                <div className="prose prose-invert prose-sm max-w-none">
                                                    <div className="text-gray-400 leading-relaxed font-bold text-sm whitespace-pre-wrap">
                                                        {q.description || q.question}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6 animate-slide-up">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-primary-500">Sample Test Cases</h3>
                                                {q.sampleTestCases?.map((tc, idx) => (
                                                    <div key={idx} className="space-y-3 p-4 glass rounded-2xl border border-white/5">
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase text-gray-500 mb-1">Input</p>
                                                            <pre className="bg-black/40 p-2 rounded-lg text-xs font-mono text-white overflow-x-auto">{tc.input}</pre>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase text-gray-500 mb-1">Output</p>
                                                            <pre className="bg-black/40 p-2 rounded-lg text-xs font-mono text-green-500 overflow-x-auto">{tc.output}</pre>
                                                        </div>
                                                    </div>
                                                ))}
                                                {!q.sampleTestCases?.length && (
                                                    <div className="text-center py-12 text-gray-500">
                                                        <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                                        <p className="text-xs font-bold uppercase tracking-widest">No sample cases provided</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
                                <Card className="flex-1 p-0 border-white/5 overflow-hidden flex flex-col">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-gray-500">solution.{q.language === 'python' ? 'py' : q.language === 'javascript' ? 'js' : 'src'}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 relative">
                                        <CodeEditor 
                                            initialCode={answers[currentQ] as string} 
                                            language={q.language || 'python'} 
                                            onChange={(code) => handleAnswer(code)}
                                            height="100%"
                                        />
                                    </div>
                                </Card>

                                {/* Footer Nav for Programming */}
                                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/5 shrink-0">
                                    <Button variant="secondary" onClick={() => setCurrentQ(q => q - 1)} disabled={currentQ === 0} className="px-6 h-12 font-black">
                                        <ChevronLeft className="w-5 h-5 mr-1" /> BACK
                                    </Button>
                                    {currentQ < total - 1 ? (
                                        <Button onClick={() => setCurrentQ(q => q + 1)} className="px-12 h-12 font-black uppercase tracking-widest">
                                            NEXT <ChevronRight className="w-5 h-5 ml-1" />
                                        </Button>
                                    ) : (
                                        <Button onClick={handleSubmit} className="px-12 h-12 font-black uppercase tracking-widest bg-green-600 shadow-[0_0_20px_rgba(22,163,74,0.3)]">
                                            SUBMIT TEST <CheckCircle2 className="w-5 h-5 ml-1" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* MCQ Area */
                        <div className="flex-1 flex flex-col gap-6 items-center justify-center max-w-3xl mx-auto h-full overflow-y-auto custom-scrollbar px-4">
                            <Card className="w-full relative overflow-hidden p-12 border-white/5 shadow-2xl">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500" />
                                <div className="flex items-center gap-2 mb-8">
                                    <span className="px-3 py-1 bg-primary-500/10 text-primary-500 text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary-500/20">MULTIPLE CHOICE</span>
                                </div>
                                <h2 className="text-3xl font-black mb-12 uppercase tracking-tight leading-tight">{q.question}</h2>

                                <div className="space-y-4">
                                    {q.options?.map((opt, oi) => (
                                        <button
                                            key={oi}
                                            onClick={() => handleAnswer(oi)}
                                            className={`w-full text-left p-6 rounded-3xl border-2 transition-all font-black flex items-center group relative overflow-hidden ${answers[currentQ] === oi
                                                    ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-xl shadow-primary-500/5 scale-[1.02]'
                                                    : 'border-white/5 glass hover:bg-white/5'
                                                }`}
                                        >
                                            <span className={`inline-flex w-10 h-10 rounded-2xl items-center justify-center text-sm font-black mr-6 transition-all ${answers[currentQ] === oi
                                                    ? 'bg-primary-500 text-white shadow-lg rotate-12'
                                                    : 'bg-white/5 group-hover:bg-white/10'
                                                }`}>
                                                {String.fromCharCode(65 + oi)}
                                            </span>
                                            <span className="text-lg">{opt}</span>
                                            {answers[currentQ] === oi && <CheckCircle2 className="absolute right-6 w-6 h-6 text-primary-500 animate-slide-up" />}
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            <div className="w-full flex items-center justify-between bg-white/5 p-4 rounded-3xl backdrop-blur-md border border-white/5 shrink-0">
                                <Button variant="secondary" onClick={() => setCurrentQ(q => q - 1)} disabled={currentQ === 0} className="px-8 h-12 font-black">
                                    <ChevronLeft className="w-5 h-5 mr-1" /> BACK
                                </Button>
                                {currentQ < total - 1 ? (
                                    <Button onClick={() => setCurrentQ(q => q + 1)} className="px-16 h-12 font-black uppercase tracking-widest shadow-xl shadow-primary-500/10">
                                        NEXT <ChevronRight className="w-5 h-5 ml-1" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleSubmit} className="px-16 h-12 font-black uppercase tracking-widest bg-green-600 shadow-xl shadow-green-600/20">
                                        SUBMIT TEST <CheckCircle2 className="w-5 h-5 ml-1" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
