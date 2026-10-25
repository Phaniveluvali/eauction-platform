import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { connectKafkaProducer, disconnectKafkaProducer } from './config/kafka';
import gatewayRouter from './webhooks/controller/gateway_controller';

const app = express();
const PORT = process.env.PORT || 8082;

// 1. Security & Infrastructure Middleware
app.use(helmet());
app.use(cors());

// Preserve raw buffer for cryptographic HMAC-SHA256 signature verification
app.use(
  express.json({
    limit: '5mb',
    verify: (req: any, _res, buf: Buffer) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// 2. Liveness & Readiness Probes
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'payment-broker',
    timestamp: Date.now(),
  });
});

// 3. Mount Domain Gateway Webhook & Payment Routes
app.use('/api/v1/payments/webhooks', gatewayRouter);
app.use('/api/v1/payments', gatewayRouter);

// 4. Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[GlobalErrorHandler] Unhandled exception occurred:', err);
  res.status(err.status || 500).json({
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred processing the request',
  });
});

// 5. Bootstrap Server & External Message Broker
async function bootstrap(): Promise<void> {
  try {
    console.log('[PaymentBroker] Initializing dependencies...');
    await connectKafkaProducer();

    const server = app.listen(PORT, () => {
      console.log(`[PaymentBroker] Service actively listening on port ${PORT}`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`[PaymentBroker] Received ${signal}. Commencing graceful shutdown...`);
      server.close(async () => {
        console.log('[PaymentBroker] HTTP server stopped accepting connections.');
        await disconnectKafkaProducer();
        console.log('[PaymentBroker] Graceful shutdown finalized.');
        process.exit(0);
      });

      // Force terminate if graceful shutdown hangs
      setTimeout(() => {
        console.error('[PaymentBroker] Forced termination due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    console.error('[PaymentBroker] Bootstrapping failed:', error);
    process.exit(1);
  }
}

bootstrap();

export default app;
