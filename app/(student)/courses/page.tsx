'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import CourseCard from '@/components/courses/CourseCard';
import Input from '@/components/ui/Input';
import { Search, Filter, BookOpen } from 'lucide-react';

export default function CoursesPage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch all courses
                const coursesRes = await fetch('/api/courses');
                const coursesData = await coursesRes.json();
                setCourses(coursesData);

                // Fetch student's enrollments to check which they already have
                if (user) {
                    const enrollRes = await fetch('/api/enrollments', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const enrollData = await enrollRes.json();
                    if (Array.isArray(enrollData)) {
                        setEnrolledIds(enrollData.map((e: any) => e.id));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const filteredCourses = courses.filter((course: any) => {
        const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
            course.description.toLowerCase().includes(search.toLowerCase());
        const matchesDifficulty = difficulty === 'all' || course.difficulty.toLowerCase() === difficulty.toLowerCase();
        return matchesSearch && matchesDifficulty;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient mb-2">Explore Courses</h1>
                    <p className="text-gray-600 dark:text-gray-400">Master new skills with our expert-led tracks</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
                        />
                    </div>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-dark-600"
                    >
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-80 glass rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course: any) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            isEnrolled={enrolledIds.includes(course.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 glass rounded-2xl">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-bold mb-2">No courses found</h2>
                    <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
