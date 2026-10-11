'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import {
    BookOpen,
    Clock,
    CheckCircle2,
    PlayCircle,
    ArrowLeft,
    Shield,
    BarChart3,
    FileText,
    HelpCircle,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch course details
                const courseRes = await fetch(`/api/courses/${id}`);
                if (!courseRes.ok) throw new Error('Course not found');
                const courseData = await courseRes.json();
                setCourse(courseData);

                // Check enrollment
                if (user) {
                    const enrollRes = await fetch('/api/enrollments', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const enrollData = await enrollRes.json();
                    setIsEnrolled(enrollData.some((e: any) => e.id === id));
                }
            } catch (error) {
                console.error('Error:', error);
                router.push('/courses');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user, router]);

    const handleEnroll = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        setEnrolling(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/enrollments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ courseId: id })
            });

            if (res.ok) {
                setIsEnrolled(true);
            }
        } catch (error) {
            console.error('Enrollment failed:', error);
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return <div className="p-6 max-w-7xl mx-auto animate-pulse">
            <div className="h-64 glass rounded-3xl mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-96 glass rounded-2xl" />
                <div className="h-64 glass rounded-2xl" />
            </div>
        </div>;
    }

    if (!course) return null;

    const lessonCount = course.modules?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0) || 0;
    const questionCount = course.modules?.reduce((acc: number, mod: any) => acc + (mod.questions?.length || 0), 0) || 0;

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24">
            <Link href="/courses" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 mb-6 transition-colors group font-bold text-xs uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Courses
            </Link>

            {/* Hero Section */}
            <div className="relative glass rounded-3xl p-8 md:p-12 mb-8 overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-500/10 to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-primary-500/10 rounded-lg text-[10px] font-black text-primary-500 uppercase tracking-widest">
                            {course.difficulty}
                        </span>
                        <span className="px-3 py-1 bg-orange-500/10 rounded-lg text-[10px] font-black text-orange-500 uppercase tracking-widest">
                            {course.language}
                        </span>
                        <span className="px-3 py-1 bg-indigo-500/10 rounded-lg text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                            {course.category || 'Computer Science'}
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-gradient mb-6 uppercase tracking-tighter leading-none">
                        {course.title}
                    </h1>
                    <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-xl">
                        {course.description}
                    </p>

                    <div className="flex flex-wrap gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                                <p className="text-lg font-black leading-none">{lessonCount}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lessons</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <PlayCircle className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-lg font-black leading-none">{questionCount}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Assessments</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Curriculum */}
                <div className="lg:col-span-2 space-y-8">
                    <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary-500" />
                        Curriculum
                    </h2>
                    <div className="space-y-4">
                        {course.modules.map((module: any, idx: number) => (
                            <Card key={idx} className="group hover:border-primary-500/30 transition-all relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500/20 group-hover:bg-primary-500 transition-colors" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 glass rounded-xl flex items-center justify-center font-black text-xl group-hover:bg-primary-500 group-hover:text-white transition-all shadow-lg">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl uppercase tracking-tight">{module.title}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                                    <FileText className="w-3 h-3" /> {module.lessons?.length || 0} Lessons
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                                    <HelpCircle className="w-3 h-3" /> {module.questions?.length || 0} Quiz
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-primary-500 transition-all group-hover:translate-x-1" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Sidebar Sticky */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <Card className="p-8 text-center border-2 border-primary-500/20 bg-gradient-to-br from-primary-500/5 to-indigo-500/5">
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Master this Course</h3>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                Get lifetime access to full HD videos, practical exercises, and completion certificates.
                            </p>

                            {isEnrolled ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-green-500 font-black p-4 bg-green-500/10 rounded-2xl mb-4 border border-green-500/20 uppercase tracking-widest text-xs">
                                        <CheckCircle2 className="w-5 h-5" />
                                        You are Enrolled
                                    </div>
                                    <Button className="w-full h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary-500/20" onClick={() => router.push(`/courses/${id}/learn`)}>
                                        Continue Learning →
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    className="w-full h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary-500/20"
                                    onClick={handleEnroll}
                                    loading={enrolling}
                                >
                                    Enroll Now
                                </Button>
                            )}

                            <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    <span>Verified Certification</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    <span>Full Lifetime Access</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
