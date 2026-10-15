import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateOwnedForkEntry, validateOwnedForks } from '../scripts/owned-forks.mjs';

const validFork = {
  repository: 'simpsonm09/pstack-max',
  upstream: 'michael-denyer/pstack-claude',
  agentAccess: 'propose',
};

test('accepts a personally owned fork and records its upstream', () => {
  assert.deepEqual(validateOwnedForks({ forks: [validFork] }), []);
});

test('accepts the committed owned-fork policy', () => {
  const policy = JSON.parse(readFileSync(new URL('../owned-forks.json', import.meta.url), 'utf8'));
  assert.deepEqual(validateOwnedForks(policy), []);
});

test('rejects targets outside the authorized owner', () => {
  for (const repository of ['someone-else/pstack-max', 'simpsonm09-org/pstack-max']) {
    assert.ok(validateOwnedForkEntry({ ...validFork, repository }, 0).some((error) => error.includes('must be owned by simpsonm09')));
  }
});

test('rejects repeated repository identities without regard to case', () => {
  assert.ok(validateOwnedForks({ forks: [validFork, { ...validFork, repository: 'SIMPSONM09/PSTACK-MAX' }] })
    .some((error) => error.includes('duplicates')));
});

test('rejects malformed or unqualified identities', () => {
  for (const identity of ['pstack-max', 'simpsonm09/', '/pstack-max', 'simpsonm09/a/b', 'bad owner/repo']) {
    assert.ok(validateOwnedForkEntry({ ...validFork, repository: identity }, 0).some((error) => error.includes('.repository')));
  }
  assert.ok(validateOwnedForkEntry({ ...validFork, upstream: 'upstream' }, 0).some((error) => error.includes('.upstream')));
});

test('rejects line terminators anywhere in fork identities', () => {
  const lineTerminators = ['\n', '\r', '\r\n', '\u2028', '\u2029'];
  for (const terminator of lineTerminators) {
    for (const field of ['repository', 'upstream']) {
      const errors = validateOwnedForkEntry({ ...validFork, [field]: `${validFork[field]}${terminator}` }, 0);
      assert.ok(errors.some((error) => error.includes(`.${field} must be a fully qualified`)),
        `${field} accepted a trailing ${JSON.stringify(terminator)}`);
    }
    const ownerError = validateOwnedForkEntry({
      ...validFork,
      repository: `simpsonm09${terminator}/pstack-max`,
    }, 0);
    assert.ok(ownerError.some((error) => error.includes('.repository must be a fully qualified')),
      `repository owner accepted ${JSON.stringify(terminator)}`);
  }
});

test('rejects unsupported access levels and unknown policy fields', () => {
  assert.ok(validateOwnedForkEntry({ ...validFork, agentAccess: 'merge' }, 0).some((error) => error.includes('agentAccess')));
  assert.ok(validateOwnedForks({ forks: [validFork], org: 'simpsonm09-org' }).some((error) => error.includes('unknown field')));
});

test('rejects a repository that names itself as upstream without regard to case', () => {
  assert.ok(validateOwnedForkEntry({ ...validFork, upstream: 'SIMPSONM09/PSTACK-MAX' }, 0)
    .some((error) => error.includes('must be distinct')));
});

test('rejects malformed collection shapes', () => {
  assert.ok(validateOwnedForks({}).some((error) => error.includes('forks must be an array')));
  assert.ok(validateOwnedForks({ forks: [null] }).some((error) => error.includes('must be an object')));
});
