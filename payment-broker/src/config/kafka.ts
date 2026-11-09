import { Kafka, Producer, logLevel, Partitioners } from 'kafkajs';

const brokersString = process.env.KAFKA_BROKERS || process.env.KAFKA_BOOTSTRAP_SERVERS || 'eauction-kafka:9092';
const brokers = brokersString.split(',').map((b) => b.trim()).filter(Boolean);

const kafka = new Kafka({
  clientId: 'payment-broker',
  brokers: brokers,
  logLevel: logLevel.INFO,
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
});

export const producer: Producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
  allowAutoTopicCreation: true,
  transactionTimeout: 30000,
});

let isConnected = false;

export async function connectKafkaProducer(): Promise<void> {
  if (isConnected) {
    return;
  }
  try {
    console.log(`[Kafka] Connecting producer to brokers: ${brokers.join(', ')}...`);
    await producer.connect();
    isConnected = true;
    console.log('[Kafka] Producer connection established successfully.');
  } catch (error) {
    console.error('[Kafka] Failed to connect producer:', error);
    throw error;
  }
}

export async function disconnectKafkaProducer(): Promise<void> {
  if (!isConnected) {
    return;
  }
  try {
    console.log('[Kafka] Disconnecting producer...');
    await producer.disconnect();
    isConnected = false;
    console.log('[Kafka] Producer cleanly disconnected.');
  } catch (error) {
    console.error('[Kafka] Error during producer disconnection:', error);
  }
}
