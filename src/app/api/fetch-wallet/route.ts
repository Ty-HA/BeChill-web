import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import stripAnsi from 'strip-ansi';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
  }

  const sonarwatchPath = '/Users/tyha/Projects/api/sonarwatch-backend';

  return new Promise((resolve) => {
    const fetcher = spawn(
      'npx',
      ['nx', 'run', 'plugins:run-fetcher', 'wallet-tokens-solana', address],
      {
        cwd: sonarwatchPath,
        shell: true,
      }
    );

    let output = '';
    let errorOutput = '';

    fetcher.stdout.on('data', (data) => {
      output += data.toString();
    });

    fetcher.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    fetcher.on('close', () => {
      try {
        const cleanOutput = stripAnsi(output);

        const startIndex = cleanOutput.indexOf('[');
        const endIndex = cleanOutput.lastIndexOf(']') + 1;

        if (startIndex === -1 || endIndex === -1) {
          throw new Error('No JSON array found in output');
        }

        let jsonLike = cleanOutput.substring(startIndex, endIndex);

        // Remplacements pour corriger les erreurs de JSON :
        jsonLike = jsonLike
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // clé non-quotée => "clé":
          .replace(/'([^']*)'/g, (_, p1) => `"${p1.replace(/"/g, '\\"')}"`) // quotes simples => doubles
          .replace(/\bundefined\b/g, 'null'); // undefined => null

        const parsed = JSON.parse(jsonLike);
        resolve(NextResponse.json(parsed));
      } catch (e) {
        resolve(
          NextResponse.json(
            {
              error: 'Invalid output after cleaning',
              errorDetail: (e as Error).message,
              rawOutput: stripAnsi(output),
              stderr: errorOutput,
            },
            { status: 500 }
          )
        );
      }
    });
  });
}
