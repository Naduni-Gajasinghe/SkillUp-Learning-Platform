const http = require('http');

const baseURL = 'http://localhost:5000/api';

function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${baseURL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject({ status: res.statusCode, data: parsed });
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function verify() {
  console.log('--- Verifying Endpoints ---');

  try {
    // 1. Auth Login
    console.log('Testing: POST /auth/login');
    const loginRes = await request('POST', '/auth/login', {
      email: 'admin@skillup.com',
      password: 'Password123!'
    });
    const token = loginRes.data.tokens.accessToken;
    console.log('✓ Login Successful');

    // 2. Profile
    console.log('Testing: GET /profiles/me');
    const profileRes = await request('GET', '/profiles/me', null, token);
    console.log(`✓ Profile Retrieved: ${profileRes.data.fullName}`);

    // 3. Lessons
    console.log('Testing: GET /lessons');
    const lessonsRes = await request('GET', '/lessons');
    console.log(`✓ Lessons Retrieved: ${lessonsRes.data.length} found`);

    // 4. Analytics (Admin)
    console.log('Testing: GET /analytics/platform');
    const analyticsRes = await request('GET', '/analytics/platform', null, token);
    console.log(`✓ Platform Analytics: ${analyticsRes.data.totalUsers} users found`);

    console.log('\n--- All Core Modules Verified Successfully ---');
    process.exit(0);
  } catch (error) {
    console.error('✗ Verification failed:');
    console.error(error);
    process.exit(1);
  }
}

verify();
