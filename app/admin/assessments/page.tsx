'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus, Trash2, Save, HelpCircle, Trophy, Clock, Code2, ListTodo, Eye, EyeOff, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminAssessmentsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [assessment, setAssessment] = useState({
        title: '',
        description: '',
        timeLimit: '30',
        points: '100',
        questions: [{ 
            type: 'mcq', 
            question: '', 
            options: ['', '', '', ''], 
            correctOption: 0,
            // Programming fields
            title: '',
            description: '',
            initialCode: '',
            sampleTestCases: [{ input: '', output: '' }],
            hiddenTestCases: [{ input: '', output: '' }],
            language: 'python'
        }]
    });

    const addQuestion = () => {
        setAssessment({
            ...assessment,
            questions: [...assessment.questions, { 
                type: 'mcq', 
                question: '', 
                options: ['', '', '', ''], 
                correctOption: 0,
                title: '',
                description: '',
                initialCode: '',
                sampleTestCases: [{ input: '', output: '' }],
                hiddenTestCases: [{ input: '', output: '' }],
                language: 'python'
            }]
        });
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...assessment.questions];
        newQuestions.splice(index, 1);
        setAssessment({ ...assessment, questions: newQuestions });
    };

    const updateQuestion = (index: number, updates: any) => {
        const newQuestions = [...assessment.questions];
        newQuestions[index] = { ...newQuestions[index], ...updates };
        setAssessment({ ...assessment, questions: newQuestions });
    };

    const addTestCase = (qIndex: number, isHidden: boolean) => {
        const newQuestions = [...assessment.questions];
        const field = isHidden ? 'hiddenTestCases' : 'sampleTestCases';
        if (!newQuestions[qIndex][field]) newQuestions[qIndex][field] = [];
        newQuestions[qIndex][field].push({ input: '', output: '' });
        setAssessment({ ...assessment, questions: newQuestions });
    };

    const removeTestCase = (qIndex: number, tIndex: number, isHidden: boolean) => {
        const newQuestions = [...assessment.questions];
        const field = isHidden ? 'hiddenTestCases' : 'sampleTestCases';
        newQuestions[qIndex][field].splice(tIndex, 1);
        setAssessment({ ...assessment, questions: newQuestions });
    };

    const updateTestCase = (qIndex: number, tIndex: number, isHidden: boolean, field: string, value: string) => {
        const newQuestions = [...assessment.questions];
        const tcField = isHidden ? 'hiddenTestCases' : 'sampleTestCases';
        (newQuestions[qIndex][tcField][tIndex] as any)[field] = value;
        setAssessment({ ...assessment, questions: newQuestions });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Clean up questions before sending
            const formattedQuestions = assessment.questions.map(q => {
                if (q.type === 'mcq') {
                    return {
                        type: 'mcq',
                        question: q.question,
                        options: q.options,
                        correctOption: q.correctOption
                    };
                } else {
                    return {
                        type: 'programming',
                        title: q.title || q.question,
                        description: q.description || q.question,
                        initialCode: q.initialCode,
                        language: q.language,
                        sampleTestCases: q.sampleTestCases,
                        hiddenTestCases: q.hiddenTestCases,
                        // Compatibility
                        question: q.title || q.question
                    };
                }
            });

            const res = await fetch('/api/admin/assessments', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ ...assessment, questions: formattedQuestions })
            });
            if (res.ok) {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Failed to create assessment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto pb-32">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gradient mb-2 uppercase tracking-tighter">Create Assessment</h1>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Build advanced challenges and reports</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: General Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="space-y-6 sticky top-6">
                        <div className="flex items-center gap-2 text-primary-500 border-b border-white/5 pb-4">
                            <Trophy className="w-6 h-6" />
                            <h2 className="text-xl font-black uppercase tracking-tight">Settings</h2>
                        </div>
                        
                        <Input 
                            label="Title" 
                            placeholder="e.g. Mid-Term Coding Challenge" 
                            value={assessment.title}
                            onChange={(e) => setAssessment({...assessment, title: e.target.value})}
                            required
                        />
                        
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Summary</label>
                            <textarea 
                                className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none text-sm"
                                placeholder="Short overview..."
                                value={assessment.description}
                                onChange={(e) => setAssessment({...assessment, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="Time (min)" 
                                type="number" 
                                value={assessment.timeLimit}
                                onChange={(e) => setAssessment({...assessment, timeLimit: e.target.value})}
                            />
                            <Input 
                                label="Points" 
                                type="number" 
                                value={assessment.points}
                                onChange={(e) => setAssessment({...assessment, points: e.target.value})}
                            />
                        </div>

                        <Button type="submit" loading={loading} className="w-full py-4 font-black uppercase tracking-widest shadow-xl shadow-primary-500/20">
                            <Save className="w-5 h-5 mr-2" />
                            Deploy Assessment
                        </Button>
                    </Card>
                </div>

                {/* Right: Question List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl backdrop-blur-md">
                        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <HelpCircle className="w-6 h-6 text-primary-500" />
                            Question Pool
                        </h2>
                        <Button type="button" variant="secondary" onClick={addQuestion} className="flex items-center gap-2 py-2">
                            <Plus className="w-4 h-4" />
                            Add Question
                        </Button>
                    </div>

                    {assessment.questions.map((q, qIndex) => (
                        <Card key={qIndex} className="relative group border border-white/5 overflow-hidden transition-all hover:border-primary-500/30">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${q.type === 'programming' ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`} />
                            
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-sm">{qIndex + 1}</span>
                                    <div className="flex bg-white/5 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => updateQuestion(qIndex, { type: 'mcq' })}
                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${q.type === 'mcq' ? 'bg-primary-500 text-white shadow-lg' : 'hover:bg-white/5 text-gray-500'}`}
                                        >
                                            <ListTodo className="w-3.5 h-3.5" /> MCQ
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateQuestion(qIndex, { type: 'programming' })}
                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${q.type === 'programming' ? 'bg-indigo-500 text-white shadow-lg' : 'hover:bg-white/5 text-gray-500'}`}
                                        >
                                            <Code2 className="w-3.5 h-3.5" /> Code
                                        </button>
                                    </div>
                                </div>
                                <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500/50 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {q.type === 'mcq' ? (
                                    <>
                                        <Input 
                                            label="Question Prompt"
                                            placeholder="What is the output of...?"
                                            value={q.question}
                                            onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                                            required
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-3 glass p-2 rounded-xl group/opt border border-white/5 hover:border-primary-500/30">
                                                    <input 
                                                        type="radio"
                                                        checked={q.correctOption === oIndex}
                                                        onChange={() => updateQuestion(qIndex, { correctOption: oIndex })}
                                                        className="w-4 h-4 accent-primary-500 ml-2"
                                                    />
                                                    <input 
                                                        type="text"
                                                        placeholder={`Option ${oIndex + 1}`}
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOptions = [...q.options];
                                                            newOptions[oIndex] = e.target.value;
                                                            updateQuestion(qIndex, { options: newOptions });
                                                        }}
                                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-gray-600"
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6 animate-slide-up">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input 
                                                label="Problem Name"
                                                placeholder="e.g. Reverse a Linked List"
                                                value={q.title}
                                                onChange={(e) => updateQuestion(qIndex, { title: e.target.value })}
                                                required
                                            />
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Language</label>
                                                <select 
                                                    value={q.language}
                                                    onChange={(e) => updateQuestion(qIndex, { language: e.target.value })}
                                                    className="w-full px-4 py-2.5 glass rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="python">Python</option>
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="java">Java</option>
                                                    <option value="cpp">C++</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Description (Markdown)</label>
                                            <textarea 
                                                className="w-full px-4 py-3 glass rounded-xl font-medium text-sm h-32 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="Detailed problem statement, constraints, and hints..."
                                                value={q.description}
                                                onChange={(e) => updateQuestion(qIndex, { description: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Boilerplate Code</label>
                                            <textarea 
                                                className="w-full px-4 py-3 glass rounded-xl font-mono text-xs h-40 resize-none focus:ring-2 focus:ring-indigo-500 outline-none bg-black/20"
                                                placeholder="def solve():\n    # your code here"
                                                value={q.initialCode}
                                                onChange={(e) => updateQuestion(qIndex, { initialCode: e.target.value })}
                                            />
                                        </div>

                                        {/* Test Cases */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Sample Cases */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center gap-1">
                                                        <Eye className="w-3.5 h-3.5" /> Sample Cases
                                                    </h3>
                                                    <button type="button" onClick={() => addTestCase(qIndex, false)} className="text-[10px] font-black uppercase text-primary-500 hover:underline">+ Add</button>
                                                </div>
                                                {q.sampleTestCases?.map((tc: any, tIndex: number) => (
                                                    <div key={tIndex} className="p-3 glass rounded-xl border border-white/5 relative group/tc space-y-2">
                                                        <button type="button" onClick={() => removeTestCase(qIndex, tIndex, false)} className="absolute -top-2 -right-2 text-red-500 opacity-0 group-hover/tc:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                                                        <input className="w-full bg-black/20 rounded px-2 py-1 text-[10px] font-mono outline-none" placeholder="Input" value={tc.input} onChange={(e) => updateTestCase(qIndex, tIndex, false, 'input', e.target.value)} />
                                                        <input className="w-full bg-black/20 rounded px-2 py-1 text-[10px] font-mono outline-none text-green-500" placeholder="Output" value={tc.output} onChange={(e) => updateTestCase(qIndex, tIndex, false, 'output', e.target.value)} />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Hidden Cases */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1">
                                                        <EyeOff className="w-3.5 h-3.5" /> Hidden Cases
                                                    </h3>
                                                    <button type="button" onClick={() => addTestCase(qIndex, true)} className="text-[10px] font-black uppercase text-primary-500 hover:underline">+ Add</button>
                                                </div>
                                                {q.hiddenTestCases?.map((tc: any, tIndex: number) => (
                                                    <div key={tIndex} className="p-3 glass rounded-xl border border-white/5 relative group/tc space-y-2">
                                                        <button type="button" onClick={() => removeTestCase(qIndex, tIndex, true)} className="absolute -top-2 -right-2 text-red-500 opacity-0 group-hover/tc:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                                                        <input className="w-full bg-black/20 rounded px-2 py-1 text-[10px] font-mono outline-none" placeholder="Input" value={tc.input} onChange={(e) => updateTestCase(qIndex, tIndex, true, 'input', e.target.value)} />
                                                        <input className="w-full bg-black/20 rounded px-2 py-1 text-[10px] font-mono outline-none text-red-400" placeholder="Output" value={tc.output} onChange={(e) => updateTestCase(qIndex, tIndex, true, 'output', e.target.value)} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </form>
        </div>
    );
}
