import { check, group } from 'k6';
import { ScimClient } from '../src/scim-client.js';
import { generateUserPayload } from '../src/payloads.js';

export function runFilteringSearch() {
    group('Search & Filtering Endpoints', function () {
        let testUserId = null;
        let testUserName = null;

        group('Prepare Metadata', function () {
            let res = ScimClient.post('/Users', generateUserPayload());
            if (res.status === 201) {
                testUserId = res.json('id');
                testUserName = res.json('userName');
            }
        });

        if (!testUserId) return; // Skip if creation failed

        group('Filter on GET /Users', function () {
            let filterString = `userName eq "${testUserName}"`;
            let res = ScimClient.get('/Users', {
                params: {
                    filter: filterString,
                    count: 10
                }
            });

            check(res, {
                'GET /Users with eq filter is 200': (r) => r.status === 200,
                'Successfully found the user': (r) => {
                    let total = r.json('totalResults');
                    return total && total >= 1;
                }
            });
        });

        group('Search via POST /.search', function () {
            let searchBody = {
                schemas: ["urn:ietf:params:scim:api:messages:2.0:SearchRequest"],
                filter: `userName eq "${testUserName}"`,
                startIndex: 1,
                count: 10
            };

            let res = ScimClient.post('/Users/.search', searchBody);

            check(res, {
                'POST /Users/.search is 200': (r) => r.status === 200,
                'Returns list response from search': (r) => {
                    let b = r.json();
                    return b && b.Resources && b.Resources.length >= 1;
                }
            });
        });

        group('Complex Filtering Operators', function () {
            let res = ScimClient.get('/Users', {
                params: {
                    filter: 'active eq true and userName sw "user_"'
                }
            });
            check(res, {
                'GET /Users with and/sw filter is 200': (r) => r.status === 200
            });
        });

        // Cleanup
        group('Cleanup Search Target', function() {
            ScimClient.del(`/Users/${testUserId}`);
        });

    });
}
