# SCIM Sandbox - Server Load Test

This repository is the standalone k6 load-test harness for the SCIM Sandbox server.

## What Is In This Repo

- `main.js` wires the scenarios together and defines the k6 thresholds.
- `scenarios/` contains the request flows for discovery, user CRUD, group CRUD, filtering and search, and bulk operations.
- `src/` contains the shared SCIM client wrapper, runtime configuration helpers, and payload generators.
- `package.json` defines the package version and the local npm entry points.
- `config.json` holds local-only defaults for the target URL, run profile, and workspace credentials.

## Scenario Overview

The current harness covers:

- service discovery endpoints
- user CRUD flows
- group CRUD flows
- filtering and search flows
- bulk operations

## Working With The Harness

Run the default suite with `npm run test` or `k6 run main.js`.

Use `npm run test:discovery` or `npm run test:bulk` for the packaged targeted flows. For `user_crud`, `group_crud`, or `filtering`, run k6 directly with `ONLY_SCENARIO` set in the environment.

When you override runtime settings, environment variables take precedence over `config.json`, followed by the defaults in `src/config.js`.

Runtime variables:

- `BASE_URL`: SCIM API base URL
- `VUS`: virtual users
- `DURATION`: run duration
- `ONLY_SCENARIO`: one of `all`, `discovery`, `user_crud`, `group_crud`, `filtering`, or `bulk`
- `WORKSPACES_JSON`: JSON array of `{ "id": "...", "token": "..." }` entries

Example:

```bash
BASE_URL=https://api.example.com \
VUS=25 \
DURATION=2m \
ONLY_SCENARIO=user_crud \
WORKSPACES_JSON='[{"id":"ws1","token":"<token>"}]' \
k6 run main.js
```

## Versioning

The release version is stored in [`package.json`](./package.json). The GitHub release workflow publishes the current package version as `vX.Y.Z`, creates a release bundle from the harness sources, and then bumps the package patch version on `main` for the next development cycle.

Release bundles contain the harness sources, documentation, and a sanitized `config.json` template. Environment-specific runtime configuration should be supplied locally rather than taken from a published asset.

## Validation

Before merging a change, run the smallest useful load test against a non-production SCIM deployment and verify that the expected k6 checks and thresholds still behave as intended. Shared config or client changes should be exercised with the full suite; single-flow changes can be validated with a targeted scenario run.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

See [SECURITY.md](./SECURITY.md).
