import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!, {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
});

// Handle Redis connection events
redis.on('connect', () => {
    console.log(process.env.REDIS_URL)
    console.log('Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redis.on('close', () => {
    console.log('Redis connection closed');
});

export default redis;





