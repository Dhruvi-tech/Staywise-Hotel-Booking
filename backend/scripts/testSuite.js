// Automated Test Suite for CS3301 CIE-3 Verification
// Runs 24 end-to-end integration test cases against the live StayWise API

const BASE_URL = 'http://localhost:5000/api';

const results = [];

const runTest = async (name, fn) => {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    console.log(`  ✓ PASS: ${name}`);
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.message });
    console.error(`  ✗ FAIL: ${name} -> ${error.message}`);
  }
};

const runAllTests = async () => {
  console.log('==================================================');
  console.log(' STAYWISE CIE-3 COMPREHENSIVE TEST SUITE EXECUTION');
  console.log(` Target API: ${BASE_URL}`);
  console.log('==================================================\n');

  let adminToken = '';
  let guestToken = '';
  let managerToken = '';
  let createdBookingId = '';
  let createdBookingRef = '';
  const timestamp = Date.now();

  // --- 1. AUTHENTICATION & RBAC ---
  console.log('--- 1. Authentication & Role-Based Authorization ---');

  await runTest('TC01: Register New Guest Account', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Guest',
        email: `guest_${timestamp}@test.com`,
        password: 'Password@123',
        phone: '+91 99999 11111',
        role: 'guest'
      })
    });
    const data = await res.json();
    if (!res.ok || !data.token) throw new Error(data.message || 'Registration failed');
  });

  await runTest('TC02: Register New Hotel Manager Account', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Manager',
        email: `manager_${timestamp}@test.com`,
        password: 'Password@123',
        phone: '+91 99999 22222',
        role: 'hotel_manager'
      })
    });
    const data = await res.json();
    if (!res.ok || data.user.role !== 'hotel_manager') throw new Error(data.message || 'Manager registration failed');
  });

  await runTest('TC03: Reject Duplicate Email Registration with 400', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate',
        email: 'guest@staywise.com',
        password: 'Password@123'
      })
    });
    if (res.status !== 400) throw new Error(`Expected 400 but got ${res.status}`);
  });

  await runTest('TC04: Admin Login & Token Acquisition', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@staywise.com',
        password: 'Admin@123456'
      })
    });
    const data = await res.json();
    if (!res.ok || data.user.role !== 'admin') throw new Error(data.message || 'Admin login failed');
    adminToken = data.token;
  });

  await runTest('TC05: Guest Login & Token Acquisition', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'guest@staywise.com',
        password: 'Guest@123456'
      })
    });
    const data = await res.json();
    if (!res.ok || !data.token) throw new Error(data.message || 'Guest login failed');
    guestToken = data.token;
  });

  await runTest('TC06: Reject Invalid Login Credentials with 401', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'guest@staywise.com',
        password: 'IncorrectPassword999'
      })
    });
    if (res.status !== 401) throw new Error(`Expected 401 but got ${res.status}`);
  });

  await runTest('TC07: Verify Authenticated Profile via /api/auth/me', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    const data = await res.json();
    if (!res.ok || data.data.email !== 'guest@staywise.com') throw new Error(data.message || 'Me check failed');
    if (data.data.password) throw new Error('Password hash leaked in API response!');
  });

  await runTest('TC08: Stateless Logout Acknowledgement', async () => {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    if (!res.ok) throw new Error('Logout endpoint failed');
  });

  // --- 2. USER PROFILE & PREFERENCES ---
  console.log('\n--- 2. User Profile & Preferences ---');

  await runTest('TC09: Retrieve User Profile with Reservation Metrics', async () => {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    const data = await res.json();
    if (!res.ok || data.data.stats === undefined) throw new Error('Profile stats missing');
  });

  await runTest('TC10: Update User Profile Details', async () => {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        name: 'Aarav Sharma Updated',
        phone: '+91 98765 99999'
      })
    });
    const data = await res.json();
    if (!res.ok || data.data.name !== 'Aarav Sharma Updated') throw new Error('Profile update failed');
  });

  await runTest('TC11: Change User Password', async () => {
    const res = await fetch(`${BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        currentPassword: 'Guest@123456',
        newPassword: 'Guest@123456'
      })
    });
    if (!res.ok) throw new Error('Change password failed');
  });

  // --- 3. HOTEL REST APIS ---
  console.log('\n--- 3. Hotel REST APIs ---');

  await runTest('TC12: Retrieve All Hotels (Total 84 Preserved)', async () => {
    const res = await fetch(`${BASE_URL}/hotels`);
    const data = await res.json();
    if (!res.ok || data.total !== 84) throw new Error(`Expected 84 hotels, got ${data.total}`);
  });

  await runTest('TC13: Search Hotels by Destination (Goa)', async () => {
    const res = await fetch(`${BASE_URL}/hotels?search=Goa`);
    const data = await res.json();
    if (!res.ok || data.data.length === 0) throw new Error('Search failed to return Goa properties');
    data.data.forEach((h) => {
      const match = h.location.toLowerCase().includes('goa') || h.name.toLowerCase().includes('goa');
      if (!match) throw new Error(`Non-Goa property returned: ${h.name}`);
    });
  });

  await runTest('TC14: Filter Hotels by Min Rating (4.8) & Max Price (10000)', async () => {
    const res = await fetch(`${BASE_URL}/hotels?minRating=4.8&maxPrice=10000`);
    const data = await res.json();
    if (!res.ok || data.data.length === 0) throw new Error('Filter returned 0 hotels');
    data.data.forEach((h) => {
      if (h.rating < 4.8) throw new Error(`Rating filter violated: ${h.rating}`);
      if (h.price > 10000) throw new Error(`Price filter violated: ${h.price}`);
    });
  });

  await runTest('TC15: Retrieve Hotel by Legacy Custom ID ("hotel-1")', async () => {
    const res = await fetch(`${BASE_URL}/hotels/hotel-1`);
    const data = await res.json();
    if (!res.ok || data.data.customId !== 'hotel-1') throw new Error('Failed to resolve hotel-1');
  });

  await runTest('TC16: Create New Hotel Property (Admin RBAC)', async () => {
    const res = await fetch(`${BASE_URL}/hotels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: `Automated Test Palace ${timestamp}`,
        location: 'Jaipur',
        address: 'Amer Fort Road, Jaipur 302001',
        tagline: 'Centuries of regal heritage',
        description: 'Exquisite courtyard architecture and fine Rajasthani dining.',
        price: 11500,
        rating: 4.9,
        reviewsCount: 45,
        roomType: 'Heritage Suite',
        amenities: ['Wi-Fi', 'Breakfast', 'Swimming Pool']
      })
    });
    const data = await res.json();
    if (!res.ok || !data.data.customId) throw new Error(data.message || 'Hotel creation failed');

    // Clean up created test property to keep master catalog at 84
    const delRes = await fetch(`${BASE_URL}/hotels/${data.data.customId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!delRes.ok) throw new Error('Cleanup of test hotel failed');
  });

  // --- 4. BOOKING REST APIS ---
  console.log('\n--- 4. Booking REST APIs ---');

  await runTest('TC17: Create Valid Reservation (Subtotal + ₹500 fee calculated on DB price)', async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        hotelId: 'hotel-1',
        guestName: 'Aarav Sharma',
        email: 'guest@staywise.com',
        phone: '+91 98765 99887',
        checkIn: '2026-11-20',
        checkOut: '2026-11-23',
        guests: 2,
        adults: 2,
        children: 0,
        rooms: 1
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Booking creation failed');

    // Formula validation: 8500 * 3 * 1 = 25500 + 500 = 26000
    if (data.data.nights !== 3) throw new Error(`Expected 3 nights, got ${data.data.nights}`);
    if (data.data.serviceFee !== 500) throw new Error(`Expected 500 fee, got ${data.data.serviceFee}`);
    if (data.data.totalAmount !== 26000) throw new Error(`Expected ₹26,000, got ${data.data.totalAmount}`);
    if (!/^SW-BK-[0-9]{5}$/.test(data.data.bookingReference)) {
      throw new Error(`Invalid booking reference format: ${data.data.bookingReference}`);
    }

    createdBookingId = data.data._id;
    createdBookingRef = data.data.bookingReference;
  });

  await runTest('TC18: Reject Over-Capacity Reservation with 400 (4 adults in 1 room)', async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        hotelId: 'hotel-1',
        guestName: 'Aarav Sharma',
        email: 'guest@staywise.com',
        phone: '+91 98765 99887',
        checkIn: '2026-11-20',
        checkOut: '2026-11-23',
        guests: 4,
        adults: 4,
        children: 0,
        rooms: 1 // Only 1 room for 4 adults violates max 2 adults rule
      })
    });
    if (res.status !== 400) throw new Error(`Expected 400 rejection but got ${res.status}`);
  });

  await runTest('TC19: Fetch User Bookings (GET /api/bookings/my)', async () => {
    const res = await fetch(`${BASE_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    const data = await res.json();
    if (!res.ok || data.data.length === 0) throw new Error('No user bookings retrieved');
  });

  await runTest('TC20: Modify Reservation Dates & Rooms (PUT /api/bookings/:id/modify)', async () => {
    const res = await fetch(`${BASE_URL}/bookings/${createdBookingId}/modify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        checkIn: '2026-11-21',
        checkOut: '2026-11-25', // 4 nights now
        rooms: 1,
        guests: 2
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Modification failed');
    if (data.data.nights !== 4) throw new Error(`Expected 4 nights, got ${data.data.nights}`);
    // 8500 * 4 * 1 = 34000 + 500 = 34500
    if (data.data.totalAmount !== 34500) throw new Error(`Expected ₹34,500, got ${data.data.totalAmount}`);
  });

  await runTest('TC21: Public Digital Verification of Booking Reference', async () => {
    const res = await fetch(`${BASE_URL}/bookings/verify/${createdBookingRef}`);
    const data = await res.json();
    if (!res.ok || !data.data.verified) throw new Error('Verification failed');
    if (data.data.bookingReference !== createdBookingRef) throw new Error('Reference mismatch');
  });

  await runTest('TC22: Cancel Reservation with Reason (PATCH /api/bookings/:id/cancel)', async () => {
    const res = await fetch(`${BASE_URL}/bookings/${createdBookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        reason: 'Adjusted winter travel schedule'
      })
    });
    const data = await res.json();
    if (!res.ok || data.data.status !== 'Cancelled') throw new Error('Cancellation failed');
  });

  // --- 5. ADMIN AGGREGATIONS & NOTIFICATIONS ---
  console.log('\n--- 5. Admin Dashboard & Notifications ---');

  await runTest('TC23: Executive Dashboard MongoDB Aggregations', async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Dashboard failed');
    if (data.data.summary.totalUsers < 3) throw new Error('Users count mismatch');
    if (data.data.summary.totalHotels < 84) throw new Error('Hotels count mismatch');
    if (!Array.isArray(data.data.topDestinations)) throw new Error('Destinations aggregation missing');
  });

  await runTest('TC24: Retrieve User In-App Notifications', async () => {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.data)) throw new Error('Notifications retrieval failed');
  });

  // Summary
  console.log('\n==================================================');
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(` TOTAL TESTS RUN: ${results.length}`);
  console.log(` PASSED:         ${passed}`);
  console.log(` FAILED:         ${failed}`);
  console.log(` SUCCESS RATE:   ${Math.round((passed / results.length) * 100)}%`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runAllTests();
