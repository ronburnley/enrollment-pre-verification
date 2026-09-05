# Prototype Verification Status Lifecycle

## Problem / Goal

Make verification status understandable and recoverable, and let stakeholders
repeat a known scenario. This specification covers the static prototype's
status lifecycle, document correction, manual-review request, service retry,
and presenter controls. It incorporates the recovery and deterministic-scenario
work approved September 5, 2026.

The lifecycle is a product hypothesis, not an authoritative CMS contract or a
final Plan Year 2028 vocabulary. All checks, receipts, review outcomes, and
status events are simulated. No request or notification leaves the browser.

## Users

- **Consumer:** needs current status, a concrete next action, and clear price
  labels.
- **Stakeholder/presenter:** selects and repeats a scenario using clearly
  separated demo controls.
- **Assister/agent (future):** authorization, visibility, and submission rights
  remain undefined; this prototype does not establish them.

## Status Vocabulary

The result screen, dashboard, shopping placeholder, and help responses share
four verification results:

| State | `result` | Meaning |
| --- | --- | --- |
| Verified | `verified` | The simulated check completed successfully; this is not an eligibility, enrollment, or authoritative APTC determination. |
| Pending | `pending` | Information or a review request was received and is under review; no result yet. |
| Action required | `docs` | A specific document must be replaced to continue review. |
| Not verified | `unable` | The simulated check could not verify the information; a manual-review request is available. This does not establish fraud or ineligibility. |

**Service unavailable** is a separate technical condition, stored with
`result: null` and `serviceUnavailableAt`. It preserves submitted answers and
evidence and offers retry. It must never be presented as Not verified or as a
consumer denial. An unsubmitted case also has `result: null`, but has no
service-unavailable timestamp or submission receipt.

## Deterministic Demo Scenarios

The collapsible **Demo controls** area exposes the following choices before
submission. The default is Verified.

| Label | Key | Initial outcome | Later path |
| --- | --- | --- | --- |
| Verified | `verified` | Verified | Complete |
| Pending then verified | `pending_verified` | Pending | Simulated event → Verified |
| Document correction | `document_correction` | Pending | Simulated event → Action required → replacement submission → Pending → simulated event → Verified |
| Manual review | `manual_review` | Not verified | Manual-review request → Pending → simulated event → Verified |
| Service unavailable | `service_unavailable` | Service unavailable | Retry → Pending → simulated event → Verified |

There are no random outcomes. The picker locks once `submittedAt` is set.
Starting a new verification clears the case lifecycle, retains the selected
scenario, and unlocks the picker. Scenario descriptions and simulated event
actions stay separate from consumer recovery actions and are labeled demo-only.

The event control is available when the current case is pending and can
advance. It stands in for a future asynchronous response; consumers do not
ordinarily cause a real review outcome by clicking a button.

## Document Correction

1. Submit the document-correction scenario with the existing required upfront
   evidence. Show Pending and a received timestamp.
2. A simulated event creates one stable request and shows Action required.
   Identify the fact, requested document, household or applicant scope, fixable
   issue, and expected replacement format.
3. Selecting a valid replacement stages filename and size metadata. Provide a
   synthetic sample option. Preserve both the stable request and replacement
   draft across reload and navigation.
4. Keep the original upload metadata until the consumer explicitly submits the
   replacement. File selection alone does not submit evidence or verify it.
5. Explicit submission updates the requested upload's metadata, records a
   receipt, and changes the case to Pending. Display what was received and when,
   with clear simulated-review context.
6. A later simulated event changes the case to Verified. Keep the request and
   receipt available in saved state; do not create another evidence request.

The request model is `documentRequest: {key, requestedAt, replacement,
receivedAt}`. `key` identifies the original document slot and its scope.
`replacement` is `null` or `{name, size}`. `receivedAt` is set only on explicit
submission. The request remains stable throughout the recovery path.

Replacement validation follows the prototype's accepted file formats and size
limit. Validation errors appear inline with a recovery instruction. A repeated
replacement submission or event that does not apply to the current state must
have no effect.

## Manual Review

Not verified offers a concrete **Request manual review** action. The request
is recorded once in `manualReviewRequestedAt`; it enters Pending and displays
a saved receipt. Repeated requests do not create a new receipt or restart
review. Reload resumes the pending review with the same receipt. A later
simulated event resolves to Verified.

No actual review queue, support handoff, notice, or notification is created.
This demo outcome does not promise a successful real review or set a production
turnaround time.

## Service Retry

The unavailable view explains a technical interruption and retains the
consumer's submitted work. Retry records the recovery phase and enters Pending,
where the receipt explains that the retry was received. A later simulated event
resolves to Verified. Retrying the same outstanding case again does not create
another submission or reset the pending timestamp.

## Persistence and Timestamps

The existing storage key, form state, uploads, and result fields remain
compatible. The lifecycle adds optional fields:

