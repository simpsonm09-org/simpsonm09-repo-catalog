# Fleet roadmap

The intent the roster does not carry: what the fleet is building next. State lives on
GitHub; this page holds goals and open work.

## Goals

1. Every repository ships code a reviewer trusts: real linting, tests that gate, and a
   proof of behavior on the real artifact.
2. A change lands through one pull request that runs the same checks locally and in CI.
3. An agent can work in any repository from its `just` entry points and its docs alone.
4. No secret, credential, or machine path is ever committed, and every public repository
   carries branch protection and security scanning.

## Done

- The standard, the reusable workflows, the rulesets, and the two checkers.
- The gates: signed commits and the `test` check are required, and a definition of done
  backs the pull request checklist.
- A report-only Trivy license scan.
- Dependabot as the single updater.
- Kotlin and Java in the shared lint table, so a JVM repository lints through the same job.
- A generated-OpenAPI contract rule: an API repository emits its document from annotations, and the checker fails a hand edit or a missing `spec` recipe.
- The standard's committed `protect-main.json` requires one approval. Live ruleset
  deployment is not recorded here.

## Open

- Language linting. Pin the per-language linters and formatters in each repository's
  `mise.toml` and run them through the shared lint job. See the standard's
  [`linting`](https://github.com/simpsonm09-org/simpsonm09-repo-standard/blob/main/docs/linting.md).
- CodeQL. A repository carries it when it has executable source in a language CodeQL
  supports. It is never a required check. It is not yet on `simpsonm09-maxstack`,
  `simpsonm09-dev-setup`, `simpsonm09-fixture-nest`, `simpsonm09-fixture-go`,
  `simpsonm09-fixture-rust`, `simpsonm09-fixture-dotnet`, `simpsonm09-machine-inventory`,
  or `simpsonm09-repo-template`. See the standard's
  [`automation`](https://github.com/simpsonm09-org/simpsonm09-repo-standard/blob/main/docs/automation.md#codeql).
- Coverage. A repository with a coverage job requires `coverage / coverage`. The two
  records repositories, `simpsonm09-repo-catalog` and `simpsonm09-machine-inventory`, are
  excepted. `simpsonm09-maxstack` and `simpsonm09-dev-setup` are excepted as not
  measurable in part, and are to be revisited, because their Node code could be measured.
  The declaration is in the standard's
  [`exceptions.json`](https://github.com/simpsonm09-org/simpsonm09-repo-standard/blob/main/docs/exceptions.json).
  This repository holds no second declaration.
- Verification. A per-repository verification skill, a container build smoke job for the
  image repositories, and an end-to-end job for the Playwright and Postman repositories.
- Releases. The release workflow and a changelog are adopted in `simpsonm09-browser-calculator`,
  `simpsonm09-postman-test-utils`, and `simpsonm09-playwright-api-wrapper`. The other
  feature repositories and the fixtures have neither yet.
- Plugin identifiers. Align the OpenCode plugin ids with the repository names.
- Agent access. The agent identity is defined in `repo-standard`: the App manifest, the
  `just create-agent-app` flow, the per-level bypass entry the ruleset apply script adds,
  and the drift check `check-agent-access`. Still open: run the drift check against the
  live rulesets, since it is local and not in CI, and confirm the App's private key is held
  in Infisical. The committed `protect-main.json` requires one approval.

## How open work lands

The standard changes in `simpsonm09-repo-standard` first, then roll out to the fleet
through same-repo pull requests on the organization. Each wave ends in a verified state,
checked by each repository's own `standard` job, which runs `check-repo`. A maintainer
may also run the standard's local `audit-fleet` over sibling checkouts. This local audit
does not run in a consuming repository's CI and does not query another repository
through the API.
