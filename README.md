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

The prototype is in product discovery. The next recommended artifact is a
feature specification for the verification-status lifecycle and its handoff to
an EDE shopping or enrollment flow.
