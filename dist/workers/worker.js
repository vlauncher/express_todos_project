"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const ioredis_1 = __importDefault(require("ioredis"));
dotenv_1.default.config();
// Create a dedicated ioredis client for BullMQ
const bullRedisClient = new ioredis_1.default(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    retryStrategy: (times) => {
        if (times > 10) {
            console.error('BullMQ Redis: Too many reconnection attempts');
            return null; // Stop retrying
        }
        return Math.min(times * 100, 3000); // Exponential backoff
    },
});
// Initialize Nodemailer transporter
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});
// Initialize BullMQ worker for email queue
const emailWorker = new bullmq_1.Worker('email-queue', async (job) => {
    const { from, to, subject, html } = job.data;
    try {
        await transporter.sendMail({
            from,
            to,
            subject,
            html,
        });
        console.log(`Email sent successfully to ${to}`);
    }
    catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw error; // Let BullMQ handle retries
    }
}, {
    connection: bullRedisClient,
    concurrency: 5, // Process up to 5 emails concurrently
});
// Handle worker errors
emailWorker.on('error', (error) => {
    console.error('BullMQ Worker Error:', error);
});
// Handle job completion
emailWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed: Email sent to ${job.data.to}`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing email worker and Redis connection...');
    await emailWorker.close();
    await bullRedisClient.quit();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received. Closing email worker and Redis connection...');
    await emailWorker.close();
    await bullRedisClient.quit();
    process.exit(0);
});
//# sourceMappingURL=worker.js.map