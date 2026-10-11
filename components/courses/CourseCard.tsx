import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { BookOpen, Clock, BarChart3, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface CourseCardProps {
    course: {
        id: string;
        title: string;
        description: string;
        difficulty: string;
        language: string;
        modules: any[];
    };
    isEnrolled?: boolean;
}

export default function CourseCard({ course, isEnrolled }: CourseCardProps) {
    const lessonCount = course.modules?.reduce((acc, mod) => acc + (mod.lessons || 0), 0) || 0;

    return (
        <Card hover className="flex flex-col h-full overflow-hidden group">
            <div className="relative h-40 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-primary-500/20 to-indigo-600/20 flex items-center justify-center border border-white/10">
                <div className="absolute top-3 right-3 px-2 py-1 glass rounded-md text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                    {course.difficulty}
                </div>
                <BookOpen className="w-16 h-16 text-primary-500 opacity-50 group-hover:scale-110 transition-transform duration-500" />
            </div>

            <div className="flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors uppercase tracking-tight line-clamp-1">
                        {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {course.description}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-100 dark:border-dark-700/50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{lessonCount} Lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <BarChart3 className="w-3 h-3" />
                        <span className="capitalize">{course.language}</span>
                    </div>
                </div>

                <Link href={`/courses/${course.id}`} className="mt-auto">
                    <Button variant={isEnrolled ? "secondary" : "primary"} className="w-full flex items-center justify-center gap-2">
                        {isEnrolled ? "Continue Learning" : "View Details"}
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </Card>
    );
}
