# Eligibility Pre-Verification Prototype

Consumer-facing demo of an eligibility pre-verification flow for ACA marketplace
enrollment, styled as a Stride Health product. Built for stakeholder demos, not
production. Repo: https://github.com/ronburnley/enrollment-pre-verification

Read `PRODUCT.md` for product scope and open policy questions, `DESIGN.md` for
experience rules, `ARCHITECTURE.md` for the current system, and `AGENTS.md` for
repository-specific working instructions. This file contains detailed notes for
the existing single-file implementation.

## Prototype premise

The demo explores a future state in which required eligibility information must
be verified before APTC is issued for Plan Year 2028. CMS implementation details
are still developing. Treat the flow, dates, status model, and eligibility
elements shown here as product hypotheses unless `PRODUCT.md` links current
authoritative guidance.

Current demo decision (Aug 2026): document upload is **required before
submission** for every demo path. This deliberately tests proactive evidence
collection rather than claiming it is a universal PY2028 rule. Slots are
conditional on answers (income always; immigration docs for non-citizens;
residency proof after a recent move), and the prototype does not submit until
the displayed slots have sample metadata attached.

## Architecture

- **One file: `index.html`.** All CSS, JS, and the base64-encoded Stride logo are
  inline. No frameworks, no build step, no external dependencies except an
  optional Google Fonts link (system fallbacks work offline).
- All backend interactions are mocked. `// INTEGRATION POINT` comments mark the
  nine places production would connect (Auth, Member Data API, CMS/FFM EDE, IRS,
  DHS SAVE, USPS, Plan Shopping handoff, Document Upload, Amplitude).
- State lives in a single `S` object persisted to localStorage under
  `stride-preverify-v1`. `ORIGINAL` is a snapshot taken at path selection, used
  to diff sections for the Updated/Confirmed badges on Review.

### Flow (9 steps, indexes 0-8 in the `STEPS` array)

0 Welcome (path choice: new vs returning) · 1 Personal · 2 Household & Income ·
3 Citizenship · 4 Coverage · 5 Residence · 6 Supporting Documents (required
upload) · 7 Review & Submit · 8 Result. Plus non-step views: dashboard and a
plan-shopping placeholder (`app.showDashboard()` / `app.showShopping()` — these
are NOT in `STEPS`; never navigate to them via `app.show(i)`).

Progress labels are 1-based off `TOTAL_STEPS` ("Step 7 of 9" = index 6). If you
add or remove a step, `show()`, `next()`, `validate()`, the review Edit links,
and the resume conditions at the bottom of the file all key off step indexes.

- Returning members get mock data (Maria Santos, defined in `MOCK_MEMBER`) and a
  confirm-card pattern ("Is this still correct?") on Personal, Citizenship, and
  Residence instead of raw forms.
- Status model (see `docs/specs/pev-status-lifecycle.md`): a DOM-independent
  verification controller owns normalization and deterministic transitions.
  Its methods are `normalize`, `submit`, `advance`, `stageReplacement`,
  `submitReplacement`, `requestManualReview`, and `retryService`.
- `demoScenario` selects `verified` (default), `pending_verified`,
  `document_correction`, `manual_review`, or `service_unavailable`. A separate,
  collapsible Demo controls area holds the picker and simulated status-event
  action. The picker locks when `submittedAt` is present; a new verification
  keeps the choice and clears the case so it becomes editable again.
- Pending persists its receipt and review phase. `app.simulateStatusEvent()`
  advances the current pending case deterministically. A document-correction
  case progresses pending → docs → explicitly submitted replacement → pending
  → verified. A manual-review case progresses unable → requested review →
  pending → verified. A service-unavailable case has `result:null` and
  `serviceUnavailableAt`, then retry → pending → verified. Repeated or
  inapplicable transitions have no effect.
- `documentRequest` contains a stable slot `key`, `requestedAt`, a replacement
  draft, and `receivedAt`. Display the slot's document label and household or
  applicant scope. Staging preserves the rejected upload; explicit submission
  replaces its metadata and records receipt. `manualReviewRequestedAt` records
  the manual-review receipt. Both survive reload and remain pending until a
  simulated event arrives.
- Normalize older saved state without clearing answers, uploads, or results.
  Legacy submitted cases remain locked and can use the recovery controls.
  Late simulation callbacks must not overwrite a restarted case or navigate
  the consumer away from the active view.
- Dashboard primary actions follow the case: pending details, replacement,
  manual-review request, service retry, or shopping when verified. Browsing is
  also available as a secondary action.
- Subsidy uses simplified FPL math in `estSubsidy`: <150% FPL = $800/mo, <250% =
  $400, ≤400% = $150, else $0. Every displayed amount must stay labeled Estimated
  or Full price. Only `S.result === 'verified'` applies the demo subsidy;
  pending, action-required, not-verified, unavailable, and unsubmitted cases
  browse at full price.
- Uploads store `{name, size}` only — never file contents (localStorage limits).
  Each slot has a "use a sample document" link so demos don't need real files.
  The same metadata-only rule and a sample option apply to replacements.

## Styling

Sampled from the live www.stridehealth.com/shop: ink `#1A1B1E`, border
`#DCDDE2`, highlight yellow `#FFF98D`, brand green `#37CD8F`, 8px-radius dark
primary / outlined secondary buttons. Fonts: Oswald stands in for Founders
Grotesk X-Cond (condensed headlines), Hanken Grotesk for Founders Grotesk
(body). The real Stride script wordmark is inlined as a PNG data URI. The app is
light mode only; dark mode was removed (no `prefers-color-scheme` blocks, no
`data-theme` toggle).

Design conventions from Ron's annotation rounds — keep these:
- No emojis in UI chrome; no decorative icons in callouts.
- The `mark` highlight uses a gradient so it doesn't bleed above cap height.
- Inline tooltips inside prose use dotted-underline text (`.tip-link`), not "?"
  circles; "?" circle buttons (`.tip-btn`) are fine next to labels/headings.
- Inputs auto-format as you type: SSN dashes, phone parens, thousands commas on
  income fields (income inputs are `type="text" inputmode="numeric"` because
  number inputs can't display commas). Validation is inline and friendly, shown
  on blur, cleared live once valid.
- A global `[hidden]{display:none!important}` rule exists because several
  containers set `display:flex` — don't remove it.

## Running & testing

- Serve over HTTP; localStorage is dead on `file://`/`data:` URLs (save/resume
  silently no-ops there). `.claude/launch.json` defines the `preverify` dev
  server (`python3 -m http.server 8123`) for the Claude Code Browser pane.
- Run `node --test tests/verification.test.cjs` for lifecycle regression tests.
  They use Node's built-in runner, with no package manager or dependencies.
- Also drive affected paths in a browser: verify scenario locking, replacement
  staging and explicit receipt, manual review, service retry, reload/resume,
  status-aware navigation and prices, and desktop/mobile rendering. Confirm the
  browser console stays free of errors.
- When testing, snapshot and restore `localStorage['stride-preverify-v1']` if
  Ron has an in-progress session — his walkthrough state matters to him.

## Deployment

GitHub Pages serves `index.html` from `main` (Ron enabled it manually). Pushing
to `main` deploys and therefore requires Ron's explicit production-deployment
approval. Ron reviews by annotating screenshots in the Browser pane;
implement annotation feedback, verify in the browser, then commit and push each
round.
