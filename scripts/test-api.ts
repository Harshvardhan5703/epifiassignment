import crypto from 'crypto';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function runTests() {
  console.log(`Starting API Tests against ${API_URL}...\n`);

  const email = `testuser_${crypto.randomBytes(4).toString('hex')}@example.com`;
  const password = 'TestSecurePassword123!';
  let token = '';
  let noteId = '';

  const assert = (condition: boolean, message: string, data?: any) => {
    if (!condition) {
      if (data) console.error("Response Data:", data);
      throw new Error(`Assertion failed: ${message}`);
    }
  };

  const logSuccess = (msg: string) => console.log(` ${msg}`);

  try {
    // 1. Root & About & OpenAPI
    let res = await fetch(`${API_URL}/`);
    assert(res.status === 200, 'GET / should return 200');
    
    res = await fetch(`${API_URL}/about`);
    assert(res.status === 200, 'GET /about should return 200');

    res = await fetch(`${API_URL}/openapi.json`);
    assert(res.status === 200, 'GET /openapi.json should return 200');
    logSuccess('Public routes (/, /about, /openapi.json) are working');

    // 2. Register
    res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const registerData = await res.json();
    assert(res.status === 201, `POST /register should return 201`, registerData);
    logSuccess(`Registered test user: ${email}`);

    // 3. Login
    res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await res.json();
    assert(res.status === 200, `POST /login should return 200`, loginData);
    assert(!!loginData.access_token, 'Login should return access_token', loginData);
    token = loginData.access_token;
    logSuccess('Login successful, JWT token acquired');

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 4. Create Note
    res = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ 
        title: 'Integration Test Note', 
        content: 'This is a note created by the automated test suite.', 
        tags: ['test', 'automated'] 
      })
    });
    const noteData = await res.json();
    assert(res.status === 201, `POST /notes should return 201`, noteData);
    assert(!!noteData._id, 'Created note should have an _id');
    noteId = noteData._id;
    logSuccess(`Created test note with ID: ${noteId}`);

    // 5. Get Notes (List & Pagination)
    res = await fetch(`${API_URL}/notes?limit=5`, { headers: authHeaders });
    const listData = await res.json();
    assert(res.status === 200, 'GET /notes should return 200', listData);
    assert(Array.isArray(listData.data), 'GET /notes should return an array in .data', listData);
    logSuccess('Successfully retrieved notes list');

    // 6. Get Single Note
    res = await fetch(`${API_URL}/notes/${noteId}`, { headers: authHeaders });
    const getSingleData = await res.json();
    assert(res.status === 200, 'GET /notes/:id should return 200', getSingleData);
    logSuccess('Successfully retrieved single note by ID');

    // 7. Update Note
    res = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ title: 'Updated Integration Test Note' })
    });
    const updateData = await res.json();
    assert(res.status === 200, 'PUT /notes/:id should return 200', updateData);
    logSuccess('Successfully updated the note');

    // 8. Search Notes (Text Index)
    // MongoDB text indexes can sometimes take a moment to sync asynchronously
    await new Promise(r => setTimeout(r, 600));
    res = await fetch(`${API_URL}/search?q=Updated`, { headers: authHeaders });
    const searchData = await res.json();
    assert(res.status === 200, 'GET /search should return 200', searchData);
    assert(Array.isArray(searchData), 'Search should return an array of results', searchData);
    logSuccess('Successfully executed text search across notes');

    // 9. Share Note
    res = await fetch(`${API_URL}/notes/${noteId}/share`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ share_with_email: 'collaborator@example.com' })
    });
    const shareData = await res.json();
    assert(res.status === 200, 'POST /notes/:id/share should return 200', shareData);
    logSuccess('Successfully shared note with collaborator account');

    // 10. Delete Note
    res = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert(res.status === 204, `DELETE /notes/:id should return 204, got ${res.status}`);
    logSuccess('Successfully deleted the test note');

    console.log('\nALL TESTS PASSED SUCCESSFULLY! Your API and Database are fully operational.');

  } catch (err: any) {
    console.error('\nTEST FAILED:', err.message);
    console.error('\nEnsure that your server is running (npm run dev) and connected to MongoDB before executing tests.');
    process.exit(1);
  }
}

runTests();
