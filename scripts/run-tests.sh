#!/bin/bash

# Navigate to the scim-server-load-test directory
# This ensures that k6 runs from the root of the load test module
cd "$(dirname "$0")/.." || exit 1

WORKSPACES_FILE="scripts/workspaces.local.json"

if [ -f "$WORKSPACES_FILE" ]; then
    echo "Running tests with credentials from $WORKSPACES_FILE..."
    k6 run --env WORKSPACES_JSON="$(cat "$WORKSPACES_FILE")" main.js
else
    echo "Error: $WORKSPACES_FILE not found."
    echo "Please create it and provide real workspace credentials before running tests."
    exit 1
fi
