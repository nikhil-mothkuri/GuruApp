# Test-Driven Requirement

## Purpose

Ensure that every code change is validated by automated tests. New features or bug fixes must include tests that reproduce the issue and verify the fix. The test suite is the source of truth for correctness and regression protection.

## Minimum requirements

- Every new feature or bug fix must include one or more automated tests (unit/integration) placed alongside the related module.
- The repository must expose a reproducible command to run all tests: `pnpm -r test --if-present`.
- Tests should be deterministic and idempotent when run locally.

## Agent behavior

An automated agent will:

1. Run the full test suite (`pnpm -r test --if-present`).
2. If tests fail, attempt safe automatic fixes:
   - Run `pnpm lint --fix` to apply lint-based autofixes.
   - Run the repository formatter `pnpm format`.
   - Run server type-check: `pnpm --filter server exec tsc -p tsconfig.json --noEmit`.
3. Re-run tests after each fix attempt (up to 2 retries).
4. If failures remain, collect outputs and write a report under `/agent-output/`.

## How to write tests

- Use existing testing frameworks (Jest in `server`, Vitest/Jest in `client`) and follow repository conventions.
- Keep tests small and focused; mock external services where possible.
- Name tests to clearly indicate intent and failing condition.

## Maintainers

The engineering team owns test quality and the agent harness. The agent is a lightweight helper — humans own any non-trivial fixes.
