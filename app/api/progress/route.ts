import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

        const url = new URL(req.url);
        const courseId = url.searchParams.get('courseId');

        const progressList = db.find('progress', { userId: decoded.userId });

        if (courseId) {
            const courseProgress = progressList.find((p: any) => p.courseId === courseId);
            return NextResponse.json(courseProgress || { userId: decoded.userId, courseId, completedItems: [], lastPosition: null });
        }

        return NextResponse.json(progressList);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
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
        const { courseId, completedItem, lastPosition } = body;

        if (!courseId) {
            return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
        }

        const progressList = db.find('progress', { userId: decoded.userId, courseId });
        let progressRecord = progressList[0];

        if (progressRecord) {
            let completedItems = progressRecord.completedItems || [];
            if (completedItem && !completedItems.includes(completedItem)) {
                completedItems = [...completedItems, completedItem];
            }
            const updates: any = { completedItems };
            if (lastPosition) {
                updates.lastPosition = lastPosition;
            }
            progressRecord = db.update('progress', progressRecord.id, updates);
        } else {
            const newProgress = {
                userId: decoded.userId,
                courseId,
                completedItems: completedItem ? [completedItem] : [],
                lastPosition: lastPosition || null,
            };
            progressRecord = db.create('progress', newProgress);
        }

        return NextResponse.json(progressRecord);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }
}
