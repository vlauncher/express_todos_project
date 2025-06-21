import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Create a dedicated ioredis client for BullMQ
const bullRedisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // Required by BullMQ
  retryStrategy: (times) => {
    if (times > 10) {
      console.error('BullMQ Redis: Too many reconnection attempts');
      return null; // Stop retrying
    }
    return Math.min(times * 100, 3000); // Exponential backoff
  },
});

// Initialize BullMQ queue for emails
const emailQueue = new Queue('email-queue', {
  connection: bullRedisClient,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 1000, // Exponential backoff starting at 1 second
    },
    removeOnComplete: 100, // Keep up to 100 completed jobs
    removeOnFail: 1000, // Keep up to 1000 failed jobs
  },
});

// Handle queue errors
emailQueue.on('error', (error) => {
  console.error('BullMQ Queue Error:', error);
});

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing BullMQ Redis connection...');
  await bullRedisClient.quit();
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing BullMQ Redis connection...');
  await bullRedisClient.quit();
});

// Export the queue
export default emailQueue;