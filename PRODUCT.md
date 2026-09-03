# Product: Eligibility Pre-Verification

## Status of This Document

This document captures the current product hypothesis for a stakeholder
prototype. It separates demonstrated prototype behavior from working product
direction and open regulatory questions. It is not legal guidance or an
official description of the final Plan Year 2028 process.

## Purpose

Help a Marketplace consumer verify the information needed for financial
assistance before it becomes a last-minute enrollment blocker. The experience
should make the consumer's verification status, next action, and effect on plan
pricing understandable without implying that this product itself determines
Marketplace eligibility.

## Problem

Pre-enrollment verification moves important evidence checks earlier in the
coverage journey. A consumer may need to confirm existing information, correct
it, or provide documents before APTC can be applied. Verification may not finish
immediately, especially when evidence requires review.

Without a dedicated experience, consumers and assisters may not know:

- what information needs confirmation;
- whether the Marketplace has verified it;
- what is still pending and why;
- which action will move the case forward;
- whether displayed premiums include APTC; or
- how to return to shopping or enrollment after the status changes.

## Product Promise

At every point, answer three questions:

1. What is my verification status?
2. What, if anything, do I need to do next?
3. Does the price I am seeing include financial assistance?

## Primary Users

### Consumer

A person seeking or renewing individual Marketplace coverage, either directly
or with assistance. The initial prototype supports both new and returning
consumers.

### Assister or agent

A person helping the consumer complete the process. This role needs to
understand status and next steps but must not be able to attest, change
information, or submit evidence without the consumer's valid authorization.
Detailed permissions are not yet defined in the prototype.

### Operations or support user

A future internal user who may need to explain status, diagnose a failed
handoff, or route a case for review. Administrative override behavior is out of
scope until policy and operational ownership are defined.

## Product Boundary

Eligibility pre-verification is a verification layer, not the full EDE
application and not an eligibility determination engine.

It may be entered as a standalone pre-open-enrollment task or launched from an
EDE application when verification is missing. The working direction is to keep
the capability modular so the same status and workflow can be used at multiple
points in an enrollment journey.

The prototype must keep these concepts distinct:

- **Verification:** whether required information or evidence has been confirmed.
- **Eligibility determination:** the Exchange's decision about QHP, APTC, CSR,
  Medicaid, or CHIP eligibility.
- **Plan selection:** the consumer's choice of a plan.
- **Enrollment/effectuation:** submission and activation of coverage.
- **APTC amount:** the authoritative subsidy amount returned by the Exchange.

## Information in Scope

The discovery model currently includes:

- identity and personal information;
- tax household composition;
- projected household income;
- citizenship or eligible noncitizen information;
- current health coverage and employer coverage access; and
- place of residence.

These categories reflect the current prototype and internal September 2026
discovery. The final fields, verification sources, and evidence requirements
must follow later CMS technical and policy guidance.

## Core Workflows

### 1. Start or resume

- A consumer chooses a new or returning path.
- A returning consumer may review information already on file rather than
  re-entering every field.
- Progress may be saved and resumed on the same device in the prototype.

### 2. Review and correct information

- Show information in understandable sections.
- Let the consumer confirm accurate information or edit what changed.
- Clearly mark information that was confirmed versus updated.
- Do not present prefilled information as verified merely because it exists.

### 3. Provide evidence when needed

- Explain what fact needs verification and which documents may resolve it.
- Give practical guidance on acceptable and high-quality evidence.
- Minimize collection: request only evidence needed for the unresolved item.
- Keep the consumer informed when evidence is received but still under review.

The current prototype requires documents before submission. That is a deliberate
demo choice, not a confirmed universal 2028 rule, and should be tested against a
conditional, post-mismatch evidence model as authoritative guidance develops.

### 4. Review and attest

- Summarize the information and attached evidence before submission.
- Let the consumer return to any section to correct it.
- Require an explicit consumer attestation before submission.
- Never imply an assister's review substitutes for consumer confirmation.

### 5. Submit and receive status

- Submission begins verification; it does not guarantee an immediate result.
- The product should be able to receive later status changes from an external
  authoritative system.
- Status changes should update all entry points consistently.

### 6. Continue to shopping or enrollment

- A verified consumer can continue with the authoritative result available to
  the downstream EDE experience.
- If verification is pending or incomplete, pricing must clearly say whether it
  is full-price, estimated, or includes authoritative APTC.
- The handoff must preserve a safe return path to the verification task.

## Status Model

The current prototype demonstrates four consumer-facing states:

- **Verified:** the simulated check completed successfully.
- **Pending:** information was received and is under review; no result yet.
- **Action required:** a document needs to be re-supplied.
- **Not verified:** the simulated check did not complete successfully.

Submissions resolve to Verified, Pending, or Not verified; Action required
arrives as a post-submission status change. A demo-labeled "Simulate status
update" control on the dashboard resolves a Pending case so stakeholders can
see how a status event propagates to every status and price surface. See
`docs/specs/pev-status-lifecycle.md` for the prototype states, transitions,
timestamps, demo reason codes, retry behavior, and allowed downstream actions.

Internal discovery suggests a future consumer-facing model centered on
**Verified**, **Pending**, and **Not verified**, with status delivered through an
event-based update. That lifecycle remains a working hypothesis. Final
authoritative states, transitions, reason codes, timestamps, retry behavior,
and allowed downstream actions still require CMS guidance.

