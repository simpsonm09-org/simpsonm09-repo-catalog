# Fleet policy

The catalog answers which repositories the framework covers and what each one owes.
The standard in [`repo-standard`](https://github.com/simpsonm09-org/simpsonm09-repo-standard)
answers what conformance means. This page records the intent that GitHub cannot
report, so the checks have something to check against.

## Tiers

| Tier | Owes |
| --- | --- |
| `standard` | The standard, the checkers, the reusable workflows, and the rulesets. |
| `template` | A byte-identical reference implementation of the standard. |
| `catalog` | This roster and policy. |
| `plugin` | A published plugin layer that consumes the standard. |
| `tooling` | Developer and machine tooling that consumes the standard. |
| `feature` | An application that consumes the standard. |
| `legacy` | A repository kept for reference but outside the fleet. |

## Expectations

Every non-legacy repository carries the standard's community files, the docs layout,
the pinned caller CI, a `protect-main` ruleset, the owner topic, and public-repo
secret scanning and push protection. A repository's own CI runs the `standard` check,
which covers the tree-local files plus the settings, topics, and ruleset the
repository can read about itself. No repository audits another.

## Membership

Every organization repository is either in `repos.json` or in `ignore.json` with a
reason. `scripts/validate.mjs` fails when the roster and the organization disagree,
so a new repository cannot appear unnoticed.

## What does not belong here

Visibility, settings, topics, ruleset names, and CI conclusions are state. Read them
live from GitHub. A second copy of state in this repository would rot.
