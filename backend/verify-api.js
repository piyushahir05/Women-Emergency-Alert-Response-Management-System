/**
 * WEARMS — API Verification Script
 * This script tests all major backend endpoints to ensure they are working correctly.
 */

const BASE_URL = 'http://localhost:5000/api';

// Helper to log results
const log = (name, success, info = '') => {
  const icon = success ? '✅' : '❌';
  console.log(`${icon} [${name}] ${info}`);
};

async function testHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    log('Health Check', res.ok, data.status === 'OK' ? 'Service is UP' : 'Service Issue');
    return res.ok;
  } catch (err) {
    log('Health Check', false, err.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API Verification...\n');

  // 1. Health Check
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('Stopping tests as server is unreachable.');
    return;
  }

  // Generate random credentials for testing
  const timestamp = Date.now();
  const testUser = {
    name: 'Test Lady',
    email: `testuser_${timestamp}@example.com`,
    phone: `91${Math.floor(Math.random() * 90000000 + 10000000)}`, // Random 10 digits
    password: 'Password@123',
    confirmPassword: 'Password@123'
  };

  let userToken = null;
  let userId = null;

  // 2. Auth: Register
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await res.json();
    log('Auth: Register', res.status === 201, data.message || data.error || 'Check response');
    userId = data.user_id;
  } catch (err) {
    log('Auth: Register', false, err.message);
  }

  // 3. Auth: Login
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const data = await res.json();
    log('Auth: Login', res.ok, res.ok ? 'Token received' : (data.error || 'Login failed'));
    userToken = data.token;
  } catch (err) {
    log('Auth: Login', false, err.message);
  }

  if (!userToken) {
    console.log('Skipping user-dependent tests (no token).');
  } else {
    // 4. User: Profile
    try {
      const res = await fetch(`${BASE_URL}/user/profile`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await res.json();
      log('User: Profile', res.ok, res.ok ? `Name: ${data.name}` : data.error);
    } catch (err) { log('User: Profile', false, err.message); }

    // 5. User: Update Profile
    try {
      const res = await fetch(`${BASE_URL}/user/updateProfile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ address: '123 Test Street' })
      });
      log('User: Update Profile', res.ok, res.ok ? 'Updated' : 'Failed');
    } catch (err) { log('User: Update Profile', false, err.message); }

    // 6. User: Contacts
    let contactId = null;
    try {
      const res = await fetch(`${BASE_URL}/user/addContact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ name: 'Emergency Guy', phone: '1122334455', relation: 'Friend' })
      });
      const data = await res.json();
      contactId = data.contact_id;
      log('User: Add Contact', res.status === 201, res.ok ? 'Added' : data.error);

      // List contacts
      const listRes = await fetch(`${BASE_URL}/user/contacts`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      log('User: List Contacts', listRes.ok, listRes.ok ? 'Retrieved' : 'Failed');
    } catch (err) { log('User: Contacts', false, err.message); }

    // 7. SOS: Trigger
    let caseId = null;
    try {
      const res = await fetch(`${BASE_URL}/sos/triggerSOS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ latitude: 12.9716, longitude: 77.5946, location_description: 'Test Location' })
      });
      const data = await res.json();
      caseId = data.case_id;
      log('SOS: Trigger SOS', res.status === 201, res.ok ? `Alert Triggered (Case #${caseId})` : data.error);
    } catch (err) { log('SOS: Trigger SOS', false, err.message); }

    // 8. SOS: History/Status
    try {
      const res = await fetch(`${BASE_URL}/sos/caseStatus`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      log('SOS: Case Status List', res.ok, res.ok ? 'Retrieved' : 'Failed');

      if (caseId) {
        const historyRes = await fetch(`${BASE_URL}/sos/caseStatus/${caseId}/history`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        log('SOS: Case History Detail', historyRes.ok, historyRes.ok ? 'Retrieved' : 'Failed');
      }
    } catch (err) { log('SOS: Status History', false, err.message); }
  }

  // 9. Vigilance Login
  let officerToken = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/vigilance/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badge_no: 'OFF-001', password: 'Vigilance@123' })
    });
    const data = await res.json();
    log('Vigilance: Login', res.ok, res.ok ? 'Officer Login Success' : data.error);
    officerToken = data.token;
  } catch (err) { log('Vigilance: Login', false, err.message); }

  if (!officerToken) {
    console.log('Skipping vigilance-dependent tests (no token).');
  } else {
    // 10. Vigilance: Manage Cases
    try {
      const res = await fetch(`${BASE_URL}/vigilance/cases/new`, {
        headers: { 'Authorization': `Bearer ${officerToken}` }
      });
      log('Vigilance: List New Cases', res.ok, res.ok ? 'Retrieved' : 'Failed');

      const reportsRes = await fetch(`${BASE_URL}/vigilance/reports/summary`, {
        headers: { 'Authorization': `Bearer ${officerToken}` }
      });
      log('Vigilance: Reports Summary', reportsRes.ok, reportsRes.ok ? 'Retrieved' : 'Failed');
    } catch (err) { log('Vigilance: Case Mgmt', false, err.message); }
  }

  console.log('\n🏁 API Verification Complete.');
}

runTests();
