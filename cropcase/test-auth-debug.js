// Simple test to debug authentication flow
const BASE_URL = 'http://localhost:3000';

async function testAuthFlow() {
    console.log('🔍 Testing Authentication Flow...\n');

    try {
        // Test 1: Create a test user
        console.log('1️⃣ Creating test user...');
        const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: `test-${Date.now()}@example.com`,
                password: 'testpassword123',
                name: 'Test User'
            })
        });

        if (!signupResponse.ok) {
            const error = await signupResponse.json();
            console.log('❌ Signup failed:', error);
            return;
        }

        const signupData = await signupResponse.json();
        console.log('✅ Signup successful');
        console.log('   User ID:', signupData.user.id);
        console.log('   Email:', signupData.user.email);

        const accessToken = signupData.accessToken;
        const refreshToken = signupData.refreshToken;

        // Test 2: Test API call with access token
        console.log('\n2️⃣ Testing API call with access token...');
        const casesResponse = await fetch(`${BASE_URL}/api/cases`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('   Status:', casesResponse.status);
        if (casesResponse.ok) {
            const cases = await casesResponse.json();
            console.log('✅ API call successful');
            console.log('   Cases count:', cases.length);
        } else {
            const error = await casesResponse.json();
            console.log('❌ API call failed:', error);
        }

        // Test 3: Test token refresh
        console.log('\n3️⃣ Testing token refresh...');
        const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refreshToken: refreshToken
            })
        });

        if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            console.log('✅ Token refresh successful');
            console.log('   New access token present:', !!refreshData.accessToken);
            console.log('   New refresh token present:', !!refreshData.refreshToken);

            // Test 4: Use new access token
            console.log('\n4️⃣ Testing API call with new access token...');
            const newCasesResponse = await fetch(`${BASE_URL}/api/cases`, {
                headers: {
                    'Authorization': `Bearer ${refreshData.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('   Status:', newCasesResponse.status);
            if (newCasesResponse.ok) {
                console.log('✅ API call with new token successful');
            } else {
                const error = await newCasesResponse.json();
                console.log('❌ API call with new token failed:', error);
            }
        } else {
            const error = await refreshResponse.json();
            console.log('❌ Token refresh failed:', error);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }

    console.log('\n🏁 Authentication flow test completed!');
}

// Run the test
testAuthFlow();
