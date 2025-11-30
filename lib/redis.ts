// lib/redis.ts
import { kv } from "@vercel/kv";

export async function incrementCounter(name: string): Promise<number> {
  const key = `counter:${name}`;
  // increments and returns the new value
  const value = await kv.incr(key);
  return value;
}
