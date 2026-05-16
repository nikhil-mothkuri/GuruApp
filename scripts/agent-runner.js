#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

function writeOutput(dir, name, obj) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2));
}

const MAX_ATTEMPTS = 2;
const outDir = path.resolve(process.cwd(), 'agent-output');

async function main() {
  let attempt = 0;
  let lastFailure = null;

  while (attempt <= MAX_ATTEMPTS) {
    console.log(`Attempt ${attempt + 1}: running workspace tests (pnpm -r test)`);
    const test = run('pnpm', ['-r', 'test'], { shell: true });
    if (test.status === 0) {
      console.log('All tests passed.');
      return process.exit(0);
    }

    lastFailure = { attempt: attempt + 1, stdout: test.stdout, stderr: test.stderr };
    console.error('Tests failed on attempt', attempt + 1);
    writeOutput(outDir, `failure-attempt-${attempt + 1}.log`, test.stdout + '\n\n' + test.stderr);

    if (attempt >= MAX_ATTEMPTS) break;

    console.log('Running automated fixers: lint --fix, format, and server typecheck');
    // 1. lint autofix (workspace)
    run('pnpm', ['lint'], { shell: true });
    // 2. format
    run('pnpm', ['format'], { shell: true });
    // 3. server typecheck (best-effort)
    run('pnpm', ['--filter', 'server', 'exec', 'tsc', '-p', 'tsconfig.json', '--noEmit'], { shell: true, cwd: path.join(process.cwd(), 'server') });

    attempt += 1;
    console.log('Re-running tests after fix attempt...');
  }

  // Persist final report
  writeOutput(outDir, 'failures.json', lastFailure || { error: 'unknown' });
  const report = `Tests failed after ${MAX_ATTEMPTS + 1} attempts. See agent-output/failures.json and failure logs.`;
  writeOutput(outDir, 'report.txt', report);
  console.error(report);
  process.exit(2);
}

main().catch((err) => {
  console.error('Agent runner error', err);
  writeOutput(outDir, 'error.json', { message: err.message, stack: err.stack });
  process.exit(3);
});
