# Recovery and Demo Scenarios Implementation Plan

> **For agentic workers:** Use the existing project workflow and execute the tasks below with independent test and review support. Track completion with the checkboxes.

**Goal:** Complete document and manual-review recovery and make stakeholder scenarios repeatable.

**Architecture:** Retain the single static `index.html`. Add a small DOM-independent verification controller within its existing script, used by result, dashboard, and shopping views. Extend the existing saved state with optional fields and normalize older walkthroughs without discarding their inputs or results.

**Tech Stack:** HTML, CSS, browser JavaScript, localStorage; dependency-free Node tests for lifecycle behavior. No package manager or build step.

**Spec:** Extends `docs/specs/pev-status-lifecycle.md` and implements recommendations 1 and 2 approved by Ron on September 5, 2026.

## Scope and behavior

- Synthetic demo only; preserve verification versus eligibility and all Estimated / Full price labels.
- Five scenarios: `verified` (default), `pending_verified`, `document_correction`, `manual_review`, `service_unavailable`. Choose before submission; lock the choice once submitted. Starting a new verification unlocks it and retains the previous selection.
- Document correction: submit → pending → simulated event → Action required → stage a replacement → explicitly submit replacement → pending receipt → simulated event → verified.
- One stable request identifies the relevant document and household or applicant scope. Preserve the request and replacement draft across reload. Store only filename and size, never file contents. Sample replacement remains available.
- Manual review: Not verified → request once → pending with saved receipt → simulated event → verified.
- Service failure is separate from a consumer result: preserve answers/evidence, show Service unavailable, and allow retry → pending → verified. Never imply a technical failure is Not verified.
- Primary dashboard action: details while pending; replace evidence for Action required; request manual review for Not verified; retry for service failure; shopping for Verified. A secondary browse action remains available.
- Deterministic transitions ignore repeated or inapplicable events. Late simulation callbacks must not overwrite a restarted case or pull the consumer away from another view.
- Existing nine-step structure, upfront document requirement, sample plan-shopping placeholder, and styling remain the basis. No new backend, dependencies, deployment, or real notices.

## Task 1 — lifecycle and regression checks

Files: `index.html`, `tests/verification.test.cjs`.

Interface: `verification.normalize(state)`, `submit(state, now)`, `advance(state, now)`, `stageReplacement(state, file)`, `submitReplacement(state, now)`, `requestManualReview(state, now)`, `retryService(state, now)`. Mutate the passed state; transition methods return boolean, staging returns an error string or null. `now` is an ISO timestamp supplied by the caller.

State additions: `demoScenario`, `submittedAt`, `reviewKind`, `documentRequest`, `manualReviewRequestedAt`, `serviceUnavailableAt`, `serviceRetried`. A document request contains `key`, `requestedAt`, `replacement`, and `receivedAt`; retain rejected upload metadata until explicit replacement submission.

- [x] Write failing tests for scenario outcomes, document recovery, manual-review receipt, retry, repeated events, and legacy state normalization.
- [x] Run `node --test tests/verification.test.cjs` and confirm missing lifecycle behavior fails.
- [x] Implement the shared lifecycle and route UI actions through it.
- [x] Run the tests and verify state changes and persistence compatibility.

## Task 2 — consumer recovery and presenter controls

File: `index.html`.

- [x] Add an accessible, collapsible Demo controls selector with scenario explanation and post-submission lock.
- [x] Replace the document placeholder with scoped request details, file/sample selection, validation, explicit submission, and receipt.
- [x] Replace the manual-review toast-only action with persisted pending state and receipt.
- [x] Add the separate service-unavailable result and retry.
- [x] Align dashboard, result details, shopping return navigation, and pending event controls.
- [x] Verify each scenario in the browser, including reload while pending and with a staged replacement, duplicate actions, and desktop/mobile layouts.

## Task 3 — documentation and final review

Files: `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, `CLAUDE.md`, `README.md`, `AGENTS.md`, `docs/specs/pev-status-lifecycle.md`, this plan.

- [x] Update existing docs to describe actual behavior and the new check command.
- [x] Independently review lifecycle, UI, storage compatibility, and scope; resolve material findings.
- [x] Run regression tests, JavaScript syntax check, browser console checks, and `git diff --check`.
- [x] Leave a verified local preview and report the feature branch and any limitations. No push or deployment is included.

## Verification record — September 5, 2026

- 46 dependency-free regression tests pass, including attestation, duplicate actions, legacy normalization, and recovery routing.
- All five scenarios exercised in the browser with the built-in synthetic returning household.
- Replacement draft and receipt, manual-review receipt, service failure and retry, shopping view, and welcome scenario selection verified across reload.
- Native file selection exercised with a local synthetic fixture; sample replacement also exercised.
- Shopping changes from Full price to Estimated in place after a simulated event.
- Desktop 1280 × 900 and mobile 390 × 844 inspected. Mobile case-screen help was moved into page flow so it cannot cover recovery buttons; the other wizard screens retain their existing treatment.
- Independent review findings on scenario persistence, navigation, submission guards, and retry copy resolved.
- Browser warning/error log empty on exercised paths. Inline JavaScript parses and git whitespace check passes.
- Preview runs on an isolated local origin to preserve existing walkthrough storage. No push or deployment.
