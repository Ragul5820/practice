import { NextRequest, NextResponse } from 'next/server';
import { getCollection, addToCollection } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const enrollments = await getCollection('enrollments');
        const userEnrollments = enrollments.filter((e: any) => e.userId === decoded.userId);

        const courses = await getCollection('courses');
        const userCourses = userEnrollments.map((e: any) => {
            const course = courses.find((c: any) => c.id === e.courseId);
            return { ...course, enrollmentId: e.id, enrolledAt: e.enrolledAt };
        });

        return NextResponse.json(userCourses);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { courseId } = body;

        if (!courseId) {
            return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
        }

        const enrollments = await getCollection('enrollments');
        const existing = enrollments.find((e: any) => e.userId === decoded.userId && e.courseId === courseId);

        if (existing) {
            return NextResponse.json({ error: 'Already enrolled' }, { status: 400 });
        }

        const newEnrollment = {
            userId: decoded.userId,
            courseId,
            enrolledAt: new Date().toISOString(),
            status: 'active',
        };

        const result = await addToCollection('enrollments', newEnrollment);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to enroll in course' }, { status: 500 });
    }
}
