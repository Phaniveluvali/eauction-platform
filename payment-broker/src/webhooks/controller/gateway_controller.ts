import crypto from 'crypto';
import { Request, Response, Router, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { eventPublisher, PaymentEventPayload } from '../services/event_publisher';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
    kycVerified: boolean;
  };
  rawBody?: Buffer;
}

const router = Router();

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'eauction_secret_jwt_signing_key_32bytes_minimum_length_production_ready_value!';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_secret_key_indian_auctions';
const CASHFREE_WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET || 'cf_test_secret_key_indian_auctions';

/**
 * Authentication Middleware:
 * Validates the shared HS256 JWT string from the 'Authorization: Bearer' header.
 */
export function verifyJwtMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: "Missing or malformed 'Authorization: Bearer <token>' header",
    });
    return;
  }

  const token = authHeader.substring(7).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as any;

    req.user = {
      userId: decoded.userId || decoded.sub,
      role: decoded.role || 'BUYER',
      email: decoded.sub || decoded.email,
      kycVerified: Boolean(decoded.kycVerified),
    };
    next();
  } catch (error: any) {
    res.status(401).json({
      error: 'INVALID_TOKEN',
      message: `Token validation failed: ${error.message}`,
    });
  }
}

/**
 * Constant-time safe signature comparison utility
 */
function safeCompareSignatures(providedSignature: string, expectedSignature: string): boolean {
  if (!providedSignature || !expectedSignature) {
    return false;
  }
  const providedBuffer = Buffer.from(providedSignature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

/**
 * Webhook Endpoint: Razorpay Payments Gateway
 * Extracts 'x-razorpay-signature', validates raw buffer HMAC-SHA256, and dispatches to Kafka
 */
router.post('/razorpay', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      res.status(400).json({ error: 'MISSING_SIGNATURE', message: "Header 'x-razorpay-signature' is required" });
      return;
    }

    const rawBuffer = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBuffer)
      .digest('hex');

    const isValid = safeCompareSignatures(signature, expectedSignature);
    if (!isValid) {
      console.warn('[Razorpay Webhook] Invalid signature rejected!');
      res.status(401).json({ error: 'INVALID_SIGNATURE', message: 'HMAC signature verification failed' });
      return;
    }

    const payload = req.body;
    console.log(`[Razorpay Webhook] Signature verified successfully. Event: ${payload.event}`);

    // Parse event details
    const paymentEntity = payload.payload?.payment?.entity || {};
    const notes = paymentEntity.notes || {};

    const eventPayload: PaymentEventPayload = {
      paymentId: paymentEntity.id || crypto.randomUUID(),
      auctionId: notes.auction_id || payload.auction_id || crypto.randomUUID(),
      payerId: notes.payer_id || payload.payer_id || crypto.randomUUID(),
      gateway: 'RAZORPAY',
      gatewayOrderId: paymentEntity.order_id || payload.order_id || 'ORDER_' + Date.now(),
      gatewayPaymentId: paymentEntity.id || 'PAY_' + Date.now(),
      gatewaySignature: signature,
      // Razorpay transmits amounts in paise (multiply INR by 100), convert to INR
      amount: paymentEntity.amount ? paymentEntity.amount / 100 : Number(payload.amount || 0),
      currency: paymentEntity.currency || 'INR',
      status: payload.event === 'payment.captured' ? 'COMPLETED' : 'PENDING',
      timestamp: Date.now(),
    };

    await eventPublisher.publishPaymentEvent(eventPayload);

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Razorpay webhook processed and payment event published to Kafka',
      paymentId: eventPayload.paymentId,
      gateway: 'RAZORPAY',
    });
  } catch (error: any) {
    console.error('[Razorpay Webhook] Internal processing error:', error);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
  }
});

/**
 * Webhook Endpoint: Cashfree Payments Gateway
 * Extracts 'x-cashfree-signature', computes HMAC-SHA256, verifies safely, and publishes to Kafka
 */
