# Prototype Verification Status Lifecycle

## Problem / Goal

PRODUCT.md directs the next feature specification to define the status model
for eligibility pre-verification: authoritative states, transitions, reason
codes, timestamps, retry behavior, and allowed downstream actions. This spec
defines that model **for the prototype**. It is a product hypothesis for
stakeholder alignment, not a CMS contract and not a final PY2028 status
vocabulary.

The prototype previously resolved every submission instantly into Verified,
Needs evidence, or Unable to verify. Stakeholder discovery (September 3, 2026)
identified a pending state and event-based status delivery as core product
questions, so this iteration makes pending a first-class outcome and
demonstrates status updates arriving after submission.

## Users

- **Consumer:** needs to know current status, whether action is required, and
  whether displayed prices include financial help.
- **Assister/agent (future):** views status read-only; no attest or submit.
- **Stakeholders:** observe how pending and status changes feel before policy
  is final.

## Status Vocabulary

Four consumer-facing states, applied consistently across the result screen,
dashboard, shopping placeholder, and help responses:

| State | Key | Meaning | Presentation |
| --- | --- | --- | --- |
| Verified | `verified` | The simulated check completed successfully. | Positive but precise: what was verified, when. Not an eligibility determination. |
| Pending | `pending` | Information was received and is under review; no result yet. | Neutral: received timestamp, what is under review, realistic expectation. Never styled as success or failure. |
| Action required | `docs` | A document could not be accepted and must be re-supplied. | Direct and recoverable: names the item and the fixable issue. |
| Not verified | `unable` | The simulated check did not complete successfully. | Direct and recoverable: a mismatch means more information is needed, not fraud or ineligibility. Not an eligibility decision. |

A technical failure of the verification service itself (distinct from a
consumer result) is out of scope for this iteration but the vocabulary should
reserve a Service unavailable treatment per DESIGN.md.

## Transitions

```text
                 submit
                    |
        +-----------+-----------+
        v           v           v
    verified     pending     unable
                    |
          +---------+---------+
          v         v         v
      verified    docs     unable      <- status event (demo control)
```

- Submission randomly resolves to `verified` (~55%), `pending` (~25%), or
  `unable` (~20%) in the demo. (The former `docs` submission outcome is
  retired; document re-request now arrives as a post-submission status change,
  which matches the event model under test.)
- `pending` resolves later via a status event. In the prototype, a demo-labeled
  "Simulate status update" control on the dashboard fires the event; outcomes
  distribute across `verified` / `docs` / `unable`.
- Status events update every entry point that displays status or price:
  result screen (on revisit), dashboard, and shopping placeholder.
- Terminal demo states are `verified` and `unable`; `docs` offers re-upload in
  a future iteration (re-upload is out of scope this round, see below).

## Timestamps and Reason Codes

- `verifiedAt` records when verification completed (displayed on the Verified
  result and dashboard).
- `pendingSince` records when the submission was received (displayed on the
  Pending result and dashboard).
- `resultUpdatedAt` records when the most recent status event arrived.
- Demo reason codes (plain-language in UI, machine-style in state):
  `income_mismatch`, `document_unreadable`, `identity_unmatched`,
  `review_timeout`, `check_passed`. Production reason codes are open question
  #4 in PRODUCT.md.

## Retry Behavior

- Resubmission of the same case is not offered while a status is outstanding;
  duplicate submission is prevented by state.
- `docs` (Action required) explains the fix and names the expected turnaround;
  the re-upload action itself is not wired this iteration (placeholder,
  clearly labeled).
- `unable` offers manual review and support paths as today, framed as "more
  information is needed," never as an eligibility decision.

## Allowed Downstream Actions and Price Labels

Every financial amount is labeled. Status gates the label:

| Status | Shopping placeholder shows |
| --- | --- |
| Verified | "Estimated" — premium with the demo subsidy estimate applied, marked as not an authoritative APTC amount. |
| Pending | "Full price" — prices exclude financial help until verification completes, with a note that this is not a denial. |
| Action required | "Full price" with the same pending note. |
| Not verified | "Full price." |
| No result yet | "Full price" with "verification not started" context. |

All consumers may browse the shopping placeholder regardless of status.

## Requirements

1. Pending is a possible submission outcome and persists across save/resume.
2. A pending status displays received time, what is under review, a realistic
   expectation, and the next step — without success or failure styling.
3. The dashboard exposes a clearly demo-labeled control that resolves a
   pending status through the same event path described above.
4. Status vocabulary and price labels are identical on result, dashboard, and
   shopping screens.
5. Copy states that verification is not an eligibility determination and a
   pending status is not a denial.
6. Loading copy may describe the activity in progress but must not imply a
   result has arrived.
7. No step-structure, localStorage-schema, or accessibility-regression changes;
   existing state keys remain compatible.

## Edge Cases

- Reload while pending: resume banner and result screen render the pending
  state with the original received timestamp.
- Status event arriving after the consumer already saw `verified` is not
  simulated (out-of-order events are a production concern, ARCHITECTURE.md).
- Household members with differing statuses (partial household verification)
  are not modeled; the prototype verifies at the household level.

## Acceptance Criteria

- [ ] Submission can land in Pending; the pending screen shows received
      timestamp, review scope, expectation, and next step.
- [ ] Dashboard "Simulate status update" resolves pending and every
      status/price surface updates consistently.
- [ ] All four states render with the agreed vocabulary; no screen implies
      verification equals eligibility or pending equals denial.
- [ ] Every displayed dollar amount is labeled Estimated or Full price.
- [ ] Save/resume works for a pending case; localStorage snapshot/restore
      preserved for existing walkthroughs.
- [ ] Console remains error-free through all paths.

## Technical Constraints

- Single-file static prototype (`index.html`); no backend; all events
  simulated client-side and labeled demo-only.
- `// INTEGRATION POINT` comment updated at the simulated verification and
  status-event boundary to describe the future asynchronous contract.

## Dependencies

- CMS Plan Year 2028 verification direction (CMS fact sheets linked in
  PRODUCT.md); final states and reason codes remain open questions #1 and #4.

## Risks

- Stakeholders may read the four-state model as a settled decision; the spec
  and UI label it a prototype hypothesis.
- Random outcomes make scripted demos less predictable; the demo control
  mitigates this for pending.

## Privacy and Security

- No new data collected; timestamps are demo-local. Synthetic identities only;
  no analytics added.

## Open Questions

- Final authoritative status values and reason codes (PRODUCT.md #4).
- What consumers may do while pending (PRODUCT.md #5) — prototype assumes
  browse at full price.
- Who owns notices and evidence review (PRODUCT.md #8).

## Out of Scope

- Document re-upload wiring, appeals, case management, notice generation.
- Production event contract, delivery guarantees, or out-of-order handling.
- Real eligibility or APTC calculation.
