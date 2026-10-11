import { NextRequest, NextResponse } from 'next/server';
import { getCollection, addToCollection } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const courses = await getCollection('courses');
        return NextResponse.json(courses);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
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
        if (!decoded || (decoded.role !== 'teacher' && decoded.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }
        const body = await req.json();
        const { title, description, difficulty, language, modules, category, thumbnail } = body;

        if (!title || !description || !difficulty || !language) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newCourse = {
            title,
            description,
            difficulty,
            language,
            category: category || 'General',
            thumbnail: thumbnail || '',
            modules: modules || [],
            createdAt: new Date().toISOString(),
        };

        const result = await addToCollection('courses', newCourse);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
    }
}
