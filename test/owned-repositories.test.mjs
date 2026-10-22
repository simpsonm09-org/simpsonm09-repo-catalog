import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateOwnedRepositoryEntry, validateOwnedRepositories } from '../scripts/owned-repositories.mjs';

const validRepository = {
  repository: 'simpsonm09/simpsonm09',
  agentAccess: 'propose',
};

const ownedForks = {
  forks: [{
    repository: 'simpsonm09/pstack-max',
    upstream: 'michael-denyer/pstack-claude',
    agentAccess: 'propose',
  }],
};

test('accepts an exact personal repository identity with propose access', () => {
  assert.deepEqual(validateOwnedRepositories({ repositories: [validRepository] }), []);
  assert.deepEqual(validateOwnedRepositoryEntry(validRepository, 0), []);
});

test('accepts the committed empty policy', () => {
  const policy = JSON.parse(readFileSync(new URL('../owned-repositories.json', import.meta.url), 'utf8'));
  assert.deepEqual(validateOwnedRepositories(policy), []);
  assert.deepEqual(policy.repositories, []);
});

test('matches the owner without regard to case', () => {
  assert.deepEqual(validateOwnedRepositories({
    repositories: [{ ...validRepository, repository: 'SIMPSONM09/SIMPSONM09' }],
  }), []);
});

test('rejects other owners', () => {
  for (const repository of ['someone-else/profile', 'simpsonm09-org/profile']) {
    assert.ok(validateOwnedRepositoryEntry({ ...validRepository, repository }, 0)
      .some((error) => error.includes('must be owned by simpsonm09')));
  }
});

test('rejects malformed or unqualified identities', () => {
  for (const repository of ['profile', 'simpsonm09/', '/profile', 'simpsonm09/a/b', 'bad owner/profile']) {
    assert.ok(validateOwnedRepositoryEntry({ ...validRepository, repository }, 0)
      .some((error) => error.includes('.repository must be a fully qualified')));
  }
});

test('rejects line terminators in identities', () => {
  for (const terminator of ['\n', '\r', '\r\n', '\u2028', '\u2029']) {
    assert.ok(validateOwnedRepositoryEntry({
      ...validRepository,
      repository: `${validRepository.repository}${terminator}`,
    }, 0).some((error) => error.includes('.repository must be a fully qualified')));
  }
});

test('rejects unsupported access levels and unknown fields', () => {
  assert.ok(validateOwnedRepositoryEntry({ ...validRepository, agentAccess: 'merge' }, 0)
    .some((error) => error.includes('.agentAccess must be propose')));
  assert.ok(validateOwnedRepositoryEntry({ ...validRepository, upstream: 'someone/repo' }, 0)
    .some((error) => error.includes('unknown field')));
  assert.ok(validateOwnedRepositories({ repositories: [], org: 'simpsonm09-org' })
    .some((error) => error.includes('unknown field')));
});

test('rejects duplicate identities without regard to case', () => {
  assert.ok(validateOwnedRepositories({ repositories: [
    validRepository,
    { ...validRepository, repository: 'SIMPSONM09/SIMPSONM09' },
  ] }).some((error) => error.includes('duplicates')));
});

test('rejects collisions with fork targets and upstream provenance', () => {
  for (const repository of ['simpsonm09/pstack-max', 'michael-denyer/pstack-claude']) {
    assert.ok(validateOwnedRepositories({
      repositories: [{ ...validRepository, repository }],
    }, ownedForks).some((error) => error.includes('collides with an owned-fork')));
  }
});

test('rejects malformed collection shapes', () => {
  assert.ok(validateOwnedRepositories({}).some((error) => error.includes('repositories must be an array')));
  assert.ok(validateOwnedRepositories({ repositories: [null] }).some((error) => error.includes('must be an object')));
  assert.ok(validateOwnedRepositories(null).some((error) => error.includes('must contain an object')));
});
