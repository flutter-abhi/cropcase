#!/usr/bin/env node

/**
 * Crop Case API Testing Script
 * 
 * This script tests all API endpoints to ensure they're working correctly.
 * Run with: node test-api-endpoints.js
 */

const BASE_URL = 'http://localhost:3000/api/cases';
const USER_ID = 'dummy-user-123';

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// Helper function to make API requests
const apiRequest = async (endpoint, params = {}) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    });

    try {
        const response = await fetch(url.toString());
        const data = await response.json();
        return { success: response.ok, status: response.status, data };
    } catch (error) {
        return { success: false, status: 0, data: { error: error.message } };
    }
};

// Test functions
const tests = {
    async testMyCasesAPI() {
        console.log(`${colors.blue}📋 Testing My Cases API...${colors.reset}`);

        const result = await apiRequest('/my-cases', {
            userId: USER_ID,
            page: 1,
            limit: 5
        });

        if (result.success) {
            console.log(`${colors.green}✅ My Cases API working!${colors.reset}`);
            console.log(`   📊 Cases found: ${result.data.cases?.length || 0}`);
            console.log(`   📈 Total cases: ${result.data.stats?.totalCases || 0}`);
            console.log(`   🌾 Total land: ${result.data.stats?.totalLand || 0} acres`);
            return true;
        } else {
            console.log(`${colors.red}❌ My Cases API failed: ${result.data.error}${colors.reset}`);
            return false;
        }
    },

    async testCommunityCasesAPI() {
        console.log(`${colors.blue}🌍 Testing Community Cases API...${colors.reset}`);

        const result = await apiRequest('/community', {
            userId: USER_ID,
            page: 1,
            limit: 5
        });

        if (result.success) {
            console.log(`${colors.green}✅ Community Cases API working!${colors.reset}`);
            console.log(`   📊 Community cases: ${result.data.cases?.length || 0}`);
            console.log(`   👥 Total farmers: ${result.data.stats?.totalFarmers || 0}`);
            console.log(`   ❤️ Total likes: ${result.data.stats?.totalLikes || 0}`);
            return true;
        } else {
            console.log(`${colors.red}❌ Community Cases API failed: ${result.data.error}${colors.reset}`);
            return false;
        }
    },

    async testSearchAPI() {
        console.log(`${colors.blue}🔍 Testing Search API...${colors.reset}`);

        const result = await apiRequest('/search', {
            userId: USER_ID,
            page: 1,
            limit: 5
        });

        if (result.success) {
            console.log(`${colors.green}✅ Search API working!${colors.reset}`);
            console.log(`   🔍 Search results: ${result.data.cases?.length || 0}`);
            console.log(`   🏷️ Available seasons: ${result.data.filters?.availableSeasons?.join(', ') || 'None'}`);
            return true;
        } else {
            console.log(`${colors.red}❌ Search API failed: ${result.data.error}${colors.reset}`);
            return false;
        }
    },

    async testLegacyAPI() {
        console.log(`${colors.blue}📜 Testing Legacy Cases API...${colors.reset}`);

        const result = await apiRequest('');

        if (result.success) {
            console.log(`${colors.green}✅ Legacy Cases API working!${colors.reset}`);
            const caseCount = Array.isArray(result.data) ? result.data.length : result.data.data?.length || 0;
            console.log(`   📊 Total cases: ${caseCount}`);
            return true;
        } else {
            console.log(`${colors.red}❌ Legacy Cases API failed: ${result.data.error}${colors.reset}`);
            return false;
        }
    },

    async testPagination() {
        console.log(`${colors.blue}📄 Testing Pagination...${colors.reset}`);

        const result = await apiRequest('/my-cases', {
            userId: USER_ID,
            page: 1,
            limit: 2
        });

        if (result.success && result.data.pagination) {
            console.log(`${colors.green}✅ Pagination working!${colors.reset}`);
            console.log(`   📄 Page: ${result.data.pagination.page}/${result.data.pagination.totalPages}`);
            console.log(`   📊 Total: ${result.data.pagination.total} cases`);
            console.log(`   🔄 Has next: ${result.data.pagination.hasNext}`);
            return true;
        } else {
            console.log(`${colors.red}❌ Pagination test failed${colors.reset}`);
            return false;
        }
    },

    async testSorting() {
        console.log(`${colors.blue}🔄 Testing Sorting...${colors.reset}`);

        const result = await apiRequest('/my-cases', {
            userId: USER_ID,
            page: 1,
            limit: 5,
            sortBy: 'name',
            sortOrder: 'asc'
        });

        if (result.success) {
            console.log(`${colors.green}✅ Sorting working!${colors.reset}`);
            console.log(`   📊 Sorted cases: ${result.data.cases?.length || 0}`);
            if (result.data.cases?.length > 1) {
                console.log(`   📝 First: "${result.data.cases[0]?.name}"`);
                console.log(`   📝 Last: "${result.data.cases[result.data.cases.length - 1]?.name}"`);
            }
            return true;
        } else {
            console.log(`${colors.red}❌ Sorting test failed${colors.reset}`);
            return false;
        }
    },

    async testErrorHandling() {
        console.log(`${colors.blue}⚠️ Testing Error Handling...${colors.reset}`);

        // Test missing user ID
        const result = await apiRequest('/my-cases', { page: 1, limit: 5 });

        if (!result.success && result.data.code === 'MISSING_USER_ID') {
            console.log(`${colors.green}✅ Error handling working!${colors.reset}`);
            console.log(`   🚫 Correctly rejected missing user ID`);
            return true;
        } else {
            console.log(`${colors.red}❌ Error handling test failed${colors.reset}`);
            return false;
        }
    }
};

