import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeAuthUser } from './auth.js';

const user = { id: 7, name: 'Elena Petrova', role: 'user' };

test('normalizes direct and wrapped /auth/me payloads', () => {
  assert.deepEqual(normalizeAuthUser(user), user);
  assert.deepEqual(normalizeAuthUser({ data: user }), user);
  assert.deepEqual(normalizeAuthUser({ user }), user);
  assert.deepEqual(normalizeAuthUser({ data: { user } }), user);
});

test('rejects empty auth payloads', () => {
  assert.equal(normalizeAuthUser(null), null);
  assert.equal(normalizeAuthUser(undefined), null);
});
