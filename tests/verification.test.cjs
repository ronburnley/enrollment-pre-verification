'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const T0 = '2026-09-05T14:00:00.000Z';
const T1 = '2026-09-05T14:05:00.000Z';
const T2 = '2026-09-05T14:10:00.000Z';
const T3 = '2026-09-05T14:15:00.000Z';

// Run the actual application script without starting its DOM event handler.
// Every test receives an isolated controller and application state.
function model() {
  const context = vm.createContext({ document: { addEventListener() {} } });
  vm.runInContext(`${script}\n;globalThis.testModel = {
    verification: typeof verification === 'undefined' ? undefined : verification,
    blankState, requiredDocs, app,
    setState(state) { S = state; }
  };`, context, { filename: 'index.html' });
  const api = context.testModel;
  assert.ok(api.verification, 'The inline script must expose the verification lifecycle');
  return api;
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function preparedState(blankState, scenario = 'verified') {
  const state = blankState();
  state.demoScenario = scenario;
  state.path = 'new';
  state.personal.first = 'Demo';
  state.personal.last = 'Applicant';
  state.household.filing = 'single';
  state.household.income.employment = 42000;
  state.citizenship.citizen = 'yes';
  state.residence.twelve = 'yes';
  state.uploads.income = { name: 'sample-original-paystub.pdf', size: 12000 };
  state.attested = true;
  return state;
}

function actionRequired(verification, blankState) {
  const state = preparedState(blankState, 'document_correction');
  assert.equal(verification.submit(state, T0), true);
  assert.equal(verification.advance(state, T1), true);
  assert.equal(state.result, 'docs');
  return state;
}

for (const fixture of ['blank', 'prepared']) {
  test(`an unattested ${fixture} case cannot submit or acquire submission timestamps`, () => {
    const { verification, blankState } = model();
    const state = fixture === 'blank' ? blankState() : preparedState(blankState);
    state.attested = false;
    const before = plain(state);
    assert.equal(verification.submit(state, T0), false);
    assert.deepEqual(plain(state), before);
  });
}

test('default scenario verifies the submitted case and records the completion time', () => {
  const { verification, blankState } = model();
  const state = preparedState(blankState);
  assert.equal(verification.submit(state, T0), true);
  assert.equal(state.result, 'verified');
  assert.equal(state.submittedAt, T0);
  assert.equal(state.verifiedAt, T0);
  assert.equal(state.resultUpdatedAt, T0);
  assert.equal(state.subsidy, 150);
});

for (const scenario of ['pending_verified', 'document_correction']) {
  test(`${scenario} initially records a pending submission receipt`, () => {
    const { verification, blankState } = model();
    const state = preparedState(blankState, scenario);
    assert.equal(verification.submit(state, T0), true);
    assert.equal(state.result, 'pending');
    assert.equal(state.reviewKind, 'submission');
    assert.equal(state.submittedAt, T0);
    assert.equal(state.pendingSince, T0);
    assert.equal(state.resultUpdatedAt, T0);
    assert.equal(state.verifiedAt, null);
    assert.equal(state.subsidy, null);
  });
}

test('pending-to-verified scenario completes only when a later event arrives', () => {
  const { verification, blankState } = model();
  const state = preparedState(blankState, 'pending_verified');
  verification.submit(state, T0);
  assert.equal(verification.advance(state, T1), true);
  assert.equal(state.result, 'verified');
  assert.equal(state.verifiedAt, T1);
  assert.equal(state.resultUpdatedAt, T1);
  assert.equal(state.submittedAt, T0);
  assert.equal(state.subsidy, 150);
});

test('document event establishes one stable request for the available income evidence', () => {
  const { verification, blankState } = model();
  const state = preparedState(blankState, 'document_correction');
  state.citizenship.citizen = 'no';
  state.uploads.immigration = { name: 'sample-document.jpg', size: 8000 };
  verification.submit(state, T0);
  assert.equal(state.documentRequest, null);
  assert.equal(verification.advance(state, T1), true);
  assert.equal(state.result, 'docs');
  assert.deepEqual(plain(state.documentRequest), {
    key: 'income', requestedAt: T1, replacement: null, receivedAt: null
  });
  const saved = plain(state);
  assert.equal(verification.advance(state, T2), false);
  verification.normalize(state);
  assert.deepEqual(plain(state), saved);
});

test('document request falls back to available applicable evidence when income is absent', () => {
  const { verification, blankState } = model();
  const state = preparedState(blankState, 'document_correction');
  state.uploads.income = null;
  state.citizenship.citizen = 'no';
  state.uploads.immigration = { name: 'sample-document.jpg', size: 8000 };
  verification.submit(state, T0);
  verification.advance(state, T1);
  assert.equal(state.documentRequest.key, 'immigration');
});

test('staging a replacement keeps rejected evidence and stores metadata only', () => {
  const { verification, blankState } = model();
  const state = actionRequired(verification, blankState);
  const original = plain(state.uploads.income);
  const file = {
    name: 'sample-clear-paystub.pdf', size: 25000, type: 'application/pdf',
    contents: 'synthetic file content must never be retained', lastModified: 123
  };
  assert.equal(verification.stageReplacement(state, file), null);
  assert.equal(state.result, 'docs');
  assert.deepEqual(plain(state.uploads.income), original);
  assert.deepEqual(plain(state.documentRequest.replacement), {
    name: 'sample-clear-paystub.pdf', size: 25000
  });
  assert.equal(state.documentRequest.receivedAt, null);
  assert.equal(state.resultUpdatedAt, T1);
});

test('explicit replacement submission records receipt before a later verification event', () => {
  const { verification, blankState } = model();
  const state = actionRequired(verification, blankState);
  verification.stageReplacement(state, { name: 'sample-clear-paystub.pdf', size: 25000 });
  assert.equal(verification.submitReplacement(state, T2), true);
  assert.equal(state.result, 'pending');
  assert.equal(state.reviewKind, 'document');
  assert.equal(state.pendingSince, T2);
  assert.equal(state.documentRequest.requestedAt, T1);
  assert.equal(state.documentRequest.receivedAt, T2);
  assert.deepEqual(plain(state.uploads.income), {
    name: 'sample-clear-paystub.pdf', size: 25000
  });
  assert.equal(verification.advance(state, T3), true);
  assert.equal(state.result, 'verified');
  assert.equal(state.verifiedAt, T3);
  assert.equal(state.documentRequest.receivedAt, T2);
});

test('replacement submission requires a staged file and preserves the open request otherwise', () => {
  const { verification, blankState } = model();
  const state = actionRequired(verification, blankState);
  const before = plain(state);
  assert.equal(verification.submitReplacement(state, T2), false);
  assert.deepEqual(plain(state), before);
});

for (const name of ['sample.pdf', 'sample.JPG', 'sample.jpeg', 'sample.png', 'sample.webp']) {
  test(`replacement accepts ${name} at the 10 MiB boundary`, () => {
    const { verification, blankState } = model();
    const state = actionRequired(verification, blankState);
    assert.equal(verification.stageReplacement(state, { name, size: 10 * 1024 * 1024 }), null);
    assert.deepEqual(plain(state.documentRequest.replacement), { name, size: 10485760 });
  });
}

for (const file of [
  { name: 'sample.exe', size: 100 },
  { name: 'sample.pdf.exe', size: 100 },
  { name: 'sample.pdf', size: 10485761 },
  { name: 'sample.pdf', size: 0 },
  { name: 'sample.pdf', size: -1 },
  { name: '', size: 100 },
  null
]) {
  test(`invalid replacement ${JSON.stringify(file)} preserves an already staged draft`, () => {
    const { verification, blankState } = model();
    const state = actionRequired(verification, blankState);
    verification.stageReplacement(state, { name: 'sample-valid.pdf', size: 1000 });
    const before = plain(state);
    const error = verification.stageReplacement(state, file);
    assert.equal(typeof error, 'string');
    assert.ok(error.length > 0);
    assert.deepEqual(plain(state), before);
  });
}

test('staged replacement and its request survive save and normalize without changing original evidence', () => {
  const { verification, blankState } = model();
  const state = actionRequired(verification, blankState);
  verification.stageReplacement(state, { name: 'sample-clear-paystub.png', size: 34000 });
  const saved = plain(state);
  const reloaded = plain(state);
  assert.equal(verification.normalize(reloaded), reloaded);
  assert.deepEqual(reloaded, saved);
  assert.equal(verification.submitReplacement(reloaded, T2), true);
  assert.equal(reloaded.result, 'pending');
  assert.equal(reloaded.documentRequest.receivedAt, T2);
});

test('manual review records one request receipt and later resolves to verified', () => {
  const { verification, blankState } = model();
  const state = preparedState(blankState, 'manual_review');
  assert.equal(verification.submit(state, T0), true);
  assert.equal(state.result, 'unable');
  assert.equal(state.manualReviewRequestedAt, null);
  assert.equal(verification.requestManualReview(state, T1), true);
  assert.equal(state.result, 'pending');
  assert.equal(state.reviewKind, 'manual');
  assert.equal(state.manualReviewRequestedAt, T1);
  assert.equal(state.pendingSince, T1);
  const receipt = plain(state);
  assert.equal(verification.requestManualReview(state, T2), false);
  assert.deepEqual(plain(state), receipt);
  const reloaded = plain(state);
  verification.normalize(reloaded);
  assert.equal(reloaded.manualReviewRequestedAt, T1);
  assert.equal(reloaded.reviewKind, 'manual');
  assert.equal(verification.advance(reloaded, T3), true);
  assert.equal(reloaded.result, 'verified');
  assert.equal(reloaded.verifiedAt, T3);
  assert.equal(reloaded.manualReviewRequestedAt, T1);
});

test('service failure has no consumer result and preserves answers and initial evidence', () => {
  const { verification, blankState } = model();
  const state = preparedState(blankState, 'service_unavailable');
  const personal = plain(state.personal);
  const household = plain(state.household);
  const uploads = plain(state.uploads);
  assert.equal(verification.submit(state, T0), true);
  assert.equal(state.result, null);
  assert.equal(state.serviceUnavailableAt, T0);
  assert.equal(state.submittedAt, T0);
  assert.equal(state.verifiedAt, null);
  assert.equal(state.subsidy, null);
  assert.deepEqual(plain(state.personal), personal);
  assert.deepEqual(plain(state.household), household);
  assert.deepEqual(plain(state.uploads), uploads);
});

test('retrying service failure creates pending review and does not repeat the service failure', () => {
  const { verification, blankState } = model();
  const state = preparedState(blankState, 'service_unavailable');
  verification.submit(state, T0);
  assert.equal(verification.retryService(state, T1), true);
  assert.equal(state.result, 'pending');
  assert.equal(state.reviewKind, 'submission');
  assert.equal(state.pendingSince, T1);
  assert.equal(state.serviceUnavailableAt, null);
  assert.equal(state.serviceRetried, true);
  assert.equal(state.submittedAt, T0);
  const pending = plain(state);
  assert.equal(verification.retryService(state, T2), false);
  assert.deepEqual(plain(state), pending);
  assert.equal(verification.advance(state, T3), true);
  assert.equal(state.result, 'verified');
  assert.equal(state.verifiedAt, T3);
});

for (const scenario of ['verified', 'pending_verified', 'document_correction', 'manual_review', 'service_unavailable']) {
  test(`resubmitting ${scenario} cannot replace the existing submission or timestamps`, () => {
    const { verification, blankState } = model();
    const state = preparedState(blankState, scenario);
    verification.submit(state, T0);
    const submitted = plain(state);
    assert.equal(verification.submit(state, T1), false);
    assert.deepEqual(plain(state), submitted);
  });
}

test('replacement receipt cannot be submitted or restaged after review begins', () => {
  const { verification, blankState } = model();
  const state = actionRequired(verification, blankState);
  verification.stageReplacement(state, { name: 'sample-clear-paystub.pdf', size: 1000 });
  verification.submitReplacement(state, T2);
  const submitted = plain(state);
  assert.equal(verification.submitReplacement(state, T3), false);
  assert.equal(typeof verification.stageReplacement(state, { name: 'sample-late.pdf', size: 2000 }), 'string');
  assert.deepEqual(plain(state), submitted);
});

test('recovery actions and status events cannot change an unsubmitted case', () => {
  const { verification, blankState } = model();
  const state = preparedState(blankState);
  const before = plain(state);
  assert.equal(verification.advance(state, T0), false);
  assert.equal(verification.submitReplacement(state, T0), false);
  assert.equal(verification.requestManualReview(state, T0), false);
  assert.equal(verification.retryService(state, T0), false);
  assert.equal(typeof verification.stageReplacement(state, { name: 'sample.pdf', size: 100 }), 'string');
  assert.deepEqual(plain(state), before);
});

test('late duplicate events and recovery actions cannot change a completed verification', () => {
  const { verification, blankState } = model();
  const state = preparedState(blankState, 'pending_verified');
  verification.submit(state, T0);
  verification.advance(state, T1);
  const completed = plain(state);
  assert.equal(verification.advance(state, T2), false);
  assert.equal(verification.submitReplacement(state, T2), false);
  assert.equal(verification.requestManualReview(state, T2), false);
  assert.equal(verification.retryService(state, T2), false);
  assert.deepEqual(plain(state), completed);
});

function legacyState(blankState, result) {
  const state = preparedState(blankState);
  for (const field of [
    'demoScenario', 'submittedAt', 'reviewKind', 'documentRequest',
    'manualReviewRequestedAt', 'serviceUnavailableAt', 'serviceRetried'
  ]) delete state[field];
  state.result = result;
  state.resultUpdatedAt = T1;
  return state;
}

test('legacy pending walkthrough keeps consumer values and advances to verified deterministically', () => {
  const { verification, blankState } = model();
  const state = legacyState(blankState, 'pending');
  state.pendingSince = T0;
  state.view = 'shopping';
  const personal = plain(state.personal);
  const uploads = plain(state.uploads);
  assert.equal(verification.normalize(state), state);
  assert.equal(state.demoScenario, 'verified');
  assert.equal(state.result, 'pending');
  assert.equal(state.reviewKind, 'submission');
  assert.equal(state.pendingSince, T0);
  assert.equal(state.resultUpdatedAt, T1);
  assert.equal(state.view, 'shopping');
  assert.ok(state.submittedAt);
  assert.deepEqual(plain(state.personal), personal);
  assert.deepEqual(plain(state.uploads), uploads);
  assert.equal(verification.advance(state, T2), true);
  assert.equal(state.result, 'verified');
  assert.equal(state.verifiedAt, T2);
  assert.equal(state.view, 'shopping');
});

test('legacy action-required walkthrough gets a stable recoverable document request', () => {
  const { verification, blankState } = model();
  const state = legacyState(blankState, 'docs');
  verification.normalize(state);
  assert.equal(state.result, 'docs');
  assert.equal(state.documentRequest.key, 'income');
  assert.equal(state.documentRequest.requestedAt, T1);
  const normalized = plain(state);
  verification.normalize(state);
  assert.deepEqual(plain(state), normalized);
  assert.equal(verification.stageReplacement(state, { name: 'sample-replacement.pdf', size: 1000 }), null);
  assert.equal(verification.submitReplacement(state, T2), true);
  assert.equal(state.result, 'pending');
  assert.equal(verification.advance(state, T3), true);
  assert.equal(state.result, 'verified');
});

test('legacy verified walkthrough retains its result and cannot submit again', () => {
  const { verification, blankState } = model();
  const state = legacyState(blankState, 'verified');
  state.verifiedAt = T0;
  state.subsidy = 400;
  verification.normalize(state);
  assert.equal(state.result, 'verified');
  assert.equal(state.verifiedAt, T0);
  assert.equal(state.subsidy, 400);
  const normalized = plain(state);
  assert.equal(verification.submit(state, T2), false);
  assert.deepEqual(plain(state), normalized);
});

test('legacy not-verified walkthrough can enter manual review', () => {
  const { verification, blankState } = model();
  const state = legacyState(blankState, 'unable');
  verification.normalize(state);
  assert.equal(state.result, 'unable');
  assert.equal(verification.requestManualReview(state, T2), true);
  assert.equal(state.result, 'pending');
  assert.equal(state.manualReviewRequestedAt, T2);
  assert.equal(verification.advance(state, T3), true);
  assert.equal(state.result, 'verified');
});

test('required documents use the passed consumer answers instead of unrelated live state', () => {
  const { blankState, requiredDocs } = model();
  const state = preparedState(blankState);
  state.citizenship.citizen = 'no';
  state.residence.twelve = 'no';
  assert.deepEqual(plain(requiredDocs(state).map(doc => doc.key)), ['income', 'immigration', 'residency']);
  state.citizenship.citizen = 'yes';
  state.residence.twelve = 'yes';
  assert.deepEqual(plain(requiredDocs(state).map(doc => doc.key)), ['income']);
});

test('refreshing status at welcome refreshes demo controls without routing to a result', () => {
  const { app, blankState, setState } = model();
  setState(blankState());
  const destinations = [];
  app.renderDemoControls = () => destinations.push('demo-controls');
  app.showResult = () => destinations.push('result');
  app.showDashboard = () => destinations.push('dashboard');
  app.showShopping = () => destinations.push('shopping');
  app.refreshCaseView();
  assert.deepEqual(destinations, ['demo-controls']);
});

for (const fixture of [
  { path: null, step: 0, want: 0 },
  { path: null, step: 8, want: 0 },
  { path: 'new', step: 0, want: 1 },
  { path: 'new', step: 4, want: 4 },
  { path: 'returning', step: 8, want: 7 }
]) {
  test(`continue verification routes path=${fixture.path}, step=${fixture.step} to step ${fixture.want}`, () => {
    const { app, blankState, setState } = model();
    const state = blankState();
    state.path = fixture.path;
    state.step = fixture.step;
    setState(state);
    const destinations = [];
    app.show = step => destinations.push(step);
    app.continueVerification();
    assert.deepEqual(destinations, [fixture.want]);
  });
}
