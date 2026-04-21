import { check, group } from 'k6';
import { ScimClient } from '../src/scim-client.js';
import { generateUserPayload, generateGroupPayload } from '../src/payloads.js';

export function runGroupCrud() {
    group('Group CRUD Lifecycle', function () {
        let memberId1 = null;
        let memberId2 = null;
        let createdGroupId = null;

        group('Prepare Members', function () {
            // Pre-create some users to act as members for the group
            let res1 = ScimClient.post('/Users', generateUserPayload());
            let res2 = ScimClient.post('/Users', generateUserPayload());

            if (res1.status === 201) memberId1 = res1.json('id');
            if (res2.status === 201) memberId2 = res2.json('id');
        });

        if (!memberId1 || !memberId2) return; // Setup failed

        group('Create Group', function () {
            const payload = generateGroupPayload([memberId1]);
            let res = ScimClient.post('/Groups', payload);
            
            check(res, {
                'POST /Groups is status 201': (r) => r.status === 201,
                'Group contains 1 member': (r) => {
                    let m = r.json('members');
                    return m && m.length === 1;
                }
            });

            if (res.status === 201) {
                createdGroupId = res.json('id');
            }
        });

        if (!createdGroupId) return; // Group creation failed

        group('Update Group', function () {
            // Apply a PUT to update members list to include both users
            const payload = generateGroupPayload([memberId1, memberId2]);
            let res = ScimClient.put(`/Groups/${createdGroupId}`, payload);
            
            check(res, {
                'PUT /Groups/{id} is status 200': (r) => r.status === 200,
                'Group updated to 2 members': (r) => {
                    let m = r.json('members');
                    return m && m.length === 2;
                }
            });
        });

        group('Delete Group', function () {
            let res = ScimClient.del(`/Groups/${createdGroupId}`);
            check(res, {
                'DELETE /Groups/{id} is status 204': (r) => r.status === 204
            });
        });

        // Cleanup the created members
        group('Cleanup Members', function () {
            ScimClient.del(`/Users/${memberId1}`);
            ScimClient.del(`/Users/${memberId2}`);
        });

    });
}
