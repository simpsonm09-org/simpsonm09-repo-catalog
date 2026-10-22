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
policy grants `propose` to the exact identity `simpsonm09/simpsonm09`. That grant permits
non-default branch pushes and pull requests within that same repository. It does not
permit default-branch pushes, force pushes, deletions, tag pushes, merges, or administration.

## Validation

`scripts/validate.mjs` validates this file and `owned-forks.json` before it queries the
organization roster. The validator rejects malformed identities, other owners, unknown
fields, duplicate identities, and identities that match an owned-fork target or upstream.
`just test-policy` runs both policy test files without querying GitHub.

This catalog validator checks the record shape. The record affects no installed gate until
the runtime consumer uses the reviewed standard resolver and loads this policy from
committed `upstream/main`. Catalog validation does not prove that an installed consumer
has adopted that resolver or policy.
