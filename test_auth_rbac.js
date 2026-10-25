const http = require('http');

async function testLogin(email) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password: 'Password123!' });
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testGetMe(token) {
  return new Promise((resolve, reject) => {
    http.get({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/me',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          resolve(body);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing admin login:');
  const adminResp = await testLogin('admin@eauction.in');
  console.log('Admin Response:', JSON.stringify(adminResp, null, 2));

  console.log('\nTesting /api/v1/auth/me for admin:');
  const meResp = await testGetMe(adminResp.token);
  console.log('Admin Me Response:', JSON.stringify(meResp, null, 2));

  console.log('\nTesting buyer login:');
  const buyerResp = await testLogin('buyer@sharmatransport.in');
  console.log('Buyer Response:', JSON.stringify(buyerResp, null, 2));
}

run();
