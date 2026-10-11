import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'teacher')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { title, description, timeLimit, points, questions } = await req.json();

        if (!title || !questions) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const assessment = db.create('assessments', {
            title,
            description,
            timeLimit: parseInt(timeLimit) || 30,
            points: parseInt(points) || 100,
            questions,
            createdBy: decoded.userId
        });

        return NextResponse.json(assessment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
