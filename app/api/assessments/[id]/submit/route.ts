import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { compileCode } from '@/lib/compiler';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const assessment = db.getById('assessments', id);
        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        const { answers } = await req.json(); // answers: (number | string)[]

        // Calculate score
        const questions = assessment.questions || [];
        let correctCount = 0;
        const breakdown = [];

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const answer = answers[i];

            if (q.type === 'programming') {
                const sampleCases = q.sampleTestCases || [];
                const hiddenCases = q.hiddenTestCases || [];
                const allTestCases = [
                    ...sampleCases.map((tc: { input: string; output: string }) => ({ ...tc, isHidden: false })),
                    ...hiddenCases.map((tc: { input: string; output: string }) => ({ ...tc, isHidden: true }))
                ];

                let testsPassed = 0;
                const testResults = [];

                if (allTestCases.length > 0) {
                    for (const tc of allTestCases) {
                        const result = await compileCode({
                            language: q.language || assessment.language || 'python',
                            code: answer as string,
                            input: tc.input,
                            expectedOutput: tc.output,
                        });

                        const isPassed = result.output.trim() === tc.output.trim();
                        if (isPassed) testsPassed++;
                        
                        testResults.push({
                            input: tc.isHidden ? '***' : tc.input,
                            expectedOutput: tc.isHidden ? '***' : tc.output,
                            actualOutput: tc.isHidden ? (isPassed ? '***' : 'Output Mismatch') : result.output,
                            isPassed,
                            isHidden: tc.isHidden
                        });
                    }
                    const isFullyCorrect = testsPassed === allTestCases.length;
                    if (isFullyCorrect) correctCount++;
                    breakdown.push({
                        question: q.title || q.question,
                        type: 'programming',
                        isCorrect: isFullyCorrect,
                        testsPassed,
                        totalTests: allTestCases.length,
                        testResults
                    });
                } else {
                    // No test cases, mark as correct if any code provided
                    const isCorrect = !!answer && (answer as string).length > 10;
                    if (isCorrect) correctCount++;
                    breakdown.push({
                        question: q.title || q.question,
                        type: 'programming',
                        isCorrect
                    });
                }
            } else {
                // Default to MCQ
                const isCorrect = answer === q.correctOption;
                if (isCorrect) correctCount++;
                breakdown.push({
                    question: q.question,
                    type: 'mcq',
                    selectedOption: answer,
                    correctOption: q.correctOption,
                    isCorrect,
                });
            }
        }

        const score = questions.length > 0
            ? Math.round((correctCount / questions.length) * (assessment.points || 100))
            : 0;
        const percentage = questions.length > 0
            ? Math.round((correctCount / questions.length) * 100)
            : 0;

        // Save submission
        const submission = db.create('submissions', {
            assessmentId: id,
            userId: decoded.userId,
            answers,
            score,
            percentage,
            correct: correctCount,
            total: questions.length,
            breakdown,
            assessmentTitle: assessment.title,
            submittedAt: new Date().toISOString()
        });

        return NextResponse.json({
            submission,
            score,
            percentage,
            correct: correctCount,
            total: questions.length,
            breakdown,
        });
    } catch (error) {
        console.error('Submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
