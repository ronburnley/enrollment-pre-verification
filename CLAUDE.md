# Eligibility Pre-Verification Prototype

Consumer-facing demo of an eligibility pre-verification flow for ACA marketplace
enrollment, styled as a Stride Health product. Built for stakeholder demos, not
production. Repo: https://github.com/ronburnley/enrollment-pre-verification

## Premise

Starting with Plan Year 2028 (Open Enrollment opens November 1, 2027), federal
rules require every consumer to actively verify eligibility information before
receiving APTC subsidies. Passive re-enrollment with subsidies is gone. This tool
walks a consumer through verification before OE so they can shop on day one with
a confirmed subsidy.

Key product decision (Ron, Aug 2026): document upload is **required for everyone
before submission**. Under the PY2028 rules a data mismatch without documents on
file delays the subsidy, so the flow collects proof up front rather than chasing
documents after a mismatch. Slots are conditional on answers (income always;
immigration docs for non-citizens; residency proof after a recent move), but no
one can submit without their required documents attached.

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
- Verification outcome is random, weighted 70% verified / 20% needs-docs /
  10% unable (`runVerification`). Subsidy uses simplified FPL math in
  `estSubsidy`: <150% FPL = $800/mo, <250% = $400, ≤400% = $150, else $0.
- Uploads store `{name, size}` only — never file contents (localStorage limits).
  Each slot has a "use a sample document" link so demos don't need real files.

## Styling

Sampled from the live www.stridehealth.com/shop: ink `#1A1B1E`, border
`#DCDDE2`, highlight yellow `#FFF98D`, brand green `#37CD8F`, 8px-radius dark
primary / outlined secondary buttons. Fonts: Oswald stands in for Founders
Grotesk X-Cond (condensed headlines), Hanken Grotesk for Founders Grotesk
(body). The real Stride script wordmark is inlined as a PNG data URI, inverted
via CSS filter in dark mode. Light/dark theming uses CSS custom properties with
a `data-theme` override on `<html>` (manual toggle) layered over
`prefers-color-scheme`.

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
- No test suite. Verify by driving the app in the Browser pane; the whole flow
  can be exercised headlessly via `app.*` calls and element clicks in
  `javascript_tool`.
- When testing, snapshot and restore `localStorage['stride-preverify-v1']` if
  Ron has an in-progress session — his walkthrough state matters to him.

## Deployment

GitHub Pages serves `index.html` from `main` (Ron enabled it manually). Pushing
to `main` deploys. Ron reviews by annotating screenshots in the Browser pane;
implement annotation feedback, verify in the browser, then commit and push each
round.
