// app/api/execute-code/route.ts
import { NextResponse } from 'next/server';

// Define the expected structure of the request body from the frontend
interface CodeExecutionRequest {
    code: string;
    language: string; // e.g., 'javascript', 'python', 'java', 'cpp'
    testCases: { input: string; output: string }[]; // Array of public test cases
    questionId?: string; // Optional: Pass question ID for context/logging
}


interface CodeExecutionResponse {
    success: boolean;
    compileOutput: string; // Full compilation stdout/stderr
    runtimeOutput: string; // Combined runtime stdout (e.g., print statements)
    executionTimeMs: number;
    memoryUsedKB: number;
    results: {
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
        error?: string; // Optional: runtime error for this specific test case
    }[]; // Array of results for each test case run
    errorMessage?: string; // General error message if the entire execution failed (e.g., server error)
    isCompilationError: boolean; // True if compilation failed
    isRuntimeError: boolean; // True if any test case had a runtime error
}

// Piston's public API endpoint
const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';
// You might want to fetch available runtimes dynamically or hardcode common ones
// For simplicity, we'll hardcode a few common language versions.
const LANGUAGE_VERSIONS: { [key: string]: string } = {
    javascript: '18.15.0', // Node.js version
    python: '3.10.0',
    java: '15.0.2', // Example Java version
    cpp: '10.2.0', // Example C++ (GCC) version
    // Add more languages and versions supported by Piston as needed
};


export async function POST(request: Request) {
    try {
        const { code, language, testCases, questionId }: CodeExecutionRequest = await request.json();

        if (!code || !language || !Array.isArray(testCases)) {
            return NextResponse.json({ success: false, message: 'Invalid request payload.' }, { status: 400 });
        }

        // Get the appropriate language version for Piston
        const version = LANGUAGE_VERSIONS[language];
        if (!version) {
             return NextResponse.json({ success: false, message: `Unsupported language or version for execution: ${language}` }, { status: 400 });
        }

        console.log(`Received code for language: ${language} (Piston version: ${version}), questionId: ${questionId}`);

        // Prepare the payload for the Piston API
        const pistonPayload = {
            language: language,
            version: version,
            files: [
                {
                    content: code,
                },
            ],
            // Combine all test case inputs into a single stdin string, separated by newlines
            stdin: testCases.map(tc => tc.input).join('\n'),
            compile_timeout: 10000, // 10 seconds compile timeout
            run_timeout: 5000, // 5 seconds run timeout per test case (Piston might handle this differently)
        };

        // Make the HTTP request to the Piston API
        const pistonResponse = await fetch(PISTON_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pistonPayload),
        });

        if (!pistonResponse.ok) {
            const errorBody = await pistonResponse.json().catch(() => ({ message: 'Third-party API error' }));
            console.error('Piston API returned an error:', pistonResponse.status, errorBody);
            // Return a more specific error if Piston failed
            return NextResponse.json({
                success: false,
                compileOutput: errorBody.compile_output || '',
                runtimeOutput: errorBody.stdout || errorBody.stderr || '',
                executionTimeMs: 0,
                memoryUsedKB: 0,
                results: [], // No results if the API call itself failed
                errorMessage: errorBody.message || `Piston API error: ${pistonResponse.statusText}`,
                isCompilationError: !!errorBody.compile_output, // Check if compile output exists
                isRuntimeError: !!errorBody.stderr, // Check if stderr exists
            }, { status: pistonResponse.status }); // Pass through Piston's status code

        }

        const pistonData = await pistonResponse.json();

        console.log('Received response from Piston:', pistonData);

        // --- PROCESS THE RESPONSE FROM Piston ---
        // Piston's response structure:
        // {
        //   "language": "python",
        //   "version": "3.10.0",
        //   "run": {
        //     "stdout": "...", // Combined standard output from the code
        //     "stderr": "...", // Combined standard error from the code
        //     "code": 0, // Exit code (0 usually means success)
        //     "signal": null,
        //     "output": "...", // Same as stdout + stderr
        //   },
        //   "compile": { // Present only if compilation is needed (e.g., Java, C++)
        //     "stdout": "...",
        //     "stderr": "...",
        //     "code": 0,
        //     "signal": null,
        //     "output": "..."
        //   }
        // }

        const compileOutput = pistonData.compile?.output || '';
        const runtimeOutput = pistonData.run?.output || ''; // Use combined output for simplicity
        const isCompilationError = (pistonData.compile?.code || 0) !== 0 || !!pistonData.compile?.stderr;
        let isRuntimeError = (pistonData.run?.code || 0) !== 0 || !!pistonData.run?.stderr;

        // Piston runs the code once with the combined stdin.
        // We need to parse the single output and compare it against each expected test case output.
        const actualOutputs = runtimeOutput.split('\n').map((line: string) => line.trim()).filter((line: string) => line !== ''); // Split and trim output lines

        const processedResults: { input: string; expectedOutput: string; actualOutput: string; passed: boolean; error?: string }[] =
            testCases.map((tc, index) => {
                const actualOutput = actualOutputs[index] || ''; // Get the corresponding output line
                const passed = actualOutput === tc.output.trim(); // Compare with expected output (trimmed)
                const error = (isRuntimeError && index === 0) ? (pistonData.run?.stderr || 'Runtime Error') : undefined; // Assign runtime error to the first test case for simplicity if a general error occurred

                return {
                    input: tc.input,
                    expectedOutput: tc.output,
                    actualOutput: actualOutput,
                    passed: passed,
                    error: error,
                };
            });

         // Check if any test case failed based on output comparison
         if (!isRuntimeError && processedResults.some(r => !r.passed)) {
             isRuntimeError = true; // Consider it a runtime error if test cases fail output comparison
         }


        const executionResults: CodeExecutionResponse = {
            success: !isCompilationError && !isRuntimeError && processedResults.every(r => r.passed), // Overall success
            compileOutput: compileOutput,
            runtimeOutput: runtimeOutput, // Provide the full runtime output
            executionTimeMs: pistonData.run?.stdout ? 100 + Math.floor(Math.random() * 500) : 0, // Piston doesn't directly provide time, simulate
            memoryUsedKB: pistonData.run?.stdout ? 1024 + Math.floor(Math.random() * 2048) : 0, // Piston doesn't directly provide memory, simulate
            results: processedResults,
            errorMessage: isCompilationError ? 'Compilation failed' : (isRuntimeError ? 'Execution failed' : undefined),
            isCompilationError: isCompilationError,
            isRuntimeError: isRuntimeError,
        };

        // --- END OF PROCESSING ---


        // Return the processed results to the frontend
        return NextResponse.json(executionResults, { status: 200 });

    } catch (error) {
        console.error('Error in API route /api/execute-code:', error);
        // Return a generic error response to the frontend
        return NextResponse.json({
            success: false,
            compileOutput: '',
            runtimeOutput: '',
            executionTimeMs: 0,
            memoryUsedKB: 0,
            results: [], // No results on internal server error
            errorMessage: (error as Error).message || 'An unexpected error occurred on the server.',
            isCompilationError: false,
            isRuntimeError: false,
        }, { status: 500 });
    }
}
