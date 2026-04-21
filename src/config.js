import { SharedArray } from 'k6/data';
import exec from 'k6/execution';

const fileConfig = JSON.parse(open('../config.json'));

export const CONFIG = {
    // Base setup
    BASE_URL: __ENV.BASE_URL || fileConfig.BASE_URL || 'http://localhost:8080',

    // Runtime behavior
    VUS: __ENV.VUS ? parseInt(__ENV.VUS) : (fileConfig.VUS || 5),
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
    // Prioritize explicit ENV JSON or fallback to the config.json file array
    if (__ENV.WORKSPACES_JSON) {
        return JSON.parse(__ENV.WORKSPACES_JSON);
    }
    const c = JSON.parse(open('../config.json'));
    return c.WORKSPACES || [{ id: "default", token: "test-token" }];
});

export function getActiveWorkspace() {
    // If we call this during the initialization phase outside a VU
    if (!exec || !exec.vu) {
        return workspacesConfig[0];
    }
    // Round-robins cleanly based on the sequential unique identifier of this specific Virtual User.
    const index = exec.vu.idInTest % workspacesConfig.length;
    return workspacesConfig[index];
}

export function getBasePath() {
    return `/ws/${getActiveWorkspace().id}/scim/v2`;
}

export function getFullUrl(path) {
    let p = path.startsWith('/') ? path : `/${path}`;
    return `${CONFIG.BASE_URL}${getBasePath()}${p}`;
}
