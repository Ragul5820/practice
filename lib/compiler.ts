import axios from 'axios';
import { exec } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Using Judge0 CE (Community Edition) API
const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

// Language IDs for Judge0
export const LANGUAGE_IDS: { [key: string]: number } = {
    python: 71,      // Python 3
    javascript: 63,  // JavaScript (Node.js)
    java: 62,        // Java
    cpp: 54,         // C++ (GCC 9.2.0)
    c: 50,           // C (GCC 9.2.0)
};

export interface CompileRequest {
    language: string;
    code: string;
    input?: string;
    expectedOutput?: string;
}

export interface CompileResult {
    output: string;
    status: string;
    time: string;
    memory: string;
    error?: string;
    passed?: boolean;
}

// Convert a Windows absolute path to MSYS2 bash-style /c/... path
function winToMsys(winPath: string): string {
    // e.g. C:\Users\foo\bar.c -> /c/Users/foo/bar.c
    return winPath.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, drive) => `/${drive.toLowerCase()}`);
}

// Execute code locally using installed compilers/interpreters
export async function executeLocally(language: string, code: string, input: string = ''): Promise<CompileResult> {
    const startTime = Date.now();
    const tempDir = path.join(process.cwd(), 'tmp_execution');
    const sessionId = crypto.randomUUID();
    
    // Ensure temp dir exists
    const fs = require('fs');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    let fileName = '';
    let command = '';

    try {
        if (language === 'python') {
            fileName = path.join(tempDir, `${sessionId}.py`);
            writeFileSync(fileName, code);
            command = `python "${fileName}"`;
        } else if (language === 'javascript') {
            fileName = path.join(tempDir, `${sessionId}.js`);
            writeFileSync(fileName, code);
            command = `node "${fileName}"`;
        } else if (language === 'java') {
            // Java requires specific class name handling
            fileName = path.join(tempDir, `Main_${sessionId.replace(/-/g, '')}.java`);
            const className = path.basename(fileName, '.java');
            let javaCode = code;
            if (javaCode.includes('class ')) {
               javaCode = javaCode.replace(/(public\s+)?class\s+\w+/, `public class ${className}`);
            } else {
               javaCode = `public class ${className} { public static void main(String[] args) {\n${code}\n} }`;
            }
            
            writeFileSync(fileName, javaCode);
            command = `javac "${fileName}" && java -cp "${tempDir}" ${className}`;
        } else if (language === 'cpp') {
            fileName = path.join(tempDir, `${sessionId}.cpp`);
            const exeName = path.join(tempDir, `${sessionId}.exe`);
            writeFileSync(fileName, code);
            const msysFile = winToMsys(fileName);
            const msysExe = winToMsys(exeName);
            const inputPipe = input ? `echo '${input.replace(/'/g, "'\\''")}' | ` : '';
            command = `C:\\msys64\\usr\\bin\\bash.exe -lc "export PATH=/ucrt64/bin:$PATH && g++ '${msysFile}' -o '${msysExe}' && ${inputPipe}'${msysExe}'"` ;
        } else if (language === 'c') {
            fileName = path.join(tempDir, `${sessionId}.c`);
            const exeName = path.join(tempDir, `${sessionId}.exe`);
            writeFileSync(fileName, code);
            const msysFile = winToMsys(fileName);
            const msysExe = winToMsys(exeName);
            const inputPipe = input ? `echo '${input.replace(/'/g, "'\\''")}' | ` : '';
            command = `C:\\msys64\\usr\\bin\\bash.exe -lc "export PATH=/ucrt64/bin:$PATH && gcc '${msysFile}' -o '${msysExe}' && ${inputPipe}'${msysExe}'"` ;
        } else {
            throw new Error(`Local execution not supported for ${language}`);
        }

        return new Promise((resolve) => {
            const childProcess = exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
                const executionTime = Date.now() - startTime;
                
                console.log(`[Local Execution] Command: ${command} finished in ${executionTime}ms`);
                if (error) console.error(`[Local Execution] Error:`, error.message);

                // Cleanup files
                try {
                    if (fileName && fs.existsSync(fileName)) unlinkSync(fileName);
                    if (language === 'java') {
                        const classFile = fileName.replace('.java', '.class');
                        if (fs.existsSync(classFile)) unlinkSync(classFile);
                    }
                    if (language === 'cpp' || language === 'c') {
                        const exeFile = fileName.replace(/\.(cpp|c)$/, '.exe');
                        if (fs.existsSync(exeFile)) unlinkSync(exeFile);
                    }
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError);
                }

                if (error && (error.killed || error.signal === 'SIGTERM')) {
                    return resolve({
                        output: stdout,
                        status: 'Time Limit Exceeded',
                        time: '10s',
                        memory: 'N/A',
                        error: 'Execution timed out (10s)',
                    });
                }

                resolve({
                    output: stdout.trim(),
                    status: error ? 'Runtime Error' : 'Accepted',
                    time: `${executionTime}ms`,
                    memory: 'N/A',
                    error: stderr || (error ? error.message : undefined),
                });
            });

            if (input && childProcess.stdin) {
                childProcess.stdin.write(input);
                childProcess.stdin.end();
            } else if (childProcess.stdin) {
                // Always end stdin to avoid hangs on some interpreters
                childProcess.stdin.end();
            }
        });
    } catch (err: any) {
        return {
            output: '',
            status: 'Error',
            time: 'N/A',
            memory: 'N/A',
            error: err.message,
        };
    }
}

// Compile and run code
export async function compileCode(request: CompileRequest): Promise<CompileResult> {
    // Check for supported local languages first to ensure "proper" solving
    const localSupported = ['python', 'javascript', 'java', 'cpp', 'c'];
    
    if (!RAPIDAPI_KEY && localSupported.includes(request.language)) {
        console.log(`[Compiler] Using local engine for ${request.language}`);
        return executeLocally(request.language, request.code, request.input);
    }

    try {
        const languageId = LANGUAGE_IDS[request.language];

        if (!languageId) {
            throw new Error(`Unsupported language: ${request.language}`);
        }

        // Create submission
        const submissionResponse = await axios.post(
            `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
            {
                source_code: request.code,
                language_id: languageId,
                stdin: request.input || '',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                },
                timeout: 5000, // 5 second timeout
            }
        );

        const result = submissionResponse.data;

        // Parse result
        const output = result.stdout || result.stderr || result.compile_output || '';
        const status = result.status.description;
        const time = result.time ? `${result.time}s` : 'N/A';
        const memory = result.memory ? `${result.memory} KB` : 'N/A';

        // Check if output matches expected output (for test cases)
        let passed = undefined;
        if (request.expectedOutput !== undefined) {
            passed = output.trim() === request.expectedOutput.trim();
        }

        return {
            output,
            status,
            time,
            memory,
            error: result.stderr || result.compile_output || undefined,
            passed,
        };
    } catch (error: any) {
        console.error('[Compiler] API Error:', error.message);
        
        // If it's an auth error (401), network error, or timeout, fallback to local engine
        const localSupported = ['python', 'javascript', 'java', 'cpp', 'c'];
        if ((error.response?.status === 401 || !error.response || error.code === 'ECONNABORTED') && 
            localSupported.includes(request.language)) {
            console.log('[Compiler] Triggering fallback local execution due to API error');
            return executeLocally(request.language, request.code, request.input);
        }

        return {
            output: '',
            status: 'Error',
            time: 'N/A',
            memory: 'N/A',
            error: error.message || 'Failed to compile code',
        };
    }
}

