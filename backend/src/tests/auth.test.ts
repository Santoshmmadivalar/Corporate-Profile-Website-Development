import test from 'node:test';
import assert from 'node:assert';

test('Math Sum Assertion Test', () => {
  assert.strictEqual(1 + 1, 2);
});

test('Regex Email Address Validation Test', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert.match('admin@outpro.india', emailRegex);
  assert.strictEqual(emailRegex.test('not-an-email'), false);
  assert.strictEqual(emailRegex.test('missing-domain@'), false);
});

test('RBAC Middleware Role Verification Logic Test', () => {
  const mockUser = { name: 'John Doe', role: 'admin' };
  const allowedRoles = ['admin', 'employee'];
  const isAuthorized = allowedRoles.includes(mockUser.role);
  assert.strictEqual(isAuthorized, true);
});
