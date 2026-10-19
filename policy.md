# Fleet policy

The catalog answers which repositories the framework covers and what each one owes.
The standard in [`repo-standard`](https://github.com/simpsonm09-org/simpsonm09-repo-standard)
answers what conformance means. This page records the intent that GitHub cannot
report, so the checks have something to check against.

## Tiers

| Tier | Owes |
| --- | --- |
| `standard` | The standard, the checkers, the reusable workflows, and the rulesets. |
| `template` | A reference implementation of the standard. Its community files, `.aislop/config.yml`, `.github/config/flint.toml`, `trivy.yaml`, `CODEOWNERS`, and `pin-update.yml` match the standard's copies byte for byte. Its `ci.yml`, `dependabot.yml`, `mise.toml`, `justfile`, and `.gitattributes` differ by design. |
| `catalog` | This roster and policy. |
| `plugin` | A published plugin layer that consumes the standard. |
| `tooling` | Developer and machine tooling that consumes the standard. |
| `feature` | An application that consumes the standard. |
| `fixture` | A conformance repository used to validate the framework, not a product. |
| `legacy` | A repository kept for reference but outside the fleet. |

## Expectations

Every non-legacy repository carries the standard's community files, the docs layout,
the pinned caller CI, a `protect-main` ruleset, the owner topic, and public-repo
secret scanning and push protection. A repository's own CI runs the `standard` check,
which covers the tree-local files plus the settings, topics, and ruleset the
repository can read about itself. No repository audits another.

A repository may add a second test job named `test-<suffix>`. maxstack runs its installer
suite as `test-node` on a Windows runner, in addition to `test`.

## Membership

Every organization repository is either in `repos.json` or in `ignore.json` with a
reason. `scripts/validate.mjs` fails when the roster and the organization disagree,
so a new repository cannot appear unnoticed.

## Agent access

Each repository states how much an AI agent may do against the organization
repository. The value is intent. GitHub has no such setting, and enforcement lives in
[`repo-standard`](https://github.com/simpsonm09-org/simpsonm09-repo-standard), not
here. Until an agent runs as an identity separate from the maintainer, the value is a
documented policy, not a control.

`repos.json` sets a default per tier in `agentAccessDefaults`, and a repository may
override it with `agentAccess`. The effective level is `agentAccess` when present,
otherwise the tier default.

| Level | Agent may | Mechanism once enforced |
| --- | --- | --- |
| `none` | Nothing. No credential reaches the organization repository. | No identity grant. |
| `read` | Clone, fetch, read. | No agent App installation. The standard gives `none` and `read` no installation. |
| `propose` | Push a branch and open a pull request, never merge. | Write access, the agent absent from the ruleset bypass list, and at least one required approval the agent cannot give. |
| `merge` | Merge its own green pull requests, with no direct push to `main`. | The agent in the bypass list with mode `pull_request`. |
| `full` | Push to `main` or change settings. | The agent in the bypass list with mode `always`. The agent App requests no `administration` permission, so it cannot change settings or rulesets. |

`propose` needs at least one required approval that the agent cannot give. The
standard's committed [`protect-main.json`](https://github.com/simpsonm09-org/simpsonm09-repo-standard/blob/main/rulesets/protect-main.json)
sets `required_approving_review_count` to `1`. Its only bypass actor is
`OrganizationAdmin` in `pull_request` mode. This describes the committed file, not
the live GitHub ruleset, which this catalog does not read. The agent App's bypass
entry is not in that file. The standard's
[`governance guide`](https://github.com/simpsonm09-org/simpsonm09-repo-standard/blob/main/docs/governance.md)
and its [`agent-access guide`](https://github.com/simpsonm09-org/simpsonm09-repo-standard/blob/main/docs/features/agent-access.md)
describe the App and the drift check.

The fleet agent's GitHub App entry on each repository's `protect-main` ruleset follows the
standard's [bypass actors table](https://github.com/simpsonm09-org/simpsonm09-repo-standard/blob/main/docs/governance.md#bypass-actors).
It is absent for `none`, `read`, and `propose`, mode `pull_request` for `merge`, and mode
`always` for `full`. No actor id is recorded here.

## Personally owned forks

`owned-forks.json` records repositories owned by `simpsonm09` and the upstream repository
each fork came from. It does not add a repository to the `simpsonm09-org` roster or change
the organization membership reconciliation. Each entry names both repositories as
fully qualified `owner/repository` identities. The target must belong to `simpsonm09`.
The upstream records provenance and never grants write access.

The collection accepts only `propose`. For a personally owned target, `propose` means an
agent may push a branch and open a pull request. It does not allow merging or pushing to
`main`. A third-party upstream never receives pull requests or writes from this policy.
A missing policy file or malformed, duplicate, or unsupported entry fails local
validation. This validator checks policy data only. It does not grant access in the
installed gate.

Deployment is staged. The repo-standard resolver must read `owned-forks.json`, and the
organization plugin must add a target-aware adapter before this policy can affect gate
decisions. The adapter must keep upstreams read-only and restrict `propose` to the owned
target. Update pinned standard versions and apply the workspace after those changes land.
Until then, pstack writes remain denied.

The tier defaults.

| Tier | Default |
| --- | --- |
| `standard` | `merge` |
| `template` | `merge` |
| `catalog` | `merge` |
| `plugin` | `merge` |
| `tooling` | `merge` |
| `feature` | `merge` |
| `fixture` | `read` |
| `legacy` | `none` |

## What does not belong here

Visibility, settings, topics, ruleset names, and CI conclusions are state. Read them
live from GitHub. A second copy of state in this repository would rot.
