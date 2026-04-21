import { check, group } from 'k6';
import http from 'k6/http';
import { ScimClient } from '../src/scim-client.js';
import { generateUserPayload } from '../src/payloads.js';

const EXPECT_SUCCESS_OR_NOT_FOUND = http.expectedStatuses({ min: 200, max: 399 }, 404);

export function runUserCrud() {
    group('User CRUD Lifecycle', function () {
        let createdUserId = null;

        group('Create User', function () {
            const payload = generateUserPayload();
            let res = ScimClient.post('/Users', payload);
            
            check(res, {
                'POST /Users is status 201': (r) => r.status === 201,
                'Response contains ID': (r) => r.json('id') !== undefined
            });

            if (res.status === 201) {
                createdUserId = res.json('id');
            }
        });

        if (!createdUserId) return; // Unsuccessful creation, skip the rest

        group('Read User', function () {
            let res = ScimClient.get(`/Users/${createdUserId}`);
            check(res, {
                'GET /Users/{id} is status 200': (r) => r.status === 200,
                'ID matches created user': (r) => r.json('id') === createdUserId
            });
        });

        group('Update User', function () {
            // Test full replacement (PUT)
            const payload = generateUserPayload();
            payload.name.givenName = "UpdatedGivenName";
            
            let res = ScimClient.put(`/Users/${createdUserId}`, payload);
            check(res, {
                'PUT /Users/{id} is status 200': (r) => r.status === 200,
                'Name was updated': (r) => r.json('name.givenName') === "UpdatedGivenName"
            });
        });

        group('Delete User', function () {
            let res = ScimClient.del(`/Users/${createdUserId}`);
            check(res, {
                'DELETE /Users/{id} is status 204': (r) => r.status === 204
            });

            // Verify
            let getRes = ScimClient.get(`/Users/${createdUserId}`, {
                responseCallback: EXPECT_SUCCESS_OR_NOT_FOUND
            });
            check(getRes, {
                'GET after delete is status 404': (r) => r.status === 404
            });
        });
    });
}