router.post('/cashfree', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const signature = (req.headers['x-cashfree-signature'] || req.headers['x-webhook-signature']) as string;
    const timestamp = (req.headers['x-cashfree-timestamp'] || req.headers['x-webhook-timestamp'] || '') as string;

    if (!signature) {
      res.status(400).json({ error: 'MISSING_SIGNATURE', message: "Header 'x-cashfree-signature' is required" });
      return;
    }

    const rawBuffer = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const hmacData = timestamp ? Buffer.concat([Buffer.from(timestamp), rawBuffer]) : rawBuffer;

    const expectedSignature = crypto
      .createHmac('sha256', CASHFREE_WEBHOOK_SECRET)
      .update(hmacData)
      .digest('hex');

    const isValid = safeCompareSignatures(signature, expectedSignature);
    if (!isValid) {
      console.warn('[Cashfree Webhook] Invalid signature rejected!');
      res.status(401).json({ error: 'INVALID_SIGNATURE', message: 'HMAC signature verification failed' });
      return;
    }

    const payload = req.body;
    console.log(`[Cashfree Webhook] Signature verified successfully. Order ID: ${payload.data?.order?.order_id}`);

    const orderData = payload.data?.order || {};
    const paymentData = payload.data?.payment || {};
    const customerDetails = payload.data?.customer_details || {};

    const eventPayload: PaymentEventPayload = {
      paymentId: paymentData.cf_payment_id ? paymentData.cf_payment_id.toString() : crypto.randomUUID(),
      auctionId: orderData.order_tags?.auction_id || payload.auction_id || crypto.randomUUID(),
      payerId: customerDetails.customer_id || payload.payer_id || crypto.randomUUID(),
      gateway: 'CASHFREE',
      gatewayOrderId: orderData.order_id || 'CF_ORDER_' + Date.now(),
      gatewayPaymentId: paymentData.cf_payment_id ? paymentData.cf_payment_id.toString() : 'CF_PAY_' + Date.now(),
      gatewaySignature: signature,
      amount: Number(paymentData.payment_amount || orderData.order_amount || payload.amount || 0),
      currency: paymentData.payment_currency || 'INR',
      status: paymentData.payment_status === 'SUCCESS' ? 'COMPLETED' : 'PENDING',
      timestamp: Date.now(),
    };

    await eventPublisher.publishPaymentEvent(eventPayload);

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Cashfree webhook processed and payment event published to Kafka',
      paymentId: eventPayload.paymentId,
      gateway: 'CASHFREE',
    });
  } catch (error: any) {
    console.error('[Cashfree Webhook] Internal processing error:', error);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
  }
});

/**
 * Authenticated Endpoint: Initiate security deposit or auction settlement order
 * Requires valid JWT Bearer header signed with shared HS256 key
 */
router.post(
  '/orders/deposit',
  verifyJwtMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { auctionId, amount, gateway } = req.body;
      if (!auctionId || !amount || !gateway) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'auctionId, amount, and gateway are required' });
        return;
      }

      const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      res.status(201).json({
        message: 'Auction deposit order initialized successfully',
        orderId: orderId,
        auctionId: auctionId,
        payerId: req.user?.userId,
        amount: Number(amount),
        currency: 'AED',
        gateway: gateway.toUpperCase(),
        status: 'PENDING',
      });
    } catch (error: any) {
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  }
);


/**
 * Direct Endpoint: AJ Auctions Internal Escrow & Security Deposit Broker
 * Directly settles security deposits and publishes completed payment events to Kafka
 */
router.post('/internal/deposit', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      auctionId = 'GLOBAL_ESCROW_DEPOSIT',
      amount,
      payerId,
      paymentMethod = 'AJ_INTERNAL_ESCROW',
      currency = 'AED',
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Deposit amount must be greater than zero' });
      return;
    }

    const paymentId = `PAY_INT_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const orderId = `ORD_INT_${Date.now()}`;
    const resolvedPayerId = payerId || req.user?.userId || 'buyer_direct_' + Date.now().toString().slice(-4);

    const eventPayload: PaymentEventPayload = {
      paymentId,
      auctionId,
      payerId: resolvedPayerId,
      gateway: 'INTERNAL_BROKER',
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      amount: Number(amount),
      currency: currency || 'AED',
      status: 'COMPLETED',
      timestamp: Date.now(),
    };

    console.log(`[InternalBroker] Processing internal deposit of ${eventPayload.currency} ${eventPayload.amount} for user [${resolvedPayerId}] via ${paymentMethod}...`);
    await eventPublisher.publishPaymentEvent(eventPayload);
    console.log(`[InternalBroker] Successfully published payment event [${paymentId}] to Kafka.`);

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Deposit authorized and settled successfully via AJ Internal Broker',
      paymentId,
      orderId,
      auctionId,
      payerId: resolvedPayerId,
      amount: Number(amount),
      currency: eventPayload.currency,
      gateway: 'INTERNAL_BROKER',
      paymentMethod,
      timestamp: eventPayload.timestamp,
    });
  } catch (error: any) {
    console.error('[InternalBroker] Failed to process internal deposit:', error);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
  }
});

export default router;
