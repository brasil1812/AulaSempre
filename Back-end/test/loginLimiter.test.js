import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { blockedFor, registerFailure, registerSuccess, resetLoginLimiter, loginLimits } from '../src/utils/loginLimiter.js';

const { MAX_FAILURES, WINDOW_MS } = loginLimits;
beforeEach(() => resetLoginLimiter());

test('blocks an e-mail after the maximum number of failures', () => {
  const t0 = 1_000_000;
  for (let i = 0; i < MAX_FAILURES - 1; i++) registerFailure('a@x.test', t0 + i);
  assert.equal(blockedFor('a@x.test', t0 + MAX_FAILURES), 0);
  registerFailure('a@x.test', t0 + MAX_FAILURES);
  assert.ok(blockedFor('a@x.test', t0 + MAX_FAILURES + 1) > 0);
  assert.equal(blockedFor('outro@x.test', t0 + MAX_FAILURES + 1), 0, 'other accounts are not affected');
});

test('block expires after the window', () => {
  const t0 = 2_000_000;
  for (let i = 0; i < MAX_FAILURES; i++) registerFailure('b@x.test', t0);
  assert.ok(blockedFor('b@x.test', t0 + WINDOW_MS - 1000) > 0);
  assert.equal(blockedFor('b@x.test', t0 + WINDOW_MS), 0);
});

test('failures older than the window do not accumulate', () => {
  const t0 = 3_000_000;
  for (let i = 0; i < MAX_FAILURES - 1; i++) registerFailure('c@x.test', t0);
  registerFailure('c@x.test', t0 + WINDOW_MS + 1);
  assert.equal(blockedFor('c@x.test', t0 + WINDOW_MS + 2), 0);
});

test('a successful login clears the failures', () => {
  const t0 = 4_000_000;
  for (let i = 0; i < MAX_FAILURES - 1; i++) registerFailure('d@x.test', t0);
  registerSuccess('d@x.test');
  registerFailure('d@x.test', t0 + 1);
  assert.equal(blockedFor('d@x.test', t0 + 2), 0);
});
