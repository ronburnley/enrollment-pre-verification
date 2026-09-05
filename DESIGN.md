# Design: Eligibility Pre-Verification

## Experience Goal

Make a high-stakes verification process feel understandable and recoverable.
The interface should reduce uncertainty without overstating certainty: the
consumer should always know current status, next action, and whether displayed
prices include financial help.

## Design Principles

### Status before detail

Lead with the consumer's current state and next action. Supporting policy and
educational detail should be available without competing with the task.

### Familiar, not novel

Use a guided form, review screen, document checklist, and dashboard patterns
that consumers already understand. Avoid creating a custom workflow metaphor.

### Prefill with consent

Show known information in a confirm-or-edit pattern. Prefill reduces burden but
must never imply that the consumer already reviewed or attested to the data.

### Pending is a real state

Treat pending review as a first-class experience with a received timestamp,
plain-language reason, realistic expectation, and clear next step. Do not style
it like either success or failure.

### Recovery over blame

For mismatches, rejected documents, timeouts, and unavailable services, explain
what happened in neutral language and offer a concrete recovery path.

### Progressive disclosure

Explain only what is necessary to complete the current task. Definitions,
examples, and policy context belong in tooltips or expandable help.

## Current Visual Direction

The prototype follows Stride-inspired visual conventions:

- light mode only;
- dark ink, white surfaces, restrained gray borders, yellow emphasis, and green
  success treatment;
- condensed display type for headings and a readable grotesk-style body face;
- an eight-pixel corner radius on controls and moderately rounded cards;
- dark primary buttons and outlined secondary buttons;
- no decorative emojis or icons in interface chrome;
- dotted-underlined inline help links in prose;
- visible keyboard focus and semantic labels.

Exact brand assets and design tokens remain prototype-only until approved for a
production product.

## Information Hierarchy

Each task screen should present, in order:

1. where the consumer is in the process;
2. the question or status that matters now;
3. the information or action required;
4. why it is needed, on demand;
5. a clear primary action and safe way back.

## Forms and Validation

- Use one understandable topic per step.
- Prefer selection controls over free text when the answer set is known.
- Format SSNs, phone numbers, and currency-like income values as entered.
- Validate on blur and clear errors as soon as the value becomes valid.
- Put the error next to the affected field and explain how to fix it.
- Preserve entered information when the consumer moves backward.
- Never use color alone to communicate status or errors.
- Keep touch targets comfortable and avoid horizontal scrolling on mobile.
- On mobile result, dashboard, and shopping screens, keep Help in page flow so
  it cannot cover recovery actions.

## Confirmation and Review

- Returning consumers see concise information-on-file cards with explicit
  Confirm and Edit choices.
- The final review groups data by the same topics used during entry.
- Mark sections as Confirmed or Updated only after consumer action.
- Place Edit actions at the section level and return the consumer to review
  after a correction.
- Attestation language must distinguish consumer confirmation from official
  verification.

## Evidence Upload

- Explain which fact the document supports.
- Give examples, quality guidance, and accepted formats before upload.
- Confirm receipt separately from successful verification.
- A rejected document should name the fixable issue when known, such as an
  unreadable image or missing page.
- Do not expose full document identifiers after upload.
- Sample documents must be visibly synthetic.
- For replacement evidence, identify the requested fact, document, and household
  or applicant scope. Keep this request stable across reload and navigation.
- Show selection as a draft. Require an explicit replacement submission before
  displaying received/pending status; a selected filename alone is not receipt.
- Preserve the original evidence metadata until the replacement is submitted.
- Provide a sample replacement so the recovery path needs no real documents.

## Status Presentation

The same status vocabulary and visual treatment should appear in the standalone
experience, dashboard, and shopping placeholder. Future EDE handoffs and
notifications should use that vocabulary too; neither is a live integration in
the prototype.

- **Verified:** positive but precise; state what was verified and when.
- **Pending:** neutral; state what was received, what is being reviewed, and
  whether the consumer must act.
- **Not verified / action required:** direct and recoverable; identify the
  unresolved item and next action.
- **Service unavailable:** distinguish a technical failure from the consumer's
  verification result.

Any premium display near these statuses must say Authoritative with APTC,
Estimated, or Full price. The current prototype uses only Estimated and Full
price because it has no authoritative APTC result.

### Recovery and dashboard actions

Make the primary dashboard action match the current case:

| Case | Primary action |
| --- | --- |
| Pending | View review details and receipt |
| Action required | Replace the requested evidence |
| Not verified | Request manual review |
| Service unavailable | Retry the check |
| Verified | Continue to shopping |

A secondary action may browse the shopping placeholder at every status. Full
price remains explicit until Verified, when prices use a demo estimate.
Manual-review and replacement submissions show saved received/pending receipts
and prevent duplicate requests. A later status update must not pull the consumer
away from the view they are using.

### Presenter controls

Keep scenario selection and simulated event actions in a separate, collapsible
**Demo controls** area. Label the controls as demo-only and explain what the
selected scenario demonstrates. These controls are for the presenter, separate
from the consumer's recovery action.

The five choices are Verified (default), Pending then verified, Document
correction, Manual review, and Service unavailable. Lock the selection once
submitted so a saved case cannot change scenarios mid-review. Starting a new
verification unlocks the picker and retains the previous choice. Simulated
events should be available only when they can advance the current pending case.

## Responsive and Accessibility Expectations

- Design mobile-first while keeping the review and dashboard easy to scan on
  desktop.
- Maintain logical heading order, programmatic labels, and meaningful button
  names.
- Move focus to the new step heading after navigation.
- Announce validation and asynchronous status changes to assistive technology.
- Meet WCAG 2.2 AA contrast and interaction requirements for production work.
- Respect reduced-motion preferences before adding nonessential animation.

## Loading, Empty, and Error States

- Loading copy may explain the current verification activity but must not imply
  a successful result before one arrives.
- Empty evidence lists should explain whether no documents are needed or the
  requirements have not yet been evaluated.
- Timeouts should preserve submitted state and offer retry or support rather
  than asking the consumer to start over.
- Duplicate submission must be prevented or safely handled.

## Introducing New Patterns

Reuse the existing card, button, field, tooltip, callout, and status patterns.
Add a new UI pattern only when an existing one cannot express the product rule;
document the durable rule here when it is introduced.
