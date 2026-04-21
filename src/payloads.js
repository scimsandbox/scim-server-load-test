import { CONFIG } from './config.js';

// Random string generator helper
export function randomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
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
            employeeNumber: `EMP-${Math.floor(Math.random() * 1000000)}`,
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
