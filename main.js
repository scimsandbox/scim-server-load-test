import { sleep } from 'k6';
import { CONFIG } from './src/config.js';

// Scenarios
import { runDiscovery } from './scenarios/discovery.js';
import { runUserCrud } from './scenarios/user-crud.js';
import { runGroupCrud } from './scenarios/group-crud.js';
import { runFilteringSearch } from './scenarios/filtering.js';
import { runBulkOperations } from './scenarios/bulk.js';

const packageJson = JSON.parse(open('./package.json'));
export const VERSION = packageJson.version;

export function setup() {
    console.log(`SCIM Sandbox Server Load Tests version ${VERSION}`);
}

export const options = {
    vus: CONFIG.VUS,
    duration: CONFIG.DURATION,
    thresholds: {
        // Assert that 95% of requests finish in under 1 second.
        http_req_duration: ['p(95)<1000'],
        // Assert that errors represent less than 1% of the total request volume.
        http_req_failed: ['rate<0.01']
    }
};

export default function runScenarios() {
    const sType = CONFIG.ONLY_SCENARIO;

    if (sType === 'all' || sType === 'discovery') {
        runDiscovery();
    }

    if (sType === 'all' || sType === 'user_crud') {
        runUserCrud();
    }

    if (sType === 'all' || sType === 'group_crud') {
        runGroupCrud();
    }

    if (sType === 'all' || sType === 'filtering') {
        runFilteringSearch();
    }

    if (sType === 'all' || sType === 'bulk') {
        runBulkOperations();
    }

    // A minimal sleep adds some variation between iterations exactly like typical humans browsing.
    sleep(1);
}
