import { NextRequest, NextResponse } from 'next/server';
import { compileCode } from '@/lib/compiler';

export async function POST(request: NextRequest) {
    try {
        const { language, code, input, expectedOutput } = await request.json();

        // Validation
        if (!language || !code) {
            return NextResponse.json(
                { error: 'Language and code are required' },
                { status: 400 }
            );
        }

        const result = await compileCode({
            language,
            code,
            input,
            expectedOutput,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Compile error:', error);
        return NextResponse.json(
            {
                output: '',
                status: 'Error',
                time: 'N/A',
                memory: 'N/A',
                error: error.message || 'Failed to compile code'
            },
            { status: 500 }
        );
    }
}
