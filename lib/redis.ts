// lib/redis.ts
import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();
// requires env vars:
// UPSTASH_REDIS_REST_URL
// UPSTASH_REDIS_REST_TOKEN
