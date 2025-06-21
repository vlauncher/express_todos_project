import Redis from 'ioredis';

class RedisClient {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL as any, {
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
  public getClient(): Redis {
    return this.client;
  }

  // Check connection status
  public isReady(): boolean {
    return this.isConnected;
  }

  // Connect to Redis (ioredis connects automatically, but expose for consistency)
  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect().catch((err) => {
        console.error('Redis: Connection failed:', err);
        throw err;
      });
    }
  }

  // Disconnect from Redis
  public async disconnect(): Promise<void> {
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

export default redisClient;