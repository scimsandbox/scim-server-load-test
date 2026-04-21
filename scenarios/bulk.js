import { check, group } from 'k6';
import { ScimClient } from '../src/scim-client.js';
import { generateBulkPayload } from '../src/payloads.js';

export function runBulkOperations() {
    group('Bulk API Operations', function () {
        let createdIds = [];

        group('Bulk POST (Create Multiple Users)', function () {
            // Generate a bulk payload that creates 5 random users in one HTTP request
            const payload = generateBulkPayload(5);
            let res = ScimClient.post('/Bulk', payload);

            check(res, {
                'POST /Bulk is status 200': (r) => r.status === 200,
                'Operations list exists': (r) => r.json('Operations') !== undefined,
                'All sub-operations returned 201': (r) => {
                    let ops = r.json('Operations');
                    if (!ops) return false;
                    return ops.every(op => op.status === "201" || op.status === 201);
                }
            });

            // If prosperous, track IDs so we can bulk delete them
            if (res.status === 200 && res.json('Operations')) {
                let ops = res.json('Operations');
                ops.forEach(op => {
                    if (op.location) {
                        // Location is typically /Users/{id}
                        let parts = op.location.split('/');
                        createdIds.push(parts[parts.length - 1]);
                    }
                });
            }
        });

        if (createdIds.length === 0) return; // Cannot continue without IDs to delete.

        group('Bulk DELETE (Remove Multiple Users)', function () {
             const operations = createdIds.map((id, index) => ({
                 method: 'DELETE',
                 path: `/Users/${id}`,
                 bulkId: `delete_${index}`
             }));

             const payload = {
                 schemas: ["urn:ietf:params:scim:api:messages:2.0:BulkRequest"],
                 Operations: operations
             };

             let res = ScimClient.post('/Bulk', payload);

             check(res, {
                 'POST /Bulk (DELETE) is status 200': (r) => r.status === 200,
                 'All sub-operations returned 204': (r) => {
                     let ops = r.json('Operations');
                     if (!ops) return false;
                     return ops.every(op => op.status === "204" || op.status === 204);
                 }
             });
        });

    });
}
