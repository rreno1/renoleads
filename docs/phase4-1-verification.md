# Phase 4.1 verification

This branch hardens public catalog freshness and performance while preserving NJ125 as the system of record. The temporary lockfile workflow in this branch is used only to generate the deterministic NJ125 npm lockfile from NJ125's non-secret package manifest; it will be removed before merge.
