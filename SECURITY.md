# Security Policy

## Supported Versions

This repository supports the latest code on the `main` branch and the latest release artifact built from that branch.

Because this repository is a standalone load-test harness, it does not maintain long-lived release branches. Fixes are expected to land on `main` first.

## Reporting a Vulnerability

Do not open public GitHub issues for security vulnerabilities.

Use GitHub Security Advisories for private reporting:

1. Open the repository Security tab.
2. Select Advisories.
3. Create a new draft security advisory.
4. Include the affected file(s), reproduction steps, impact, and any suggested mitigation.

If GitHub private reporting is unavailable, use the maintainer contact options on the GitHub profile.

## Scope of Security Review

Security-sensitive areas in this repository include:

- local runtime configuration in `config.json` and `src/config.js`
- bearer token handling and request headers in `src/scim-client.js`
- scenario payloads and filters under `scenarios/`
- release workflow steps that package or publish the harness

## Operational Guidance

If you run this harness outside a private sandbox, apply these controls first:

1. Use only SCIM targets that you are authorized to load test.
2. Protect workspace IDs, bearer tokens, and copied run output as secrets.
3. Prefer environment overrides for shared or automated runs instead of committing local config changes.
4. Review scenario concurrency and thresholds before pointing the harness at a shared environment.
5. Keep release bundles, logs, and exported results free of environment-specific secrets.

## Secrets Handling

- Do not commit workspace tokens, bearer tokens, passwords, or API keys.
- Do not publish environment-specific `config.json` contents in releases, issues, or logs.
- Treat base URLs, workspace identifiers, and traffic captures as sensitive unless they are intentionally public.
- Rotate any credentials used for load testing if they are exposed.

## Current Mitigations

The repository currently relies on these baseline controls:

- environment-variable overrides for runtime settings
- a single authenticated SCIM client wrapper
- scenario-level selection for targeted validation
- k6 checks and thresholds that surface unexpected failure rates and latency

## Security Testing Expectations

When changing auth handling, request construction, payload generation, or release packaging, contributors should validate the affected flow against a non-production target and confirm that:

- requests authenticate correctly
- no sensitive data is logged, bundled, or committed
- expected error responses are handled intentionally by k6
- the configured load profile matches what you intended to send