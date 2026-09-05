# Project Agent Instructions

## Project

This repository contains a consumer-facing prototype for ACA Marketplace
eligibility pre-verification. It is a stakeholder exploration, not a production
eligibility system and not a source of regulatory truth.

Ron's global policy at `~/agent-rules/AGENTS.md` applies. This file adds only
repository-specific guidance.

## Read Before Working

- For product behavior, terminology, and scope, read `PRODUCT.md`.
- For user-facing changes, read `DESIGN.md`.
- For technical changes, read `ARCHITECTURE.md`.
- For substantial feature work, read the relevant file under `docs/specs/`.
- For consequential architecture choices, read the relevant record under
  `docs/decisions/`.
- `CLAUDE.md` contains detailed implementation notes for the current prototype.

## Current Stack

- Static HTML, CSS, and JavaScript in `index.html`.
- No framework, package manager, build step, database, or production backend.
- Browser `localStorage` for resumable demo state.
- Python's built-in HTTP server for local use.
- GitHub Pages serves `index.html` from `main`.

## Repository Structure

```text
index.html                  Current interactive prototype
README.md                   Project orientation and local-use instructions
PRODUCT.md                  Durable product truth and open policy questions
DESIGN.md                   Durable experience and interface rules
ARCHITECTURE.md             Current technical system and boundaries
CLAUDE.md                   Detailed prototype implementation notes
docs/specs/                 Feature specifications and template
docs/decisions/             Architecture decisions and template
tests/verification.test.cjs Dependency-free lifecycle regression tests
```

## Commands

Start the local prototype:

```bash
python3 -m http.server 8123
```

Then open `http://localhost:8123`.

Run the verification lifecycle tests with Node's built-in test runner:

```bash
node --test tests/verification.test.cjs
```

There is no package manager, lint, type-check, or build command. For changes to
`index.html`, run relevant lifecycle tests, exercise the affected path in a
browser, and verify the browser console stays free of errors. Preserve and restore
`localStorage['stride-preverify-v1']` when an existing walkthrough is present.

## Domain and Safety Rules

- Never represent the prototype as making an official Marketplace eligibility
  determination.
- Keep verification status distinct from eligibility, plan selection,
  enrollment, effectuation, and APTC amount.
- Treat 2028 policy behavior as unsettled unless supported by current,
  authoritative CMS guidance. Date regulatory statements and link the source.
- Label simulated results, subsidy estimates, sample documents, dates, and
  integration responses as demo-only.
- Never add real consumer PII, health data, immigration records, tax data,
  credentials, or uploaded documents to the repository or fixtures.
- Use synthetic demo identities only. Uploaded file contents must not be stored
  by the current prototype.
- Do not add analytics that capture field values or document metadata.
- Preserve accessible labels, focus handling, inline validation, responsive
  behavior, and light-mode-only presentation.

## Deployment

Pushing `main` publishes the GitHub Pages site. Treat a push to `main` as a
production deployment and obtain Ron's explicit approval first. Feature and
documentation work should be pushed to a branch for review unless Ron directs
otherwise.
