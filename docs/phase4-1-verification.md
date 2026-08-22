# Phase 4.1 verification

This branch hardens public catalog freshness and performance while preserving NJ125 as the system of record. Catalog pagination/filtering remains server-side, inventory refreshes on interval and browser focus, failure states support retry, and public images reserve layout dimensions with explicit loading, decoding, and fetch-priority behavior.

Temporary NJ125 lockfile-handoff files and workflows are not part of the branch tip. The only workflow under `.github/workflows/` is the permanent RenoLeads verification workflow, which runs typecheck, contract and architecture checks, production build, and the live Firebase/Supabase production smoke suite.

Authenticated positive `staff-api` integration testing requires a real Google-backed authorized Admin or Agent bearer token and is intentionally not simulated. The unauthenticated staff rejection contract remains part of the production smoke suite.
