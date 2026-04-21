import http from 'k6/http';
import { getFullUrl, getActiveWorkspace } from './config.js';

/**
 * Builds standard SCIM headers containing authorization and content type.
 */
function getHeaders() {
    return {
        'Authorization': `Bearer ${getActiveWorkspace().token}`,
        'Content-Type': 'application/scim+json',
        'Accept': 'application/scim+json'
    };
}

/**
 * Resolves a K6 metric tag name for a given path to prevent high cardinality issues
 * e.g., /Users/1234 -> Users/{id}
 */
function getNameTag(path) {
    let p = path.startsWith('/') ? path.substring(1) : path;
    const parts = p.split('/');
    if (parts.length > 1) {
        if (parts[1] === '.search') {
            return `${parts[0]}/.search`;
        }
        return `${parts[0]}/{id}`;
    }
    return parts[0] || "Root";
}

/**
 * Helper to build the final params object with tags.
 */
function buildParams(path, params) {
    return {
        ...params,
        headers: Object.assign(getHeaders(), params.headers || {}),
        tags: Object.assign({ name: getNameTag(path) }, params.tags || {})
    };
}

/**
 * SCIM API wrapper combining URL formulation with authenticated HTTP calls.
 */
export const ScimClient = {
    get: (path, params = {}) => {
        return http.get(getFullUrl(path), buildParams(path, params));
    },

    post: (path, body, params = {}) => {
        return http.post(getFullUrl(path), JSON.stringify(body), buildParams(path, params));
    },

    put: (path, body, params = {}) => {
        return http.put(getFullUrl(path), JSON.stringify(body), buildParams(path, params));
    },

    patch: (path, body, params = {}) => {
        // HTTP PATCH method isn't directly a single word in k6 standard shortcuts,
        // although http.patch exists in newer versions. If it doesn't, we can use request.
        return http.patch(getFullUrl(path), JSON.stringify(body), buildParams(path, params));
    },

    del: (path, params = {}) => {
        return http.del(getFullUrl(path), null, buildParams(path, params));
    }
};
