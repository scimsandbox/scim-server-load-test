import { CONFIG } from './config.js';

const ALPHANUMERIC_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const UINT32_RANGE = 2 ** 32;
const MAX_UNBIASED_UINT32 = UINT32_RANGE - (UINT32_RANGE % ALPHANUMERIC_CHARS.length);

// Cryptographically secure random string generator helper using k6's global WebCrypto API
export function randomString(length) {
    let result = '';
    const randomValues = new Uint32Array(Math.max(length, 1));
    while (result.length < length) {
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < randomValues.length && result.length < length; i++) {
            const value = randomValues[i];
            if (value < MAX_UNBIASED_UINT32) {
                result += ALPHANUMERIC_CHARS[value % ALPHANUMERIC_CHARS.length];
            }
        }
    }
    return result;
}

export function generateUserPayload() {
    const uniqueId = randomString(8);
    const domain = 'k6loadtest.com';

    return {
        schemas: [CONFIG.SCHEMAS.USER, CONFIG.SCHEMAS.ENTERPRISE_USER],
        userName: `user_${uniqueId}@${domain}`,
        name: {
            givenName: 'Test',
            familyName: `User_${uniqueId}`
        },
        emails: [
            {
                value: `work_${uniqueId}@${domain}`,
                type: 'work',
                primary: true
            }
        ],
        active: true,
        [CONFIG.SCHEMAS.ENTERPRISE_USER]: {
            employeeNumber: `EMP-${crypto.randomUUID()}`,
            department: 'Load Testing'
        }
    };
}

export function generateGroupPayload(memberIds = []) {
    const uniqueId = randomString(8);

    const payload = {
        schemas: [CONFIG.SCHEMAS.GROUP],
        displayName: `TestGroup_${uniqueId}`
    };

    if (memberIds && memberIds.length > 0) {
        payload.members = memberIds.map(id => ({ value: id }));
    }

    return payload;
}

export function generateBulkPayload(operationCount = 5) {
    const operations = [];

    for (let i = 0; i < operationCount; i++) {
        operations.push({
            method: 'POST',
            path: '/Users',
            bulkId: `bulk_user_${i}_${randomString(4)}`,
            data: generateUserPayload()
        });
    }

    return {
        schemas: [CONFIG.SCHEMAS.BULK_REQUEST],
        Operations: operations
    };
}
