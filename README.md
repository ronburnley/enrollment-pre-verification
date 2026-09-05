# Eligibility Pre-Verification Prototype

An exploratory consumer experience for verifying ACA Marketplace information
before subsidized coverage begins. The prototype helps stakeholders reason
about a future pre-verification flow, especially the consumer experience when
information can be confirmed electronically, needs supporting evidence, or
remains pending.

This is a demonstration only. It does not connect to CMS, an Exchange, an
identity provider, or a plan-shopping backend, and it does not determine
eligibility for coverage or financial assistance.

## Run Locally

From the repository root:

```bash
python3 -m http.server 8123
```

Open `http://localhost:8123` in a browser.

The experience uses browser storage to preserve demo progress, so serve it over
HTTP rather than opening `index.html` directly.

## Repeatable Demo Scenarios

Open **Demo controls** and choose a scenario before submitting. Verified is the
default; the other choices demonstrate Pending then verified, Document
correction, Manual review, and Service unavailable. The choice locks after
submission. The controls then show the current scenario and **Start another
demo**. That action clears the current walkthrough, opens the picker, and keeps
the prior scenario selected until you choose another.

For a pending case, use the demo status-update action to advance the simulated
review. Document correction requires selecting and explicitly submitting a
replacement; a sample replacement is available. Manual review saves a request
receipt. Service retry preserves the case. Each recovery enters Pending before
a later simulated event resolves it to Verified. No document contents, review
requests, or notifications are sent to a service.

## Verify Changes

The lifecycle regression tests use Node's built-in runner without dependencies:

```bash
node --test tests/verification.test.cjs
```

Also exercise changed paths in the browser, including reload during pending or
document replacement, and check for console errors. Preserve and restore
`localStorage['stride-preverify-v1']` when testing an existing walkthrough.

## Project Documentation

- `PRODUCT.md` defines the product purpose, users, workflows, product rules,
  prototype behavior, and unresolved policy questions.
- `DESIGN.md` defines the experience principles and interface conventions.
- `ARCHITECTURE.md` describes the current technical system and integration
  boundaries.
- `AGENTS.md` tells coding agents how to work safely in this repository.
- `docs/specs/` is the home for substantial feature specifications.
- `docs/decisions/` is the home for consequential architecture decisions.

## Current Implementation

The demo is intentionally simple: `index.html` contains all HTML, CSS, and
JavaScript. It has no build step and no production backend. External interactions
are simulated, and generated verification and subsidy results are not real.

## Status

The prototype is in product discovery. Its current status and recovery behavior
is defined in `docs/specs/pev-status-lifecycle.md`. Next, validate the consumer
recovery experience with stakeholders and resolve the policy, review ownership,
and EDE handoff questions in `PRODUCT.md`. Production integrations and final
Plan Year 2028 requirements remain open.
