---
name: test
description: Run all backend and frontend checks
disable-model-invocation: true
allowed-tools: Bash
---

Run all project checks in parallel where possible.

1. Run these in parallel:
   - Backend integration tests: `cd backend && dotnet test Budget.IntegrationTests --verbosity quiet`
   - Frontend type-check: `cd frontend && npx tsc --noEmit`
   - Frontend lint: `cd frontend && npm run lint`

2. Report results for each. If any fail, show the relevant error output.
