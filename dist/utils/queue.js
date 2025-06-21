"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
// Create a dedicated ioredis client for BullMQ
const bullRedisClient = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
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
const emailQueue = new bullmq_1.Queue('email-queue', {
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
exports.default = emailQueue;
//# sourceMappingURL=queue.js.map