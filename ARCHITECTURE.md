# Architecture: Eligibility Pre-Verification Prototype

## Current System

The repository is a static, client-side prototype. `index.html` contains the
markup, styles, behavior, synthetic data, simulated verification, and simulated
subsidy calculation. There is no production service boundary behind it.

```text
Browser
  -> index.html
     -> in-memory application state
     -> localStorage demo persistence
     -> simulated verification and subsidy results
```

## Responsibilities

### `index.html`

- Renders the guided consumer flow, results, dashboard, and shopping placeholder.
- Maintains the current application state in JavaScript.
- Validates form input and conditionally determines demo document slots.
- Saves resumable state to `localStorage['stride-preverify-v1']`.
- Generates non-authoritative verification and subsidy results.
- Marks future integration boundaries with `INTEGRATION POINT` comments.

### Browser storage

Browser storage contains demo form state and file metadata only. Uploaded file
contents are not persisted. Storage is device- and browser-specific and is not a
production persistence strategy.

### Hosting

GitHub Pages serves the static file from `main`. There is no separate preview,
staging, or production environment model in the repository.

## Current Data Flow

1. The user selects a new or returning path.
2. Returning users receive a synthetic member snapshot; new users begin blank.
3. Each step updates one client-side state object and saves it locally.
4. The review screen renders the collected state and document metadata.
5. Submission runs a timed simulation that randomly chooses a result.
6. The result and dashboard display a simplified subsidy estimate or next step.

No data leaves the browser as part of the application flow. The Google Fonts
request is optional presentation infrastructure and not an application-data
integration.

## Security and Privacy Boundary

The current prototype is not approved to handle real consumer information.
Client-side storage, synthetic identities, and file-name-only upload behavior
are demo conveniences, not security controls suitable for production.

Do not add real document upload, identity data, tax data, immigration data,
health coverage data, authentication, or external analytics without an approved
architecture and privacy review.

## Production Integration Boundaries

The prototype identifies possible future boundaries for:

- authentication and consumer identity;
- member or application data prefill;
- CMS/Exchange or EDE verification submission;
- income, citizenship/immigration, residence, and coverage verification;
- secure document upload and evidence review;
- asynchronous verification-status events;
- plan-shopping handoff; and
- privacy-safe product analytics.

These are boundaries for discovery, not selected vendors or approved APIs.

## Reliability Concerns for a Future System

A production design must explicitly handle:

- delayed, duplicate, and out-of-order status events;
- submission retry and idempotency;
- status disagreement between the verification service and EDE;
- partial household verification;
- expired evidence and changed consumer information;
- document malware scanning, retention, access, and deletion;
- interrupted handoffs between verification and shopping;
- unavailable external data sources; and
- audit trails that exclude unnecessary sensitive values.

## Unresolved Architecture Decisions

No production stack has been selected. Before implementation, decide and record
as appropriate:

- whether the module is a separately deployed application, embedded package, or
  both;
- the authoritative verification-status owner and event contract;
- authentication and assisted-consumer authorization;
- secure evidence storage and review ownership;
- persistence and audit requirements;
- the EDE handoff contract;
- observability and privacy-safe analytics; and
- environment and deployment architecture.

Consequential choices belong in `docs/decisions/`. The next step should be a
product specification for the status lifecycle, not a technology selection.