## Durable Product Rules

- Verification state must be visible anywhere it changes the consumer's next
  action or displayed price.
- A pending status must not be presented as a denial or final determination.
- A successful verification must not be presented as an eligibility or
  enrollment approval.
- A mismatch means more information is needed; it does not by itself establish
  fraud or ineligibility.
- The consumer must be able to understand which household member and fact an
  evidence request concerns.
- Prefilled information must be reviewable and editable before attestation.
- Every financial amount must be labeled as authoritative, estimated, or
  full-price.
- Status must remain consistent across the verification experience and the
  downstream EDE experience.
- Sensitive values and uploaded evidence must not appear in analytics events,
  logs, URLs, or demo fixtures.
- The prototype must use synthetic data and clearly label simulated outcomes.

## Current Prototype Behavior

The existing static demo includes:

- new and returning consumer paths;
- nine steps covering welcome/path selection, personal, household/income,
  citizenship, coverage, residence, documents, review/submit, and result;
- synthetic returning-member data;
- browser-only save and resume;
- required demo document slots based on consumer answers;
- a review screen with confirmed/updated markers;
- four result states (Verified, Pending, Action required, Not verified) with
  a pending received timestamp and a demo status-event control on the
  dashboard;
- status-aware price labels (Estimated or Full price) on the shopping
  placeholder;
- simplified, non-authoritative subsidy estimates; and
- dashboard and plan-shopping placeholders.

All integrations, verification results, document processing, and financial
calculations are mocked.

### Copy alignment (September 3, 2026)

The prototype copy was aligned with this document: 2028 policy statements are
dated to the CMS fact-sheet level and link the source; fixed dates are labeled
as a demo scenario; immediate-verification and subsidy-confirmation promises
were removed; every financial amount is labeled Estimated or Full price;
verification is consistently distinguished from eligibility determination; and
the help responses now match the required-upload flow. The citizenship screen
no longer makes assurances that require policy review.

### Remaining gaps to resolve before a broader demo

- Document re-upload for the Action required state is a labeled placeholder,
  not wired.
- The conditional, post-mismatch evidence model is still untested; the demo
  only exercises proactive collection.
- No service-unavailable/timeout state is demonstrated.
- The four-state model and price-label vocabulary are prototype hypotheses
  pending authoritative CMS guidance.

## Success for the Prototype

The prototype is useful when stakeholders can use it to make concrete decisions
about:

- whether PEV should be standalone, embedded, or support both entry modes;
- the minimum consumer-visible status model;
- when documents are requested;
- how pending verification affects shopping and APTC display;
- how status updates return to EDE; and
- which questions require CMS clarification before implementation.

Prototype success is learning and alignment, not enrollment conversion or
verification completion rate.

## Open Product and Policy Decisions

1. Which exact eligibility elements must be verified before APTC is issued for
   Plan Year 2028?
2. Can the authoritative system prefill existing information through EDE, and
   what consumer action counts as review and confirmation?
3. Is document collection conditional on a failed electronic match, or should
   any evidence be collected proactively?
4. What are the authoritative status values and reason codes?
5. What may a consumer do while verification is pending: shop, select, enroll
   at full price, or hold a selection?
6. If verification completes after coverage is selected, is APTC effective
   prospectively, retroactively, or according to another rule?
7. What deadlines and review-time expectations apply near the end of open
   enrollment?
8. Which system owns notices, evidence review, appeals, and manual escalation?
9. What event contract communicates status to EDE partners, and how are delayed,
   duplicate, or out-of-order events reconciled?
10. How do assisted pathways establish consumer authorization and visibility?

## Explicit Non-Goals for This Setup

- Building or selecting a production technology stack.
- Making official eligibility or APTC calculations.
- Defining final CMS policy before guidance is available.
- Implementing document storage, identity proofing, appeals, or case management.
- Designing an operations console or administrative override.
- Replacing the full Marketplace or EDE application.
- Deploying changes to the public GitHub Pages site.

## Evidence and Source Boundaries

- The September 3, 2026 internal stakeholder debrief is discovery evidence for
  the product hypotheses around prefill, pending states, modular entry, evidence
  review, and event-based status updates. It is not formal CMS guidance.
- Public sources checked September 3, 2026: CMS says Public Law 119-21 requires
  verification of certain eligibility
  elements before APTC is issued, with new Exchange eligibility-verification
  requirements effective beginning Plan Year 2028. CMS is still developing
  implementation details. See:
  - [CMS Exchange Program Integrity fact sheet](https://www.cms.gov/newsroom/fact-sheets/cms-actions-protect-consumers-strengthen-exchange-program-integrity)
  - [CMS 2027 proposed rule discussion of section 71303](https://www.cms.gov/newsroom/fact-sheets/hhs-notice-benefit-payment-parameters-2027-proposed-rule) (background and request for implementation input, not a final technical contract)
  - [CMS 2027 Payment Notice final rule fact sheet](https://www.cms.gov/newsroom/fact-sheets/hhs-notice-benefit-payment-parameters-2027-final-rule)
- Existing SEP pre-enrollment verification is a related precedent, not proof of
  the final Plan Year 2028 workflow.
