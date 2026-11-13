#!/bin/bash
set -euo pipefail

# Navigate to the scim-server-load-test directory
# This ensures that k6 runs from the root of the load test module
cd "$(dirname "$0")/.." || exit 1

WORKSPACES_FILE="${WORKSPACES_FILE:-scripts/workspaces.local.json}"

if [[ -f "$WORKSPACES_FILE" ]]; then
    if [[ -w "$WORKSPACES_FILE" ]]; then
        chmod 600 "$WORKSPACES_FILE"
    fi
    echo "Running tests with credentials from $WORKSPACES_FILE..."
    exec k6 run --env "WORKSPACES_FILE=$WORKSPACES_FILE" "$@" main.js
else
    echo "Error: $WORKSPACES_FILE not found." >&2
    echo "Please create it and provide real workspace credentials before running tests." >&2
    exit 1
fi
