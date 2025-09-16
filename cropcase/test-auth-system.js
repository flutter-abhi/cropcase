// Test script for authentication system
const BASE_URL = 'http://localhost:3000';

async function testAuthSystem() {
    console.log('🧪 Testing Authentication System...\n');

    try {
        // Test 1: Signup
        console.log('1️⃣ Testing User Signup...');
        const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword123',
                name: 'Test User'
            })
        });

        if (signupResponse.ok) {
            const signupData = await signupResponse.json();
            console.log('✅ Signup successful');
            console.log('   User:', signupData.user.email);
            console.log('   Access Token:', signupData.accessToken ? 'Present' : 'Missing');
            console.log('   Refresh Token:', signupData.refreshToken ? 'Present' : 'Missing');

            const accessToken = signupData.accessToken;
            const refreshToken = signupData.refreshToken;

            // Test 2: Get User Profile
            console.log('\n2️⃣ Testing Get User Profile...');
            const profileResponse = await fetch(`${BASE_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                console.log('✅ Profile fetch successful');
                console.log('   User ID:', profileData.user.id);
                console.log('   Email:', profileData.user.email);
                console.log('   Role:', profileData.user.role);
            } else {
                console.log('❌ Profile fetch failed:', profileResponse.status);
            }

            // Test 3: Create a Case (Protected Route)
            console.log('\n3️⃣ Testing Create Case (Protected Route)...');
            const caseResponse = await fetch(`${BASE_URL}/api/cases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: 'Test Case',
                    description: 'A test case created via API',
                    totalLand: 100,
                    location: 'Test Farm',
                    isPublic: true,
                    tags: 'test,api',
                    crops: []
                })
            });

            if (caseResponse.ok) {
                const caseData = await caseResponse.json();
                console.log('✅ Case creation successful');
                console.log('   Case ID:', caseData.id);
                console.log('   Case Name:', caseData.name);
                console.log('   Owner ID:', caseData.userId);
            } else {
                console.log('❌ Case creation failed:', caseResponse.status);
                const errorData = await caseResponse.json();
                console.log('   Error:', errorData.error);
            }

            // Test 4: Token Refresh
            console.log('\n4️⃣ Testing Token Refresh...');
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
                console.log('   New Access Token:', refreshData.accessToken ? 'Present' : 'Missing');
                console.log('   New Refresh Token:', refreshData.refreshToken ? 'Present' : 'Missing');
            } else {
                console.log('❌ Token refresh failed:', refreshResponse.status);
            }

            // Test 5: Logout
            console.log('\n5️⃣ Testing Logout...');
            const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: refreshToken
                })
            });

            if (logoutResponse.ok) {
                console.log('✅ Logout successful');
            } else {
                console.log('❌ Logout failed:', logoutResponse.status);
            }

        } else {
            console.log('❌ Signup failed:', signupResponse.status);
            const errorData = await signupResponse.json();
            console.log('   Error:', errorData.error);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }

    console.log('\n🏁 Authentication system test completed!');
}

// Run the test
testAuthSystem();
