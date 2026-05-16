Name: Test-Fix Agent

Description:
This agent runs the repository test suites, attempts safe automated fixes (lint --fix, format, typecheck), and re-runs tests. If failures persist after a small number of attempts, it collects failure outputs and writes a reproducible report for a developer to act on.

Responsibilities:

- Execute workspace tests (`pnpm -r test --if-present`).
- When tests fail, run safe auto-fixers: `pnpm lint --fix`, `pnpm format`, and type-check `pnpm --filter server exec tsc -p tsconfig.json --noEmit`.
- Re-run tests after each automatic fix attempt, up to a retry limit (default 2).
- Save failing outputs to `/agent-output/failures.json` and a human-readable `/agent-output/report.txt` when still failing.
- Exit with non-zero code when failures remain.

Usage:
From the repository root run:

```
pnpm run run-agent
```

Notes:

- The agent does not perform speculative code edits. It limits itself to safe automated fixers and surfaces remaining issues for human review.
