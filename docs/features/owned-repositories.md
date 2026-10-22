# Owned repositories

`owned-repositories.json` records exact personal repository identities that have no
upstream. It does not change the `simpsonm09-org` roster or grant access by itself.

## Policy shape

The file contains one `repositories` array. Each entry contains only `repository` and
`agentAccess`.

```json
{
  "repositories": [
    {
      "repository": "simpsonm09/example",
      "agentAccess": "propose"
    }
  ]
}
```

The owner must be `simpsonm09`, without regard to case. The identity must use the
`owner/repository` form. The only supported access value is `propose`. The committed
array is empty.

## Validation

`scripts/validate.mjs` validates this file and `owned-forks.json` before it queries the
organization roster. The validator rejects malformed identities, other owners, unknown
fields, duplicate identities, and identities that match an owned-fork target or upstream.
`just test-policy` runs both policy test files without querying GitHub.

This catalog validator checks the record shape. A record does not affect the installed
agent-access gate until a separate resolver and plugin change consumes the policy.
