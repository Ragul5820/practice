'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Plus, Trash2, Save, ArrowLeft, BookOpen, HelpCircle, Code2, ListTodo, ChevronDown, ChevronUp, FileText, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface Lesson {
    title: string;
    content: string;
}

interface Question {
    type: 'mcq' | 'programming';
    question?: string;
    options?: string[];
    correctOption?: number;
    title?: string;
    description?: string;
    initialCode?: string;
    language?: string;
    sampleTestCases?: { input: string; output: string }[];
    hiddenTestCases?: { input: string; output: string }[];
}

interface Module {
    title: string;
    isOpen: boolean;
    lessons: Lesson[];
    questions: Question[];
}

export default function CreateCoursePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('Beginner');
    const [language, setLanguage] = useState('python');
    const [category, setCategory] = useState('Computer Science');
    const [modules, setModules] = useState<Module[]>([
        { 
            title: '', 
            isOpen: true,
            lessons: [{ title: '', content: '' }],
            questions: [] 
        }
    ]);

    const addModule = () => {
        setModules([...modules, { 
            title: '', 
            isOpen: true,
            lessons: [{ title: '', content: '' }],
            questions: [] 
        }]);
    };

    const removeModule = (index: number) => {
        setModules(modules.filter((_, i) => i !== index));
    };

    const updateModule = (index: number, updates: any) => {
        const newModules = [...modules];
        newModules[index] = { ...newModules[index], ...updates };
        setModules(newModules);
    };

    const addLesson = (mIndex: number) => {
        const newModules = [...modules];
        newModules[mIndex].lessons.push({ title: '', content: '' });
        setModules(newModules);
    };

    const updateLesson = (mIndex: number, lIndex: number, updates: any) => {
        const newModules = [...modules];
        newModules[mIndex].lessons[lIndex] = { ...newModules[mIndex].lessons[lIndex], ...updates };
        setModules(newModules);
    };

    const addQuestion = (mIndex: number, type: 'mcq' | 'programming') => {
        const newModules = [...modules];
        const newQ: Question = type === 'mcq' 
            ? { type: 'mcq', question: '', options: ['', '', '', ''], correctOption: 0 }
            : { 
                type: 'programming', 
                title: '', 
                description: '', 
                initialCode: '', 
                language: language, 
                sampleTestCases: [{ input: '', output: '' }], 
                hiddenTestCases: [{ input: '', output: '' }] 
              };
        newModules[mIndex].questions.push(newQ);
        setModules(newModules);
    };

    const updateQuestion = (mIndex: number, qIndex: number, updates: any) => {
        const newModules = [...modules];
        newModules[mIndex].questions[qIndex] = { ...newModules[mIndex].questions[qIndex], ...updates };
        setModules(newModules);
    };

    const addTestCase = (mIndex: number, qIndex: number, isHidden: boolean) => {
        const newModules = [...modules];
        const field = isHidden ? 'hiddenTestCases' : 'sampleTestCases';
        const q = newModules[mIndex].questions[qIndex] as any;
        if (!q[field]) q[field] = [];
        q[field].push({ input: '', output: '' });
        setModules(newModules);
    };

    const updateTestCase = (mIndex: number, qIndex: number, tIndex: number, isHidden: boolean, field: string, value: string) => {
        const newModules = [...modules];
        const tcField = isHidden ? 'hiddenTestCases' : 'sampleTestCases';
        const q = newModules[mIndex].questions[qIndex] as any;
        q[tcField][tIndex][field] = value;
        setModules(newModules);
    };

    const removeTestCase = (mIndex: number, qIndex: number, tIndex: number, isHidden: boolean) => {
        const newModules = [...modules];
        const field = isHidden ? 'hiddenTestCases' : 'sampleTestCases';
        const q = newModules[mIndex].questions[qIndex] as any;
        q[field].splice(tIndex, 1);
        setModules(newModules);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    difficulty,
                    language,
                    category,
                    modules: modules.map(m => ({
                        title: m.title,
                        lessons: m.lessons,
                        questions: m.questions
                    }))
                })
            });

            if (res.ok) {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Failed to create course:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto pb-32">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-6 transition-colors font-bold text-sm">
                <ArrowLeft className="w-4 h-4" />
                BACK TO DASHBOARD
            </Link>

            <h1 className="text-4xl font-black text-gradient mb-8 uppercase tracking-tighter">Create New Course</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="space-y-6 sticky top-6">
                        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary-500" />
                            Course Info
                        </h2>

                        <Input
                            label="Title"
                            placeholder="e.g. Master React in 30 Days"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />

                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500">Description</label>
                            <textarea
                                className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 h-32 resize-none text-sm"
                                placeholder="What will students achieve?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        <Input 
                            label="Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g. Web Development"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Difficulty</label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full px-3 py-2 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-bold"
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-3 py-2 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-bold"
                                >
                                    <option value="python">Python</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="c">C</option>
                                </select>
                            </div>
                        </div>

                        <Button type="submit" loading={loading} className="w-full py-4 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary-500/20">
                            <Save className="w-5 h-5 mr-2" />
                            Launch Course
                        </Button>
                    </Card>
                </div>

                {/* Curriculum */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Curriculum Builder</h2>
                        <Button type="button" variant="secondary" onClick={addModule} className="flex items-center gap-2 py-2">
                            <Plus className="w-4 h-4" />
                            Add Module
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {modules.map((module, mIndex) => (
                            <Card key={mIndex} className={`relative overflow-hidden transition-all border-l-4 ${module.isOpen ? 'border-primary-500' : 'border-gray-500/20'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex-1 flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 font-black">
                                            {mIndex + 1}
                                        </div>
                                        <input 
                                            className="bg-transparent border-none focus:ring-0 text-xl font-black uppercase tracking-tight w-full placeholder:text-gray-500/30"
                                            placeholder="Module Title..."
                                            value={module.title}
                                            onChange={(e) => updateModule(mIndex, { title: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => updateModule(mIndex, { isOpen: !module.isOpen })}
                                            className="p-2 glass rounded-lg hover:bg-white/10"
                                        >
                                            {module.isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => removeModule(mIndex)}
                                            className="p-2 glass rounded-lg text-red-500 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {module.isOpen && (
                                    <div className="space-y-8 animate-slide-up">
                                        {/* Lessons */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    Lessons ({module.lessons.length})
                                                </h3>
                                                <button type="button" onClick={() => addLesson(mIndex)} className="text-[10px] font-black uppercase text-primary-500 hover:underline">
                                                    + Add Lesson
                                                </button>
                                            </div>
                                            {module.lessons.map((lesson, lIndex) => (
                                                <div key={lIndex} className="p-4 glass rounded-xl space-y-3 relative group">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-black text-gray-500">{lIndex + 1}.</span>
                                                        <input 
                                                            className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full p-0"
                                                            placeholder="Lesson Title..."
                                                            value={lesson.title}
                                                            onChange={(e) => updateLesson(mIndex, lIndex, { title: e.target.value })}
                                                        />
                                                    </div>
                                                    <textarea 
                                                        className="w-full bg-black/20 rounded-lg p-3 text-xs font-medium focus:ring-1 focus:ring-primary-500/50 min-h-[80px] outline-none"
                                                        placeholder="Markdown content or lesson description..."
                                                        value={lesson.content}
                                                        onChange={(e) => updateLesson(mIndex, lIndex, { content: e.target.value })}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Questions */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                                    <HelpCircle className="w-4 h-4" />
                                                    Assessments ({module.questions.length})
                                                </h3>
                                                <div className="flex gap-4">
                                                    <button type="button" onClick={() => addQuestion(mIndex, 'mcq')} className="text-[10px] font-black uppercase text-primary-500 hover:underline flex items-center gap-1">
                                                        <ListTodo className="w-3 h-3" /> + MCQ
                                                    </button>
                                                    <button type="button" onClick={() => addQuestion(mIndex, 'programming')} className="text-[10px] font-black uppercase text-indigo-500 hover:underline flex items-center gap-1">
                                                        <Code2 className="w-3 h-3" /> + Code
                                                    </button>
                                                </div>
                                            </div>
                                            {module.questions.map((q: any, qIndex: number) => (
                                                <div key={qIndex} className="p-4 glass rounded-xl border border-white/5 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {q.type === 'mcq' ? <ListTodo className="w-4 h-4 text-primary-500" /> : <Code2 className="w-4 h-4 text-indigo-500" />}
                                                            <span className="text-[10px] font-black uppercase text-gray-500">{q.type} Question</span>
                                                        </div>
                                                        <button type="button" onClick={() => {
                                                            const newQ = [...module.questions];
                                                            newQ.splice(qIndex, 1);
                                                            updateModule(mIndex, { questions: newQ });
                                                        }} className="text-red-500 opacity-50 hover:opacity-100">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {q.type === 'mcq' ? (
                                                        <>
                                                            <Input 
                                                                placeholder="Enter question text..."
                                                                value={q.question}
                                                                onChange={(e) => updateQuestion(mIndex, qIndex, { question: e.target.value })}
                                                            />
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {q.options.map((opt: string, oi: number) => (
                                                                    <div key={oi} className="flex items-center gap-2">
                                                                        <input 
                                                                            type="radio" 
                                                                            checked={q.correctOption === oi} 
                                                                            onChange={() => updateQuestion(mIndex, qIndex, { correctOption: oi })}
                                                                            className="w-3 h-3 accent-primary-500" 
                                                                        />
                                                                        <input 
                                                                            className="bg-black/20 rounded px-2 py-1 text-xs w-full outline-none"
                                                                            value={opt}
                                                                            onChange={(e) => {
                                                                                const newOptions = [...q.options];
                                                                                newOptions[oi] = e.target.value;
                                                                                updateQuestion(mIndex, qIndex, { options: newOptions });
                                                                            }}
                                                                            placeholder={`Option ${oi + 1}`}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <Input 
                                                                    label="Problem Name"
                                                                    value={q.title}
                                                                    onChange={(e) => updateQuestion(mIndex, qIndex, { title: e.target.value })}
                                                                />
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Language</label>
                                                                    <select 
                                                                        className="w-full bg-black/20 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                                                        value={q.language}
                                                                        onChange={(e) => updateQuestion(mIndex, qIndex, { language: e.target.value })}
                                                                    >
                                                                        <option value="python">Python</option>
                                                                        <option value="javascript">JavaScript</option>
                                                                        <option value="java">Java</option>
                                                                        <option value="cpp">C++</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <textarea 
                                                                className="w-full bg-black/20 rounded-lg p-3 text-xs font-medium focus:ring-1 focus:ring-primary-500/50 min-h-[100px] outline-none"
                                                                placeholder="Detailed problem description (Markdown)..."
                                                                value={q.description}
                                                                onChange={(e) => updateQuestion(mIndex, qIndex, { description: e.target.value })}
                                                            />
                                                            <textarea 
                                                                className="w-full bg-black/40 rounded-lg p-3 text-[10px] font-mono focus:ring-1 focus:ring-indigo-500/50 min-h-[120px] outline-none"
                                                                placeholder="Boilerplate Code..."
                                                                value={q.initialCode}
                                                                onChange={(e) => updateQuestion(mIndex, qIndex, { initialCode: e.target.value })}
                                                            />

                                                            {/* Test Cases */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                                                                        <span className="text-[9px] font-black uppercase text-green-500 flex items-center gap-1"><Eye className="w-3 h-3" /> Sample</span>
                                                                        <button type="button" onClick={() => addTestCase(mIndex, qIndex, false)} className="text-[9px] font-black text-primary-500 hover:underline">+ ADD</button>
                                                                    </div>
                                                                    {q.sampleTestCases?.map((tc: any, tIndex: number) => (
                                                                        <div key={tIndex} className="p-2 bg-black/20 rounded-lg space-y-1 relative group/tc">
                                                                            <button type="button" onClick={() => removeTestCase(mIndex, qIndex, tIndex, false)} className="absolute top-1 right-1 text-red-500 opacity-0 group-hover/tc:opacity-100"><Trash2 className="w-3 h-3" /></button>
                                                                            <input className="w-full bg-transparent text-[9px] font-mono outline-none border-b border-white/5" placeholder="Input" value={tc.input} onChange={(e) => updateTestCase(mIndex, qIndex, tIndex, false, 'input', e.target.value)} />
                                                                            <input className="w-full bg-transparent text-[9px] font-mono outline-none text-green-500" placeholder="Output" value={tc.output} onChange={(e) => updateTestCase(mIndex, qIndex, tIndex, false, 'output', e.target.value)} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                                                                        <span className="text-[9px] font-black uppercase text-red-500 flex items-center gap-1"><EyeOff className="w-3 h-3" /> Hidden</span>
                                                                        <button type="button" onClick={() => addTestCase(mIndex, qIndex, true)} className="text-[9px] font-black text-primary-500 hover:underline">+ ADD</button>
                                                                    </div>
                                                                    {q.hiddenTestCases?.map((tc: any, tIndex: number) => (
                                                                        <div key={tIndex} className="p-2 bg-black/20 rounded-lg space-y-1 relative group/tc">
                                                                            <button type="button" onClick={() => removeTestCase(mIndex, qIndex, tIndex, true)} className="absolute top-1 right-1 text-red-500 opacity-0 group-hover/tc:opacity-100"><Trash2 className="w-3 h-3" /></button>
                                                                            <input className="w-full bg-transparent text-[9px] font-mono outline-none border-b border-white/5" placeholder="Input" value={tc.input} onChange={(e) => updateTestCase(mIndex, qIndex, tIndex, true, 'input', e.target.value)} />
                                                                            <input className="w-full bg-transparent text-[9px] font-mono outline-none text-red-400" placeholder="Output" value={tc.output} onChange={(e) => updateTestCase(mIndex, qIndex, tIndex, true, 'output', e.target.value)} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </form>
        </div>
    );
}
