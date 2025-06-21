"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
class RedisClient {
    client;
    isConnected = false;
    constructor() {
        this.client = new ioredis_1.default(process.env.REDIS_URL, {
            maxRetriesPerRequest: 10,
            retryStrategy: (times) => {
                if (times > 10) {
                    console.error('Redis: Too many reconnection attempts');
                    return null; // Stop retrying
                }
                return Math.min(times * 100, 3000); // Exponential backoff
            },
        });
        // Handle Redis errors
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.isConnected = false;
        });
        // Handle successful connection
        this.client.on('connect', () => {
            console.log('Redis: Connected successfully');
            this.isConnected = true;
        });
        // Handle reconnection
        this.client.on('reconnecting', () => {
            console.log('Redis: Reconnecting...');
            this.isConnected = false;
        });
        // Handle connection close
        this.client.on('end', () => {
            console.log('Redis: Connection closed');
            this.isConnected = false;
        });
    }
    // Get the Redis client instance
    getClient() {
        return this.client;
    }
    // Check connection status
    isReady() {
        return this.isConnected;
    }
    // Connect to Redis (ioredis connects automatically, but expose for consistency)
    async connect() {
        if (!this.isConnected) {
            await this.client.connect().catch((err) => {
                console.error('Redis: Connection failed:', err);
                throw err;
            });
        }
    }
    // Disconnect from Redis
    async disconnect() {
        if (this.isConnected) {
            await this.client.quit();
        }
    }
}
// Create a singleton instance
const redisClient = new RedisClient();
// Handle process termination
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing Redis connection...');
    await redisClient.disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received. Closing Redis connection...');
    await redisClient.disconnect();
    process.exit(0);
});
exports.default = redisClient;
//# sourceMappingURL=redis.js.map