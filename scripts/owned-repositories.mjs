const OWNED_OWNER = 'simpsonm09';
const ACCESS_LEVEL = 'propose';
const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;
const LINE_TERMINATORS = /[\r\n\u2028\u2029]/;

function isFullyQualifiedRepository(value) {
  if (typeof value !== 'string' || LINE_TERMINATORS.test(value)) return false;

  const parts = value.split('/');
  return parts.length === 2 && OWNER_PATTERN.test(parts[0]) && REPOSITORY_PATTERN.test(parts[1]);
}

function onlyKeys(value, allowed) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function forkIdentities(ownedForks) {
  if (!Array.isArray(ownedForks?.forks)) return new Set();

  const identities = new Set();
  for (const fork of ownedForks.forks) {
    if (fork === null || typeof fork !== 'object' || Array.isArray(fork)) continue;
    for (const identity of [fork.repository, fork.upstream]) {
      if (isFullyQualifiedRepository(identity)) identities.add(identity.toLowerCase());
    }
  }
  return identities;
}

export function validateOwnedRepositoryEntry(entry, index, reservedIdentities = new Set()) {
  const errors = [];
  const label = `repositories[${index}]`;

  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    return [`${label} must be an object`];
  }
  if (!onlyKeys(entry, ['repository', 'agentAccess'])) {
    errors.push(`${label} has an unknown field`);
  }
  if (!isFullyQualifiedRepository(entry.repository)) {
    errors.push(`${label}.repository must be a fully qualified owner/repository identity`);
  } else {
    const [owner] = entry.repository.split('/');
    if (owner.toLowerCase() !== OWNED_OWNER) {
      errors.push(`${label}.repository must be owned by ${OWNED_OWNER}`);
    }
    if (reservedIdentities.has(entry.repository.toLowerCase())) {
      errors.push(`${label}.repository collides with an owned-fork target or upstream`);
    }
  }
  if (entry.agentAccess !== ACCESS_LEVEL) {
    errors.push(`${label}.agentAccess must be ${ACCESS_LEVEL}`);
  }

  return errors;
}

export function validateOwnedRepositories(policy, ownedForks = { forks: [] }) {
  if (policy === null || typeof policy !== 'object' || Array.isArray(policy)) {
    return ['owned-repositories.json must contain an object'];
  }

  const errors = [];
  if (!onlyKeys(policy, ['repositories'])) errors.push('owned-repositories.json has an unknown field');
  if (!Array.isArray(policy.repositories)) {
    return [...errors, 'owned-repositories.json.repositories must be an array'];
  }

  const reservedIdentities = forkIdentities(ownedForks);
  const repositories = new Set();
  for (const [index, entry] of policy.repositories.entries()) {
    errors.push(...validateOwnedRepositoryEntry(entry, index, reservedIdentities));
    if (entry !== null && typeof entry === 'object' && !Array.isArray(entry)
        && isFullyQualifiedRepository(entry.repository)) {
      const identity = entry.repository.toLowerCase();
      if (repositories.has(identity)) errors.push(`repositories[${index}].repository duplicates ${entry.repository}`);
      repositories.add(identity);
    }
  }

  return errors;
}
