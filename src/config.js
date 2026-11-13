import { SharedArray } from 'k6/data';
import exec from 'k6/execution';

function normalizeBaseUrl(url) {
    let normalized = String(url).trim();
    while (normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }
    return normalized;
}

function parsePositiveInt(rawValue, fallback) {
    if (rawValue === undefined || rawValue === '') {
        return fallback;
    }
    const parsed = Number.parseInt(String(rawValue), 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error(`Invalid integer configuration value "${rawValue}": expected a positive integer.`);
    }
    return parsed;
}

function isAbsolutePath(filePath) {
    return filePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(filePath);
}

function readWorkspacesFile(filePath) {
    const trimmed = String(filePath).trim();
    if (!trimmed) {
        throw new Error('WORKSPACES_FILE must not be empty.');
    }
    if (isAbsolutePath(trimmed)) {
        return open(trimmed);
    }
    const normalizedRel = trimmed.startsWith('./') ? trimmed.slice(2) : trimmed;
    try {
        return open(`../${normalizedRel}`);
    } catch {
        return open(trimmed);
    }
}

function isValidWorkspaceEntry(entry) {
    return Boolean(
        entry &&
        typeof entry.id === 'string' &&
        entry.id.trim().length > 0 &&
        typeof entry.token === 'string' &&
        entry.token.trim().length > 0
    );
}

function normalizeWorkspaces(parsed, sourceName) {
    const list = Array.isArray(parsed) ? parsed : parsed?.WORKSPACES;
    if (!Array.isArray(list) || list.length === 0) {
        throw new Error(`${sourceName} must contain a non-empty array of { id, token } workspace entries.`);
    }
    for (const entry of list) {
        if (!isValidWorkspaceEntry(entry)) {
            throw new Error(`${sourceName} contains an invalid workspace entry: non-empty "id" and "token" strings are required.`);
        }
    }
    return list;
}

const fileConfig = JSON.parse(open('../config.json'));

export const CONFIG = {
    // Base setup
    BASE_URL: normalizeBaseUrl(__ENV.BASE_URL || fileConfig.BASE_URL || 'http://localhost:8080'),

    // Runtime behavior
    VUS: parsePositiveInt(__ENV.VUS, fileConfig.VUS || 5),
    DURATION: __ENV.DURATION || fileConfig.DURATION || '30s',

    // We can define which scenarios to run if we want filtering
    ONLY_SCENARIO: __ENV.ONLY_SCENARIO || fileConfig.ONLY_SCENARIO || 'all',

    // Schemas used in payloads
    SCHEMAS: {
        USER: 'urn:ietf:params:scim:schemas:core:2.0:User',
        ENTERPRISE_USER: 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User',
        GROUP: 'urn:ietf:params:scim:schemas:core:2.0:Group',
        BULK_REQUEST: 'urn:ietf:params:scim:api:messages:2.0:BulkRequest'
    }
};

const workspacesConfig = new SharedArray('workspaces', function () {
    // Prefer loading workspace credentials from a local file path so tokens stay out of CLI argv
    if (__ENV.WORKSPACES_FILE) {
        const parsed = JSON.parse(readWorkspacesFile(__ENV.WORKSPACES_FILE));
        return normalizeWorkspaces(parsed, 'WORKSPACES_FILE');
    }
    // Backward-compatible fallback when WORKSPACES_JSON is provided in the environment
    if (__ENV.WORKSPACES_JSON) {
        const parsed = JSON.parse(__ENV.WORKSPACES_JSON);
        return normalizeWorkspaces(parsed, 'WORKSPACES_JSON');
    }
    const c = JSON.parse(open('../config.json'));
    return normalizeWorkspaces(c.WORKSPACES || [{ id: 'default', token: 'test-token' }], 'config.json');
});

export function getActiveWorkspace() {
    // If we call this during the initialization phase outside a VU
    if (!exec?.vu) {
        return workspacesConfig[0];
    }
    // Round-robins cleanly based on the sequential unique identifier of this specific Virtual User.
    const index = exec.vu.idInTest % workspacesConfig.length;
    return workspacesConfig[index];
}

export function getBasePath() {
    return `/ws/${encodeURIComponent(getActiveWorkspace().id)}/scim/v2`;
}

export function getFullUrl(path) {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${CONFIG.BASE_URL}${getBasePath()}${p}`;
}
