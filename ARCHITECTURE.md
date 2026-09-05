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
- Owns a DOM-independent verification controller that normalizes saved state
  and applies deterministic submission, recovery, and simulated-event changes.
- Generates non-authoritative verification and subsidy results.
- Marks future integration boundaries with `INTEGRATION POINT` comments.

### Browser storage

Browser storage contains demo form state, lifecycle timestamps, and file
metadata only. Both initial uploads and replacement drafts store `{name, size}`;
uploaded file contents are neither read nor persisted. Storage is device- and
browser-specific and is not a production persistence strategy.

### Hosting

GitHub Pages serves the static file from `main`. There is no separate preview,
staging, or production environment model in the repository.

## Current Data Flow

1. The user selects a new or returning path.
2. Returning users receive a synthetic member snapshot; new users begin blank.
3. Each step updates one client-side state object and saves it locally.
4. The review screen renders the collected state and document metadata.
5. A scenario selected before submission determines the simulated outcome:
   verified, pending then verified, document correction, manual review, or
   service unavailable. The selection is locked once `submittedAt` is present.
6. The shared verification controller handles explicit recovery actions:
   replacement submission, manual-review request, and service retry. Each enters
   pending review; the separate demo event control advances that review.
7. Simulated events use the current scenario and review phase, without random
   outcomes. Repeated or inapplicable actions are ignored, and late callbacks
   cannot overwrite a restarted case or navigate away from the current view.
8. The result, dashboard, and shopping placeholder share one status vocabulary
   and derive their price labels (Estimated or Full price) from it.

No data leaves the browser as part of the application flow. The Google Fonts
request is optional presentation infrastructure and not an application-data
integration.

## Verification State and Compatibility

The existing `S` object and `stride-preverify-v1` storage key remain in use. The
controller exposes `normalize`, `submit`, `advance`, `stageReplacement`,
`submitReplacement`, `requestManualReview`, and `retryService`. Transition methods
mutate the passed state and return whether a transition occurred; staging returns
an error string or `null`. Callers supply ISO timestamps so lifecycle behavior
can be tested without DOM or timer dependencies.

The optional lifecycle fields extend existing `result`, `pendingSince`,
`verifiedAt`, and `resultUpdatedAt` state:

| Field | Purpose |
| --- | --- |
| `demoScenario` | One of `verified`, `pending_verified`, `document_correction`, `manual_review`, `service_unavailable`; defaults to `verified`. |
| `submittedAt` | Initial receipt and scenario-lock boundary. |
| `reviewKind` | Identifies the current pending review phase. |
| `documentRequest` | Stable evidence request with `key`, `requestedAt`, `replacement`, and `receivedAt`. |
| `manualReviewRequestedAt` | Saved receipt for the single manual-review request. |
| `serviceUnavailableAt` | Technical failure timestamp, separate from a consumer result. |
| `serviceRetried` | Records that the service recovery path was started. |

`documentRequest.key` identifies the requested document slot. Its associated
label and scope identify the household or applicant fact under review. The
request remains the same through selection, receipt, and later review. A staged
`replacement` contains filename and size only; initial upload metadata changes
only on explicit replacement submission. `receivedAt` records that submission,
not merely file selection.

While the service is unavailable, `result` remains `null`; the unavailable
timestamp distinguishes that case from a case that has not been submitted.
Retry transitions to `pending`, and a later simulated event transitions to
`verified`. No technical failure is mapped to `unable`.

Normalization fills missing optional fields in older saved walkthroughs while
preserving their answers, uploads, and existing result. Legacy `pending`, `docs`,
and `unable` cases receive the lifecycle context needed to resume and recover;
legacy submitted results remain locked. Starting a new verification clears the
previous case lifecycle but keeps the selected scenario. No storage migration,
new storage key, or consumer reset is required to load an older walkthrough.

## Verification

`node --test tests/verification.test.cjs` runs the dependency-free lifecycle
tests against the controller in `index.html`. Node is a development-only test
runtime; serving the prototype still needs no package manager or build step.
Browser verification covers the rendered recovery actions, saved receipts,
reload/resume, presenter controls, navigation, responsive layout, and console.

## Security and Privacy Boundary

The current prototype is not approved to handle real consumer information.
Client-side storage, synthetic identities, and metadata-only upload behavior
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

Consequential choices belong in `docs/decisions/`. The prototype lifecycle is
specified in `docs/specs/pev-status-lifecycle.md`; its deterministic transitions
do not establish a production event contract or a technology selection.
