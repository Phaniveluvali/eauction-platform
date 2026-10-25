import { producer } from '../../config/kafka';

export interface PaymentEventPayload {
  paymentId: string;
  auctionId: string;
  payerId: string;
  gateway: 'RAZORPAY' | 'CASHFREE';
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  timestamp: number;
}

export class EventPublisher {
  private readonly topic: string;

  constructor() {
    this.topic = process.env.KAFKA_PAYMENT_TOPIC || 'vehicle-payments-topic';
  }

  public async publishPaymentEvent(event: PaymentEventPayload): Promise<void> {
    const serializedPayload = JSON.stringify(event);

    try {
      console.log(
        `[EventPublisher] Emitting payment event [${event.paymentId}] for auction [${event.auctionId}] to topic [${this.topic}]`
      );

      await producer.send({
        topic: this.topic,
        messages: [
          {
            key: event.auctionId,
            value: serializedPayload,
            headers: {
              'event-source': 'payment-broker',
              'content-type': 'application/json',
              'gateway': event.gateway,
            },
            timestamp: event.timestamp.toString(),
          },
        ],
      });

      console.log(`[EventPublisher] Successfully dispatched payment event to Kafka topic [${this.topic}].`);
    } catch (error) {
      console.error(
        `[EventPublisher] CRITICAL: Failed to publish payment event [${event.paymentId}] to Kafka:`,
        error
      );
      throw error;
    }
  }
}

export const eventPublisher = new EventPublisher();
