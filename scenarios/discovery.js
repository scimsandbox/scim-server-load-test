import { check, group } from 'k6';
import { ScimClient } from '../src/scim-client.js';

export function runDiscovery() {
    group('Service Discovery Endpoints', function () {
        
        let spcRes = ScimClient.get('/ServiceProviderConfig');
        check(spcRes, {
            'ServiceProviderConfig is status 200': (r) => r.status === 200,
            'Has supported capabilities': (r) => {
                const b = r.json();
                return b && b.patch && b.bulk && b.filter;
            }
        });

        let rtRes = ScimClient.get('/ResourceTypes');
        check(rtRes, {
            'ResourceTypes is status 200': (r) => r.status === 200,
            'Contains User and Group': (r) => {
                const b = r.json();
                let resources = b.Resources || [];
                return resources.length >= 2;
            }
        });

        let schemaRes = ScimClient.get('/Schemas');
        check(schemaRes, {
            'Schemas is status 200': (r) => r.status === 200,
            'Contains schemas payload': (r) => {
                const b = r.json();
                return b && (b.Resources || Array.isArray(b));
            }
        });

    });
}