// Main test runner
async function runTests() {
    console.log(`${colors.bold}${colors.blue}🧪 Crop Case API Testing Suite${colors.reset}`);
    console.log(`${colors.blue}================================${colors.reset}\n`);

    const testResults = [];

    // Run all tests
    for (const [testName, testFunction] of Object.entries(tests)) {
        try {
            const result = await testFunction();
            testResults.push({ name: testName, passed: result });
            console.log(''); // Add spacing between tests
        } catch (error) {
            console.log(`${colors.red}❌ ${testName} crashed: ${error.message}${colors.reset}\n`);
            testResults.push({ name: testName, passed: false });
        }
    }

    // Summary
    console.log(`${colors.bold}${colors.blue}📊 Test Results Summary${colors.reset}`);
    console.log(`${colors.blue}========================${colors.reset}`);

    const passed = testResults.filter(t => t.passed).length;
    const total = testResults.length;

    testResults.forEach(test => {
        const status = test.passed ? `${colors.green}✅` : `${colors.red}❌`;
        const name = test.name.replace('test', '').replace('API', ' API').replace('Handling', ' Handling');
        console.log(`${status} ${name}${colors.reset}`);
    });

    console.log(`\n${colors.bold}📈 Results: ${passed}/${total} tests passed${colors.reset}`);
    console.log(`${colors.bold}🎯 Success rate: ${Math.round((passed / total) * 100)}%${colors.reset}`);

    if (passed === total) {
        console.log(`\n${colors.green}${colors.bold}🎉 All tests passed! API is ready for production.${colors.reset}`);
    } else {
        console.log(`\n${colors.yellow}${colors.bold}⚠️ Some tests failed. Please check the API implementation.${colors.reset}`);
    }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.log(`${colors.red}❌ This script requires Node.js 18+ or a fetch polyfill.${colors.reset}`);
    console.log(`${colors.yellow}💡 Install node-fetch: npm install node-fetch${colors.reset}`);
    process.exit(1);
}

// Run the tests
runTests().catch(error => {
    console.error(`${colors.red}❌ Test runner failed: ${error.message}${colors.reset}`);
    process.exit(1);
});
