import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis';

/**
 * Rate Limiting Middleware with Redis
 * Protects API endpoints from abuse by limiting request rates
 */

/**
 * Create a RedisStore instance with proper typing
 * Note: Using type assertion due to compatibility issues between redis v4 and rate-limit-redis
 * The rate-limit-redis library expects redis v3 client but we're using v4
 */
function createRedisStore(prefix: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (RedisStore as any)({
    client: redisClient,
    prefix,
  });
}

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: createRedisStore('rl:api:'),
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 * Protects against brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
  store: createRedisStore('rl:auth:'),
});

/**
 * Message sending rate limiter
 * Limits: 30 messages per minute per user
 * Prevents spam
 */
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 messages per minute
  message: 'You are sending messages too quickly. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:msg:'),
});

/**
 * File upload rate limiter
 * Limits: 10 file uploads per hour per IP
 * Prevents abuse of file storage
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:upload:'),
});
