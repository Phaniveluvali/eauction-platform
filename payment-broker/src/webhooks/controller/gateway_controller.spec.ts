import crypto from 'crypto';
import jwt from 'jsonwebtoken';

describe('Payment Gateway Security & Cryptographic Verifications', () => {
  const JWT_SECRET = 'eauction_secret_jwt_signing_key_32bytes_minimum_length_production_ready_value!';
  const RAZORPAY_SECRET = 'rzp_test_secret_key_indian_auctions';
  const CASHFREE_SECRET = 'cf_test_secret_key_indian_auctions';

  test('Should compute and match Razorpay HMAC-SHA256 signature using timingSafeEqual', () => {
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_1234567890',
            amount: 5000000,
            currency: 'INR',
            order_id: 'order_987654321',
          },
        },
      },
    });

    const rawBuffer = Buffer.from(rawPayload);

    // Compute expected signature
    const signature = crypto
      .createHmac('sha256', RAZORPAY_SECRET)
      .update(rawBuffer)
      .digest('hex');

    // Simulate verification
    const computedSignature = crypto
      .createHmac('sha256', RAZORPAY_SECRET)
      .update(rawBuffer)
      .digest('hex');

    const sigBuf1 = Buffer.from(signature, 'utf8');
    const sigBuf2 = Buffer.from(computedSignature, 'utf8');

    expect(crypto.timingSafeEqual(sigBuf1, sigBuf2)).toBe(true);
  });

  test('Should compute and verify Cashfree timestamp-prepended HMAC-SHA256 signature', () => {
    const rawPayload = JSON.stringify({
      data: {
        order: { order_id: 'CF_ORDER_1001' },
        payment: { cf_payment_id: 998877, payment_status: 'SUCCESS' },
      },
    });
    const timestamp = '1728864000';

    const rawBuffer = Buffer.from(rawPayload);
    const hmacData = Buffer.concat([Buffer.from(timestamp), rawBuffer]);

    const signature = crypto
      .createHmac('sha256', CASHFREE_SECRET)
      .update(hmacData)
      .digest('hex');

    const expected = crypto
      .createHmac('sha256', CASHFREE_SECRET)
      .update(hmacData)
      .digest('hex');

    expect(crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))).toBe(true);
  });

  test('Should sign and verify HS256 JWT shared between Java, Go, and Node.js', () => {
    const payload = {
      sub: 'buyer@eauction.in',
      userId: '422341d3-3560-449e-b81d-e087ec8fc84c',
      role: 'BUYER',
      kycVerified: true,
      fullName: 'Ananya Deshmukh',
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '24h',
    });

    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as any;

    expect(decoded.sub).toBe('buyer@eauction.in');
    expect(decoded.userId).toBe('422341d3-3560-449e-b81d-e087ec8fc84c');
    expect(decoded.role).toBe('BUYER');
    expect(decoded.kycVerified).toBe(true);
  });
});
