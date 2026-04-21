# Contributing

Thanks for contributing to scim-server-load-test.

This repository is intentionally small. It only contains the k6 load-test harness for the SCIM Sandbox server. Keep changes focused on scenario coverage, request helpers, runtime configuration, release packaging, and documentation that matches the live repository structure.

## Ground Rules

- Keep each change narrow and intentional.
- Prefer readable k6 scripts and explicit request flow over clever abstractions.
- Do not commit workspace tokens, bearer tokens, passwords, or environment-specific target details.
- Do not mix unrelated refactors into scenario or configuration changes.
- Keep generated outputs, logs, and one-off local config out of commits.

## Before You Start

1. Check for existing issues or pull requests that cover the same workload or scenario change.
2. For non-trivial scenario changes, describe the target behavior and expected SCIM responses before you start coding.
3. Keep shared logic in `src/` and scenario steps in `scenarios/`.
4. If the release flow or packaging changes, update `.github/workflows/release.yml`, `README.md`, and this document together.

## Current Test Surface

The repository currently covers SCIM service discovery, user CRUD, group CRUD, filtering and search, and bulk operations. If your change affects shared config, auth handling, or threshold behavior, call that out clearly in the PR description so reviewers can understand the impact.

## Scenario and Config Conventions

- Keep one logical scenario behavior change per PR when possible.
- Prefer additive scenario coverage instead of rewriting established flows without cause.
- Use `ONLY_SCENARIO` for targeted local validation when you do not need the full suite.
- Keep local defaults in `config.json`, but avoid storing real secrets or durable environment data there.
- Keep file and function names aligned with the existing `main.js`, `scenarios/`, and `src/` structure.

## Validation

Validate changes against a non-production SCIM deployment before opening a PR.

Common checks:

- run the affected scenario with `npm run test` or a targeted `k6 run`
- verify expected SCIM status codes and k6 checks
- confirm any auth or config changes still work with environment overrides

## Pull Request Checklist

Before opening a PR, make sure it:

- explains the scenario or config change and why it is needed
- updates docs when the runtime model, release flow, or local setup changes
- avoids unrelated cleanup
- validates the affected scenario or suite against a safe target
- does not commit secrets, tokens, or environment-specific data

## Reporting Bugs

When reporting a load-test problem, include:

- the scenario name or entry point
- the target SCIM server or version if relevant
- the failing request or check
- the expected versus actual behavior
- the steps used to reproduce the issue

## Security Issues

Do not report vulnerabilities through public issues. Follow [SECURITY.md](./SECURITY.md) instead.