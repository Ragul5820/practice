'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
    BookOpen, Users, Trophy, Plus,
    TrendingUp, ArrowRight, Code2, BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.push('/login'); return; }
        if (user.role === 'student') { router.push('/dashboard'); return; }

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                const [coursesRes, assessmentsRes] = await Promise.all([
                    fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/assessments', { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                const coursesData = await coursesRes.json();
                const assessmentsData = await assessmentsRes.json();

                // Filter to this teacher's content if teacher role
                const myCourses = user.role === 'admin'
                    ? coursesData
                    : coursesData.filter((c: any) => c.createdBy === user.id);
                const myAssessments = user.role === 'admin'
                    ? assessmentsData
                    : assessmentsData.filter((a: any) => a.createdBy === user.id);

                setCourses(Array.isArray(myCourses) ? myCourses : coursesData);
                setAssessments(Array.isArray(myAssessments) ? myAssessments : assessmentsData);

                // Fetch submissions to get a count of active students
                const subsRes = await fetch('/api/submissions', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const subsData = await subsRes.json();
                setEnrollments(Array.isArray(subsData) ? subsData : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto animate-pulse space-y-6">
                <div className="h-12 w-56 glass rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 glass rounded-2xl" />)}
                </div>
                <div className="h-72 glass rounded-2xl" />
            </div>
        );
    }

    if (!user) return null;

    // Count unique students from submissions
    const uniqueStudents = new Set(enrollments.map((s: any) => s.userId)).size;
    const totalLessons = courses.reduce((acc: number, c: any) =>
        acc + (c.modules?.reduce((a: number, m: any) => a + (m.lessons || 0), 0) || 0), 0);

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gradient">
                            {user.role === 'admin' ? 'Admin Dashboard' : 'Teacher Dashboard'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user.name}!</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => router.push('/courses/create')}
                            className="flex items-center gap-2">
                            <Plus className="w-4 h-4" /> New Course
                        </Button>
                        <Button onClick={() => router.push('/admin/assessments')}
                            className="flex items-center gap-2">
                            <Trophy className="w-4 h-4" /> New Assessment
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Courses Created', value: courses.length, icon: BookOpen, light: 'bg-blue-50 text-blue-700 border-blue-100', dark: 'dark:bg-gradient-to-br dark:from-blue-500 dark:to-blue-600 dark:text-white dark:border-none' },
                        { label: 'Assessments', value: assessments.length, icon: Trophy, light: 'bg-purple-50 text-purple-700 border-purple-100', dark: 'dark:bg-gradient-to-br dark:from-purple-500 dark:to-purple-600 dark:text-white dark:border-none' },
                        { label: 'Active Students', value: uniqueStudents, icon: Users, light: 'bg-emerald-50 text-emerald-700 border-emerald-100', dark: 'dark:bg-gradient-to-br dark:from-green-500 dark:to-green-600 dark:text-white dark:border-none' },
                        { label: 'Total Lessons', value: totalLessons, icon: Code2, light: 'bg-orange-50 text-orange-700 border-orange-100', dark: 'dark:bg-gradient-to-br dark:from-orange-500 dark:to-orange-600 dark:text-white dark:border-none' },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <Card key={s.label} className={`${s.light} ${s.dark} relative overflow-hidden`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold mb-1 opacity-80">{s.label}</p>
                                        <p className="text-3xl font-black">{s.value}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-current opacity-10 rounded-lg" />
                                    <Icon className="w-6 h-6 absolute right-6 top-1/2 -translate-y-1/2 opacity-40" />
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Courses List */}
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary-500" />
                                    My Courses
                                </h2>
                                <Link href="/courses/create">
                                    <Button variant="secondary" className="text-xs py-1.5 flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> Add
                                    </Button>
                                </Link>
                            </div>

                            {courses.length > 0 ? (
                                <div className="space-y-3">
                                    {courses.map((course: any) => {
                                        const lessons = course.modules?.reduce((a: number, m: any) => a + (m.lessons || 0), 0) || 0;
                                        const langColors: Record<string, string> = {
                                            python: 'text-blue-500 bg-blue-500/10',
                                            javascript: 'text-yellow-500 bg-yellow-500/10',
                                            java: 'text-red-500 bg-red-500/10',
                                            cpp: 'text-purple-500 bg-purple-500/10',
                                            c: 'text-gray-500 bg-gray-500/10',
                                        };
                                        const langClass = langColors[course.language] || 'text-gray-500 bg-gray-500/10';
                                        return (
                                            <div key={course.id}
                                                className="flex items-center gap-4 p-4 glass rounded-xl border border-black/5 dark:border-white/10 hover:border-primary-500/30 transition-all group">
                                                <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center shrink-0">
                                                    <BookOpen className="w-6 h-6 text-primary-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold truncate group-hover:text-primary-500 transition-colors">
                                                        {course.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${langClass}`}>
                                                            {course.language}
                                                        </span>
                                                        <span className="text-xs text-slate-600 dark:text-gray-500">{lessons} lessons</span>
                                                        <span className="text-xs text-slate-600 dark:text-gray-500">{course.modules?.length || 0} modules</span>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${course.difficulty === 'Beginner'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : course.difficulty === 'Intermediate'
                                                        ? 'bg-yellow-500/10 text-yellow-500'
                                                        : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {course.difficulty}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-20" />
                                    <p className="text-gray-500 mb-4">No courses yet</p>
                                    <Button onClick={() => router.push('/courses/create')} className="flex items-center gap-2 mx-auto">
                                        <Plus className="w-4 h-4" /> Create First Course
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-6">
                        {/* Assessments */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-primary-500" /> Assessments
                                </h2>
                                <Link href="/admin/assessments">
                                    <Button variant="secondary" className="text-xs py-1 flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> New
                                    </Button>
                                </Link>
                            </div>
                            {assessments.length > 0 ? (
                                <div className="space-y-2">
                                    {assessments.slice(0, 5).map((a: any) => (
                                        <div key={a.id} className="flex items-center gap-3 p-3 glass rounded-lg">
                                            <Trophy className="w-4 h-4 text-primary-500 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{a.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {a.questions?.length || 0} questions · {a.points || 100} pts
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No assessments yet</p>
                            )}
                        </Card>

                        {/* Quick Links */}
                        <Card>
                            <h2 className="font-bold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary-500" /> Quick Links
                            </h2>
                            <div className="space-y-2">
                                {[
                                    { label: 'View All Courses', href: '/courses', icon: BookOpen },
                                    ...(user.role === 'admin' ? [
                                        { label: 'Manage Students', href: '/admin/students', icon: Users },
                                    ] : []),
                                    { label: 'Create Assessment', href: '/admin/assessments', icon: Trophy },
                                    { label: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
                                ].map(link => {
                                    const Icon = link.icon;
                                    return (
                                        <Link key={link.href} href={link.href}
                                            className="flex items-center gap-3 p-3 glass rounded-lg hover:bg-primary-500/10 hover:text-primary-500 transition-all group">
                                            <Icon className="w-4 h-4" />
                                            <span className="text-sm font-medium">{link.label}</span>
                                            <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
