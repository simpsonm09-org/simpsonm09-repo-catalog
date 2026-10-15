const OWNED_OWNER = 'simpsonm09';
const ACCESS_LEVEL = 'propose';
const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;

function isFullyQualifiedRepository(value) {
  if (typeof value !== 'string') return false;

  const parts = value.split('/');
  return parts.length === 2 && OWNER_PATTERN.test(parts[0]) && REPOSITORY_PATTERN.test(parts[1]);
}

function onlyKeys(value, allowed) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

export function validateOwnedForkEntry(entry, index) {
  const errors = [];
  const label = `forks[${index}]`;

  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    return [`${label} must be an object`];
  }
  if (!onlyKeys(entry, ['repository', 'upstream', 'agentAccess'])) {
    errors.push(`${label} has an unknown field`);
  }
  if (!isFullyQualifiedRepository(entry.repository)) {
    errors.push(`${label}.repository must be a fully qualified owner/repository identity`);
  } else if (entry.repository.split('/')[0].toLowerCase() !== OWNED_OWNER) {
    errors.push(`${label}.repository must be owned by ${OWNED_OWNER}`);
  }
  if (!isFullyQualifiedRepository(entry.upstream)) {
    errors.push(`${label}.upstream must be a fully qualified owner/repository identity`);
  }
  if (isFullyQualifiedRepository(entry.repository) && isFullyQualifiedRepository(entry.upstream)
      && entry.repository.toLowerCase() === entry.upstream.toLowerCase()) {
    errors.push(`${label}.repository and ${label}.upstream must be distinct`);
  }
  if (entry.agentAccess !== ACCESS_LEVEL) {
    errors.push(`${label}.agentAccess must be ${ACCESS_LEVEL}`);
  }

  return errors;
}

export function validateOwnedForks(policy) {
  if (policy === null || typeof policy !== 'object' || Array.isArray(policy)) {
    return ['owned-forks.json must contain an object'];
  }

  const errors = [];
  if (!onlyKeys(policy, ['forks'])) errors.push('owned-forks.json has an unknown field');
  if (!Array.isArray(policy.forks)) return [...errors, 'owned-forks.json.forks must be an array'];

  const repositories = new Set();
  for (const [index, entry] of policy.forks.entries()) {
    errors.push(...validateOwnedForkEntry(entry, index));
    if (entry !== null && typeof entry === 'object' && !Array.isArray(entry)
        && isFullyQualifiedRepository(entry.repository)) {
      const identity = entry.repository.toLowerCase();
      if (repositories.has(identity)) errors.push(`forks[${index}].repository duplicates ${entry.repository}`);
      repositories.add(identity);
    }
  }

  return errors;
}
