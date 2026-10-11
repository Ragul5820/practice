'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
    Code2, BookOpen, Trophy,
    TrendingUp, Award, Target, Clock, BarChart3
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        coursesEnrolled: 0,
        assessmentsCompleted: 0,
        totalScore: 0,
        avgPercentage: 0,
        recentActivity: [] as any[],
    });
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.push('/login'); return; }
        if (user.role === 'teacher' || user.role === 'admin') {
            router.push('/dashboard/teacher');
            return;
        }

        const calculateTotalItems = (course: any) => {
            if (!course.modules) return 0;
            return course.modules.reduce((acc: number, mod: any) => {
                const lessonCount = Array.isArray(mod.lessons) ? mod.lessons.length : (typeof mod.lessons === 'number' ? mod.lessons : 0);
                const questionCount = Array.isArray(mod.questions) ? mod.questions.length : (typeof mod.questions === 'number' ? mod.questions : 0);
                return acc + lessonCount + questionCount;
            }, 0);
        };

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [enrollRes, subsRes, progressRes] = await Promise.all([
                    fetch('/api/enrollments', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/submissions', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/progress', { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const enrollData = await enrollRes.json();
                const subsData = await subsRes.json();
                const progressData = progressRes.ok ? await progressRes.json() : [];

                let mappedCourses: any[] = [];
                if (Array.isArray(enrollData)) {
                    mappedCourses = enrollData.map((c: any) => {
                        const prog = Array.isArray(progressData) ? progressData.find((p: any) => p.courseId === c.id) : null;
                        const completedCount = prog?.completedItems?.length || 0;
                        const totalItems = calculateTotalItems(c);
                        const progressPct = totalItems > 0 ? Math.min(100, Math.round((completedCount / totalItems) * 100)) : 0;
                        return { ...c, progressPct };
                    });
                    setEnrolledCourses(mappedCourses);
                }

                if (Array.isArray(subsData) && subsData.length > 0) {
                    const totalScore = subsData.reduce((a: number, s: any) => a + (s.score || 0), 0);
                    const avgPct = Math.round(subsData.reduce((a: number, s: any) => a + (s.percentage || 0), 0) / subsData.length);
                    setChartData(subsData.slice(-6).map((s: any, i: number) => ({
                        name: s.assessmentTitle ? s.assessmentTitle.slice(0, 10) + '…' : `Quiz ${i + 1}`,
                        score: s.percentage || 0,
                    })));
                    setStats({
                        coursesEnrolled: mappedCourses.length,
                        assessmentsCompleted: subsData.length,
                        totalScore,
                        avgPercentage: avgPct,
                        recentActivity: [
                            ...subsData.slice(-3).reverse().map((s: any) => ({
                                title: `Scored ${s.percentage}% on "${s.assessmentTitle || 'Assessment'}"`,
                                time: new Date(s.createdAt).toLocaleDateString(),
                                score: s.percentage, type: 'assessment',
                            })),
                            ...mappedCourses.slice(-2).reverse().map((c: any) => ({
                                title: `Enrolled in ${c.title}`,
                                time: new Date(c.enrolledAt).toLocaleDateString(),
                                score: null, type: 'enroll',
                            })),
                        ].slice(0, 5),
                    });
                } else {
                    setStats(prev => ({
                        ...prev,
                        coursesEnrolled: mappedCourses.length,
                        recentActivity: mappedCourses.slice(-3).reverse().map((c: any) => ({
                            title: `Enrolled in ${c.title}`,
                            time: new Date(c.enrolledAt).toLocaleDateString(),
                            score: null, type: 'enroll',
                        })),
                    }));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return <div className="p-6 max-w-7xl mx-auto animate-pulse">
            <div className="h-12 w-48 glass mb-8 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 glass rounded-2xl" />)}
            </div>
            <div className="h-96 glass rounded-2xl" />
        </div>;
    }
    if (!user) return null;

    const COLORS = ['#0ea5e9', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6'];

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
                    <p className="text-sm text-slate-700 dark:text-gray-400 mt-1">Welcome back, {user?.name}! 👋</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Courses Enrolled', value: stats.coursesEnrolled, icon: BookOpen, light: 'bg-blue-50 text-blue-700 border-blue-100', dark: 'dark:bg-gradient-to-br dark:from-blue-500 dark:to-blue-600 dark:text-white dark:border-none' },
                        { label: 'Assessments Done', value: stats.assessmentsCompleted, icon: Trophy, light: 'bg-purple-50 text-purple-700 border-purple-100', dark: 'dark:bg-gradient-to-br dark:from-purple-500 dark:to-purple-600 dark:text-white dark:border-none' },
                        { label: 'Average Score', value: `${stats.avgPercentage}%`, icon: TrendingUp, light: 'bg-emerald-50 text-emerald-700 border-emerald-100', dark: 'dark:bg-gradient-to-br dark:from-green-500 dark:to-green-600 dark:text-white dark:border-none' },
                        { label: 'Total Points', value: stats.totalScore, icon: Award, light: 'bg-orange-50 text-orange-700 border-orange-100', dark: 'dark:bg-gradient-to-br dark:from-orange-500 dark:to-orange-600 dark:text-white dark:border-none' },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <Card key={s.label} className={`${s.light} ${s.dark}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold mb-1 opacity-80">{s.label}</p>
                                        <p className="text-3xl font-black">{s.value}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-current opacity-10 rounded-lg absolute right-6 top-1/2 -translate-y-1/2" />
                                    <Icon className="w-6 h-6 absolute right-9 top-1/2 -translate-y-1/2 opacity-40" />
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: 'Practice Code', sub: 'Start coding now', icon: Code2, color: 'bg-primary-100 dark:bg-primary-900/30', iconColor: 'text-primary-600 dark:text-primary-400', href: '/practice' },
                        { label: 'Browse Courses', sub: 'Explore learning paths', icon: BookOpen, color: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', href: '/courses' },
                        { label: 'Take Assessment', sub: 'Test your skills', icon: Trophy, color: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400', href: '/assessments' },
                    ].map(item => {
                        const Icon = item.icon;
                        return (
                            <Card key={item.href} hover onClick={() => router.push(item.href)}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center`}>
                                        <Icon className={`w-7 h-7 ${item.iconColor}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{item.label}</h3>
                                        <p className="text-sm text-slate-600 dark:text-gray-400">{item.sub}</p>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart */}
                    <div className="lg:col-span-2">
                        <Card>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary-500" />
                                Assessment Performance
                            </h2>
                            {chartData.length > 0 ? (
                                <div className="h-52">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" className="dark:stroke-white/5" />
                                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-body)' }} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-body)' }} />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: 'var(--card-bg)', 
                                                    border: '1px solid var(--card-border)', 
                                                    borderRadius: '12px', 
                                                    fontSize: 12,
                                                    color: 'var(--text-body)'
                                                }} 
                                                itemStyle={{ color: 'var(--text-body)' }}
                                                formatter={(v: any) => [`${v}%`, 'Score']} 
                                            />
                                            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                                                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-52 flex flex-col items-center justify-center text-gray-500">
                                    <BarChart3 className="w-10 h-10 opacity-20 mb-3" />
                                    <p className="text-sm">Complete assessments to see your chart</p>
                                    <Button variant="secondary" className="mt-4 py-2 text-xs" onClick={() => router.push('/assessments')}>
                                        Take an Assessment
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <Card>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary-500" />
                                Recent Activity
                            </h2>
                            <div className="space-y-3">
                                {stats.recentActivity.length > 0 ? stats.recentActivity.map((a: any, i: number) => (
                                    <div key={i} className="flex items-start gap-3 p-3 glass rounded-xl transition-all">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${a.type === 'assessment' ? 'bg-purple-500/10' : 'bg-primary-500/10'}`}>
                                            {a.type === 'assessment' ? <Trophy className="w-4 h-4 text-purple-500" /> : <Target className="w-4 h-4 text-primary-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-xs leading-snug">{a.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{a.time}</p>
                                        </div>
                                        {a.score !== null && (
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${a.score >= 60 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {a.score}%
                                            </span>
                                        )}
                                    </div>
                                )) : <p className="text-center text-gray-500 py-4 text-sm">No recent activity yet</p>}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Enrolled Courses */}
                {enrolledCourses.length > 0 && (
                    <div className="mt-8">
                        <Card>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary-500" /> My Courses
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {enrolledCourses.map((course: any) => (
                                    <div key={course.id} className="p-4 glass rounded-2xl border border-white/10 group hover:border-primary-500/30 transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-500">{course.difficulty}</span>
                                            <span className="text-xs text-slate-700 dark:text-gray-400 font-bold">{course.progressPct || 0}% Done</span>
                                        </div>
                                        <h3 className="font-bold mb-4 group-hover:text-primary-500 transition-colors line-clamp-1">{course.title}</h3>
                                        <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-1.5 mb-4">
                                            <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${course.progressPct || 0}%` }} />
                                        </div>
                                        <Button variant="secondary" className="w-full py-2 text-xs" onClick={() => router.push(`/courses/${course.id}/learn`)}>
                                            Continue Learning
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
