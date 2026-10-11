'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CodeEditor from '@/components/editor/CodeEditor';
import {
    BookOpen,
    Clock,
    CheckCircle2,
    PlayCircle,
    ArrowLeft,
    Shield,
    BarChart3,
    ChevronRight,
    ChevronLeft,
    FileText,
    HelpCircle,
    Code2,
    ListTodo,
    Menu,
    X,
    Award
} from 'lucide-react';
import Link from 'next/link';

export default function CourseLearnPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentModule, setCurrentModule] = useState(0);
    const [currentItem, setCurrentItem] = useState({ type: 'lesson', index: 0 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [answers, setAnswers] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);
    const [score, setScore] = useState<any>(null);
    const [completedItems, setCompletedItems] = useState<string[]>([]);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/courses/${id}`);
                if (!res.ok) throw new Error('Course not found');
                const data = await res.json();
                setCourse(data);
                
                // Check if user is enrolled
                const token = localStorage.getItem('token');
                const enrollRes = await fetch('/api/enrollments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const enrollData = await enrollRes.json();
                const enrolled = enrollData.some((e: any) => e.id === id);
                if (!enrolled) {
                    router.push(`/courses/${id}`);
                    return;
                }

                // Fetch progress
                const progressRes = await fetch(`/api/progress?courseId=${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (progressRes.ok) {
                    const progressData = await progressRes.json();
                    if (progressData && progressData.completedItems) {
                        setCompletedItems(progressData.completedItems);
                    }
                    if (progressData && progressData.lastPosition) {
                        setCurrentModule(progressData.lastPosition.moduleIndex || 0);
                        setCurrentItem({
                            type: progressData.lastPosition.itemType || 'lesson',
                            index: progressData.lastPosition.itemIndex || 0
                        });
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                router.push('/courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, router]);

    const saveProgress = async (itemKey: string, lastPos: any) => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    courseId: id,
                    completedItem: itemKey,
                    lastPosition: lastPos
                })
            });
            if (itemKey) {
                setCompletedItems(prev => prev.includes(itemKey) ? prev : [...prev, itemKey]);
            }
        } catch (err) {
            console.error('Failed to save progress:', err);
        }
    };

    useEffect(() => {
        if (!course) return;
        const itemKey = `${currentModule}-${currentItem.type}-${currentItem.index}`;
        const lastPos = { moduleIndex: currentModule, itemType: currentItem.type, itemIndex: currentItem.index };
        
        // If it's a lesson, automatically mark it as completed
        if (currentItem.type === 'lesson') {
            saveProgress(itemKey, lastPos);
        } else {
            // Just update lastPosition
            saveProgress('', lastPos);
        }
    }, [currentModule, currentItem, course]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
    );

    if (!course) return null;

    const currentModuleData = course.modules[currentModule];
    const totalModules = course.modules.length;
    const isLastModule = currentModule === totalModules - 1;

    const currentContent = currentItem.type === 'lesson' 
        ? currentModuleData.lessons[currentItem.index] 
        : currentModuleData.questions[currentItem.index];

    const handleNext = () => {
        if (currentItem.type === 'lesson') {
            if (currentItem.index < (currentModuleData.lessons?.length || 0) - 1) {
                setCurrentItem({ type: 'lesson', index: currentItem.index + 1 });
            } else if (currentModuleData.questions && currentModuleData.questions.length > 0) {
                setCurrentItem({ type: 'question', index: 0 });
            } else if (currentModule < totalModules - 1) {
                setCurrentModule(currentModule + 1);
                setCurrentItem({ type: 'lesson', index: 0 });
            }
        } else {
            if (currentItem.index < (currentModuleData.questions?.length || 0) - 1) {
                setCurrentItem({ type: 'question', index: currentItem.index + 1 });
            } else if (currentModule < totalModules - 1) {
                setCurrentModule(currentModule + 1);
                setCurrentItem({ type: 'lesson', index: 0 });
            }
        }
        setScore(null);
    };

    const handlePrev = () => {
        if (currentItem.type === 'question') {
            if (currentItem.index > 0) {
                setCurrentItem({ type: 'question', index: currentItem.index - 1 });
            } else {
                setCurrentItem({ type: 'lesson', index: (currentModuleData.lessons?.length || 1) - 1 });
            }
        } else {
            if (currentItem.index > 0) {
                setCurrentItem({ type: 'lesson', index: currentItem.index - 1 });
            } else if (currentModule > 0) {
                const prevModule = course.modules[currentModule - 1];
                setCurrentModule(currentModule - 1);
                if (prevModule.questions && prevModule.questions.length > 0) {
                    setCurrentItem({ type: 'question', index: prevModule.questions.length - 1 });
                } else {
                    setCurrentItem({ type: 'lesson', index: (prevModule.lessons?.length || 1) - 1 });
                }
            }
        }
        setScore(null);
    };

    const handleAnswer = (val: any) => {
        setAnswers({
            ...answers,
            [`${currentModule}-${currentItem.type}-${currentItem.index}`]: val
        });
    };

    const checkAnswer = async () => {
        const answer = answers[`${currentModule}-${currentItem.type}-${currentItem.index}`];
        if (answer === undefined) return;

        setSubmitting(true);
        try {
            if (currentContent.type === 'programming') {
                const tc = currentContent.sampleTestCases?.[0] || { input: '', output: '' };
                const res = await fetch('/api/compile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        language: currentContent.language || course.language,
                        code: answer,
                        input: tc.input,
                        expectedOutput: tc.output
                    })
                });
                const result = await res.json();
                const passed = result.output?.trim() === tc.output?.trim();
                setScore({ passed, message: passed ? 'Excellent! Test case passed.' : 'Output mismatch. Try again!' });
                if (passed) {
                    const itemKey = `${currentModule}-question-${currentItem.index}`;
                    saveProgress(itemKey, { moduleIndex: currentModule, itemType: 'question', itemIndex: currentItem.index });
                }
            } else {
                const passed = answer === currentContent.correctOption;
                setScore({ passed, message: passed ? 'Correct! Well done.' : 'Wrong answer. Review the lesson and try again.' });
                if (passed) {
                    const itemKey = `${currentModule}-question-${currentItem.index}`;
                    saveProgress(itemKey, { moduleIndex: currentModule, itemType: 'question', itemIndex: currentItem.index });
                }
            }
        } catch (err) {
            console.error('Verification failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const isLastItem = (currentItem.type === 'question' && currentItem.index === (currentModuleData.questions?.length || 0) - 1) || 
                       (currentItem.type === 'lesson' && (!currentModuleData.questions || currentModuleData.questions.length === 0) && currentItem.index === (currentModuleData.lessons?.length || 0) - 1);

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-black text-gray-900 dark:text-white overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-80 glass border-r border-white/5 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xs font-black text-primary-500 uppercase tracking-widest mb-1">Course Content</h2>
                            <h1 className="text-lg font-black uppercase tracking-tight line-clamp-1">{course.title}</h1>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 glass rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {course.modules.map((m: any, mi: number) => (
                            <div key={mi} className="space-y-1">
                                <button 
                                    onClick={() => setCurrentModule(mi)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${mi === currentModule ? 'bg-primary-500/10 text-primary-500 border border-primary-500/30' : 'hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${mi === currentModule ? 'bg-primary-500 text-white' : 'bg-white/10'}`}>
                                            {mi + 1}
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-tight">{m.title}</span>
                                    </div>
                                </button>
                                
                                {mi === currentModule && (
                                    <div className="ml-4 pl-4 border-l-2 border-primary-500/20 space-y-1 mt-2 animate-slide-up">
                                        {Array.isArray(m.lessons) && m.lessons.map((l: any, li: number) => {
                                            const isDone = completedItems.includes(`${mi}-lesson-${li}`);
                                            return (
                                                <button 
                                                    key={li}
                                                    onClick={() => {
                                                        setCurrentItem({ type: 'lesson', index: li });
                                                        setScore(null);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-all ${currentItem.type === 'lesson' && currentItem.index === li ? 'text-primary-500 bg-primary-500/5' : 'text-gray-500 hover:text-gray-300'}`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <FileText className="w-3.5 h-3.5" />
                                                        {l.title}
                                                    </span>
                                                    {isDone && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                                </button>
                                            );
                                        })}
                                        {Array.isArray(m.questions) && m.questions.map((q: any, qi: number) => {
                                            const isDone = completedItems.includes(`${mi}-question-${qi}`);
                                            return (
                                                <button 
                                                    key={qi}
                                                    onClick={() => {
                                                        setCurrentItem({ type: 'question', index: qi });
                                                        setScore(null);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-all ${currentItem.type === 'question' && currentItem.index === qi ? 'text-indigo-500 bg-indigo-500/5' : 'text-gray-500 hover:text-gray-300'}`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {q.type === 'mcq' ? <ListTodo className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                                                        Question {qi + 1}
                                                    </span>
                                                    {isDone && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-primary-500 transition-colors uppercase tracking-widest">
                            <ArrowLeft className="w-4 h-4" />
                            EXIT PLAYER
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
                {/* Header */}
                <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-2 glass rounded-lg ${isSidebarOpen ? 'hidden' : ''}`}>
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                            <span className="text-primary-500">{currentModuleData?.title}</span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                            <span>{currentContent?.title || `Question ${currentItem.index + 1}`}</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 glass rounded-full text-[10px] font-black uppercase text-gray-500">
                            <Shield className="w-3 h-3 text-indigo-500" />
                            <span>Enrolled as Student</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-12">
                    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
                        {currentItem.type === 'lesson' ? (
                            <div className="prose prose-invert max-w-none">
                                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">{currentContent?.title}</h1>
                                <div className="text-lg text-gray-400 leading-relaxed whitespace-pre-wrap">
                                    {currentContent?.content}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${currentContent?.type === 'programming' ? 'bg-indigo-500/20 text-indigo-500' : 'bg-primary-500/20 text-primary-500'}`}>
                                        {currentContent?.type === 'programming' ? <Code2 className="w-6 h-6" /> : <ListTodo className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">Interactive Assessment</h2>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Test your knowledge before moving forward</p>
                                    </div>
                                </div>

                                <Card className="relative overflow-hidden border-2 border-white/5">
                                    <h3 className="text-xl font-bold mb-8">{currentContent?.question}</h3>
                                    
                                    {currentContent?.type === 'mcq' ? (
                                        <div className="space-y-3">
                                            {currentContent.options?.map((opt: string, oi: number) => (
                                                <button
                                                    key={oi}
                                                    onClick={() => handleAnswer(oi)}
                                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-bold flex items-center ${answers[`${currentModule}-question-${currentItem.index}`] === oi
                                                            ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                                                            : 'border-white/5 glass hover:bg-white/5'
                                                        }`}
                                                >
                                                    <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center text-xs font-black mr-4 ${answers[`${currentModule}-question-${currentItem.index}`] === oi
                                                            ? 'bg-primary-500 text-white'
                                                            : 'bg-white/10'
                                                        }`}>
                                                        {String.fromCharCode(65 + oi)}
                                                    </span>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <CodeEditor 
                                                initialCode={answers[`${currentModule}-question-${currentItem.index}`] || currentContent?.initialCode}
                                                language={currentContent?.language || course.language}
                                                onChange={handleAnswer}
                                                height="400px"
                                            />
                                        </div>
                                    )}

                                    <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                                        <div className="text-sm font-bold">
                                            {score && (
                                                <div className={`flex items-center gap-2 ${score.passed ? 'text-green-500' : 'text-red-500'}`}>
                                                    {score.passed ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                    {score.message}
                                                </div>
                                            )}
                                        </div>
                                        <Button 
                                            onClick={checkAnswer} 
                                            loading={submitting}
                                            variant={score?.passed ? 'secondary' : 'primary'}
                                            className="px-8"
                                        >
                                            Verify Answer
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Nav */}
                <footer className="h-20 glass border-t border-white/5 flex items-center justify-between px-8 md:px-12 shrink-0">
                    <Button 
                        variant="secondary" 
                        onClick={handlePrev} 
                        disabled={currentModule === 0 && currentItem.type === 'lesson' && currentItem.index === 0}
                        className="flex items-center gap-2 py-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        PREVIOUS
                    </Button>

                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Course Progress</span>
                            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.round((completedItems.length / (course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0) + (m.questions?.length || 0), 0) || 1)) * 100))}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isLastModule && isLastItem ? (
                            <Button onClick={() => router.push('/dashboard')} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                COMPLETE COURSE
                            </Button>
                        ) : (
                            <Button onClick={handleNext} className="flex items-center gap-2 py-2 px-8">
                                NEXT
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </footer>
            </main>
        </div>
    );
}
