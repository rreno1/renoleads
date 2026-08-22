# RenoLeads

Public land-lot discovery and inquiry frontend for NJ125 Corporation.

## Architecture

RenoLeads and the NJ125 internal operations application are separate frontends and separate deployments using one dedicated Supabase backend as the source of truth.

```text
RenoLeads public frontend
        ↓
NJ125 Supabase Edge API
        ↓
Supabase PostgreSQL / Storage
        ↑
NJ125 internal operations frontend
```

RenoLeads does **not** access NJ125 database tables directly. The browser uses only the public Edge API contract.

## Phase 2 integration

Current branch: `feat/shared-supabase-backend`

Public backend endpoint:

```text
https://dnsgfsgpopniqeuqfslp.supabase.co/functions/v1/api
```

Supported RenoLeads actions:

- `public-properties` — returns only NJ125 lots that are both published and currently available.
- `submit-property-inquiry` — creates the public inquiry and lead atomically after validation, consent recording, rate limiting and deduplication.

RenoLeads never receives internal inquiry IDs or lead IDs. Successful submissions return an opaque public request reference.

## Data ownership

NJ125 Supabase is authoritative for:

- projects, phases, blocks and lots
- public property media
- inquiries and leads
- staff assignment and internal CRM state
- clients, reservations, sales, payments and documents

RenoLeads stores no separate property database and has no mock/fallback listings.

Browser storage is limited to non-PII convenience state:

- saved lot identifiers
- recently viewed lot identifiers
- first-touch landing/referrer/UTM attribution for the current session

Inquiry PII is never buffered in local storage when a submission fails.

## Runtime

The site is intentionally plain HTML, CSS and JavaScript. No Supabase secret or service-role key is present in browser code. The public browser calls the Edge API directly over HTTPS.

Important files:

```text
js/config.js           Public RenoLeads configuration
js/nj125-api.js        NJ125 public Edge API adapter
js/properties.js       Published inventory renderer and filters
js/property-details.js Property detail renderer
js/inquiry-form.js     Inquiry submission flow
js/app.js              Shared navigation and non-PII local retention
js/analytics.js        Local funnel event bridge; no Firebase Analytics
privacy.html           Privacy Notice version 2026-08-22
firebase.json          Firebase Hosting-only target for Phase 3
```

## Verification

Run the zero-dependency Phase 2 contract check with Node:

```bash
node scripts/phase2-check.mjs
```

The check rejects legacy Firebase runtime/backend references, mock property data, PII inquiry buffering, and missing NJ125 public-contract fields.

## Deployment state

During Phase 2, the existing public deployment remains GitHub Pages:

```text
https://rreno1.github.io/renoleads/
```

Phase 3 will migrate the public frontend to Firebase Hosting. `firebase.json` is already hosting-only, but Phase 2 does not require or claim that Firebase Hosting migration has occurred.

## Security boundary

- Public reads return only sanitized published/available property fields.
- Inquiry request bodies are limited and validated server-side.
- Consent version and source attribution are persisted with the inquiry.
- Public intake has server-side rate limiting and deduplication.
- RenoLeads sends no browser credential or secret to the Edge API.
- Internal NJ125 actions remain authenticated and role-authorized separately from the public RenoLeads actions.

## Local development

Serve the repository over a local HTTP server so browser fetch/CORS behavior matches production more closely, for example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/`. The NJ125 Edge API explicitly permits localhost development origins.
