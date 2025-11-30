// app/api/cheat/route.ts
import { kv } from "@vercel/kv";
import { NextRequest } from "next/server";

export const runtime = "edge";

const COUNTER_NAME = "Jervi-sir";

//api/cheat?value=123456&secret=

export async function GET(req: NextRequest) {
  const url = req.nextUrl;

  const secret = url.searchParams.get("secret");
  const valueStr = url.searchParams.get("value");

  // 1) Check secret
  if (!secret || secret !== process.env.CHEAT_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  // 2) Parse value
  const value = Number(valueStr ?? "0");
  if (!Number.isFinite(value) || value < 0) {
    return new Response("Invalid value", { status: 400 });
  }

  // 3) Set counter in KV
  await kv.set(`counter:${COUNTER_NAME}`, value);

  return new Response(
    `Counter for "${COUNTER_NAME}" set to ${value}`,
    { status: 200 }
  );
}
