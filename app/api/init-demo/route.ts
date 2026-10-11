import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Check if demo users already exist
        const existingUsers = db.getAll('users');
        if (existingUsers.length > 0) {
            return NextResponse.json({ message: 'Demo data already exists' });
        }

        // Create demo users
        const demoPassword = await hashPassword('password');

        const demoUsers = [
            {
                email: 'student@demo.com',
                password: demoPassword,
                name: 'Demo Student',
                role: 'student',
            },
            {
                email: 'teacher@demo.com',
                password: demoPassword,
                name: 'Demo Teacher',
                role: 'teacher',
            },
            {
                email: 'admin@demo.com',
                password: demoPassword,
                name: 'Demo Admin',
                role: 'admin',
            },
        ];

        for (const user of demoUsers) {
            db.create('users', user);
        }

        // Create demo courses
        const demoCourses = [
            {
                title: 'Python Fundamentals',
                description: 'Learn the basics of Python programming',
                difficulty: 'Beginner',
                language: 'python',
                modules: [
                    { title: 'Introduction to Python', lessons: 5 },
                    { title: 'Variables and Data Types', lessons: 4 },
                    { title: 'Control Flow', lessons: 6 },
                ],
            },
            {
                title: 'Data Structures in Java',
                description: 'Master essential data structures using Java',
                difficulty: 'Intermediate',
                language: 'java',
                modules: [
                    { title: 'Arrays and Lists', lessons: 5 },
                    { title: 'Stacks and Queues', lessons: 4 },
                    { title: 'Trees and Graphs', lessons: 7 },
                ],
            },
            {
                title: 'JavaScript Mastery',
                description: 'Become proficient in modern JavaScript',
                difficulty: 'Advanced',
                language: 'javascript',
                modules: [
                    { title: 'ES6+ Features', lessons: 6 },
                    { title: 'Async Programming', lessons: 5 },
                    { title: 'DOM Manipulation', lessons: 4 },
                ],
            },
        ];

        for (const course of demoCourses) {
            db.create('courses', course);
        }

        return NextResponse.json({
            message: 'Demo data created successfully',
            users: demoUsers.length,
            courses: demoCourses.length,
        });
    } catch (error: any) {
        console.error('Init demo error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize demo data' },
            { status: 500 }
        );
    }
}
