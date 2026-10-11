'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Trophy, Clock, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function StudentAssessmentsPage() {
    const { user } = useAuth();
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const res = await fetch('/api/assessments');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAssessments(data);
                }
            } catch (error) {
                console.error('Failed to fetch assessments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssessments();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gradient mb-2">My Assessments</h1>
                <p className="text-gray-600 dark:text-gray-400">Test your knowledge and earn achievements</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 glass rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : assessments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assessments.map((assessment: any) => (
                        <Card key={assessment.id} hover className="flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-primary-500/10 rounded-xl">
                                    <Trophy className="w-6 h-6 text-primary-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg truncate">{assessment.title}</h3>
                                    <p className="text-sm text-gray-500">{assessment.courseTitle || 'Coding Challenge'}</p>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-6 flex-1">
                                {assessment.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-100 dark:border-dark-700/50">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{assessment.timeLimit || 30} mins</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    <span>{assessment.points || 100} pts</span>
                                </div>
                            </div>

                            <Link href={`/assessments/${assessment.id}`}>
                                <Button className="w-full flex items-center justify-center gap-2">
                                    Start Assessment
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 glass rounded-2xl">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-bold mb-2">No assessments available</h2>
                    <p className="text-gray-600 dark:text-gray-400">Check back later for new challenges</p>
                </div>
            )}
        </div>
    );
}
