import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const submissions = db.getAll('submissions');
        const users = db.getAll('users');

        // Aggregate scores per user
        const scoreMap: Record<string, { totalScore: number; count: number; name: string; email: string }> = {};
        for (const sub of submissions) {
            const u = users.find((u: any) => u.id === sub.userId);
            if (!u || u.role !== 'student') continue;
            if (!scoreMap[sub.userId]) {
                scoreMap[sub.userId] = { totalScore: 0, count: 0, name: u.name, email: u.email };
            }
            scoreMap[sub.userId].totalScore += sub.score || 0;
            scoreMap[sub.userId].count += 1;
        }

        const leaderboard = Object.entries(scoreMap)
            .map(([userId, data]) => ({
                userId,
                name: data.name,
                email: data.email,
                totalScore: data.totalScore,
                assessmentsTaken: data.count,
                avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
            }))
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 20);

        return NextResponse.json(leaderboard);
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