| Field | Use |
| --- | --- |
| `demoScenario` | Selected deterministic scenario |
| `submittedAt` | Initial submission receipt and picker-lock boundary |
| `reviewKind` | Current pending review phase |
| `documentRequest` | Stable requested slot, replacement draft, and receipt |
| `manualReviewRequestedAt` | Manual-review receipt |
| `serviceUnavailableAt` | Technical interruption, separate from a consumer result |
| `serviceRetried` | Whether service recovery was started |

Existing `pendingSince` records the active review's received time,
`verifiedAt` records simulated completion, and `resultUpdatedAt` records the
latest result change. These are local demo timestamps, not external service
evidence. Original request and receipt timestamps persist through later review.

Normalize older saved walkthroughs by filling missing lifecycle context while
preserving answers, uploads, and existing results. Legacy submitted results
remain locked; legacy pending, document-request, and not-verified cases can
resume and recover. Do not discard a walkthrough or require a storage reset to
load the new version.

## Dashboard and Downstream Actions

The primary dashboard action addresses the next step for the current case:

| Case | Primary action | Shopping price label |
| --- | --- | --- |
| Verified | Continue to shopping | Estimated, using the non-authoritative demo subsidy |
| Pending | View pending details and receipt | Full price; pending is not a denial |
| Action required | Replace the requested evidence | Full price |
| Not verified | Request manual review | Full price |
| Service unavailable | Retry the check | Full price |
| No submission | Start or continue verification | Full price; verification not started |

All consumers may browse the shopping placeholder via a secondary action.
Provide a safe return to the current verification details. Every dollar amount
remains labeled Estimated or Full price; the prototype has no authoritative
APTC amount. A status change propagates to result, dashboard, and shopping
surfaces without moving the consumer away from the active view.

## Reliability and Edge Cases

- Reject repeated initial submissions, completed recovery actions, and status
  events that do not apply to the current state.
- Preserve original receipts across reload and duplicate clicks.
- Preserve a staged replacement and the rejected upload until explicit submit.
- Do not let late simulation callbacks overwrite a restarted case or navigate
  the consumer away from another view.
- Loading copy describes activity without implying success.
- Use one case-level result. The requested document can have applicant or
  household scope; differing verification results per household member are not
  modeled.
- Simulated transitions are guarded locally. Production event ordering,
  idempotency, delivery guarantees, and reconciliation remain open design work.

## Acceptance Criteria

1. All five scenarios reach the documented outcomes without randomness.
2. Scenario selection locks after submission and unlocks for a new verification
   while retaining the selection.
3. Document correction identifies one stable requested item; valid selection
   stages metadata only, explicit submission records receipt, and the next
   simulated review event verifies the case.
4. Manual-review requests and service retries enter persistent Pending states
   and later resolve to Verified through the event control.
5. Service failure remains distinct from a consumer result on every surface.
6. Dashboard actions, result details, return navigation, and price labels agree
   with the current case.
7. Reload preserves pending receipts and replacement drafts; older saved states
   remain usable without losing consumer inputs.
8. Duplicate and inapplicable actions are harmless, and late callbacks cannot
   overwrite a new case or change the active view.
9. Controls remain keyboard accessible, feedback is announced appropriately,
   desktop and mobile layouts are usable, and the console remains error-free.

## Verification

Run `node --test tests/verification.test.cjs` for scenario transitions,
replacement recovery, manual-review receipts, service retry, repeated events,
and legacy normalization. The tests use Node's built-in runner with no package
manager or dependencies.

Browser checks must exercise the consumer actions, reload/resume, scenario lock,
all status/price surfaces, navigation during a simulated update, and responsive
presentation. Preserve and restore `localStorage['stride-preverify-v1']` for an
existing walkthrough. Automated lifecycle tests do not replace rendered checks.

## Technical and Privacy Constraints

- Keep the single static `index.html`, existing nine steps, and upfront document
  requirements. Dashboard and shopping remain separate non-step views.
- Use a shared DOM-independent verification controller; add no backend,
  framework, package manager, build step, vendor, or deployment.
- Keep simulated service boundaries marked with `INTEGRATION POINT` comments.
- Use synthetic identities and sample documents. File selection stores only
  filename and size; never read, upload, or store document contents.
- Add no analytics, real support requests, notices, or external data transfer.

## Policy Dependencies and Open Questions

CMS Plan Year 2028 guidance linked and dated in `PRODUCT.md` sets the source
boundary. The demo does not settle:

- authoritative status values, reason codes, or required eligibility elements;
- proactive versus conditional evidence collection;
- allowed shopping, selection, enrollment, and APTC behavior while pending;
- evidence-review ownership, deadlines, notices, appeals, or assisted access;
- the EDE handoff and authoritative event contract.

The predictable successful recovery outcomes support stakeholder exploration;
they must not be read as regulatory rules or operational promises.

## Out of Scope

- Real evidence storage, content processing, identity verification, or review.
- A production review queue, support integration, notices, appeals, or case
  management.
- Production event contracts, delivery guarantees, or external integrations.
- Partial household verification and real eligibility or APTC calculations.
- Changing the nine-step flow or the upfront evidence collection decision.
- Publishing or deploying the prototype.
