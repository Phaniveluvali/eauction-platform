const http = require('http');

async function login() {
  const payload = JSON.stringify({
    email: 'buyer1@eauction.in',
    password: 'Password123!'
  });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.token);
        } catch (e) {
          reject(new Error(`Failed to parse login response: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('1. Logging in as buyer1@eauction.in...');
  const token = await login();
  console.log('✓ Token acquired:', token.substring(0, 30) + '...');

  const auctionId = 'e87e1a92-3a56-4279-bf7c-88e89f89ef32';
  const wsUrl = `ws://localhost:3000/ws/auction/${auctionId}?token=${token}`;
  console.log(`2. Connecting to Go Bidding Engine WebSocket via Nginx: ${wsUrl}`);

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('✓ Connected to Go WebSocket Hub via Nginx!');
    const bidPayload = JSON.stringify({
      auctionId: auctionId,
      bidAmount: 3000000.00
    });
    console.log(`3. Submitting atomic bid of INR 30,00,000 for Tata Motors truck...`);
    ws.send(bidPayload);
  };

  ws.onmessage = (event) => {
    console.log('✓ Received WebSocket message:', event.data);
    const parsed = JSON.parse(event.data);
    if (parsed.status === 'SUCCESS' || parsed.status === 'ACCEPTED') {
      console.log('🎉 SUCCESS: Bid ACCEPTED atomically by Redis Lua script!');
      console.log(`New Highest Bid: INR ${parsed.currentHighestBid} | Leader: ${parsed.highestBidderId}`);
      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 1500);
    } else {
      console.error('❌ Bid rejected:', parsed);
      process.exit(1);
    }
  };

  ws.onerror = (err) => {
    console.error('WebSocket Error:', err);
    process.exit(1);
  };
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
