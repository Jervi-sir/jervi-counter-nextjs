import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: rawName } = await params;

  const name = (rawName ?? "default").slice(0, 64);
  const searchParams = req.nextUrl.searchParams;

  const theme = searchParams.get("theme") ?? "simple";
  const key = `counter:${name}`;

  const count = await redis.incr(key);

  const svg = buildSvg({ name, count, theme });

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}

function buildSvg({
  name,
  count,
  theme,
}: {
  name: string;
  count: number;
  theme: string;
}) {
  const label = `${name}`;
  const value = count.toString();

  const width = 220;
  const height = 32;

  const bgColor = theme === "dark" ? "#111827" : "#111827";
  const textColor = "#F9FAFB";
  const accentColor = "#10B981";

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} ${value}">
  <title>${label} counter</title>
  <rect width="${width}" height="${height}" rx="6" fill="${bgColor}" />
  <rect x="0" y="0" width="120" height="${height}" rx="6" fill="rgba(15,23,42,0.9)" />
  <rect x="120" y="0" width="${width - 120}" height="${height}" rx="6" fill="${accentColor}" />

  <text x="10" y="20" fill="${textColor}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12">
    ${escapeXml(label)}
  </text>

  <text x="${width - 10}" y="20" fill="${textColor}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" font-size="14" text-anchor="end">
    ${escapeXml(value)}
  </text>
</svg>
  `.trim();
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
