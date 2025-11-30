// app/api/counter/route.ts
import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "edge";

// Your one and only "username"
const COUNTER_NAME = "Jervi-sir";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const searchParams = url.searchParams;

  const theme = searchParams.get("theme") ?? "simple";
  const origin = url.origin;

  // always increment the same key
  const count = await kv.incr(`counter:${COUNTER_NAME}`);

  const svg = buildSvg({
    name: COUNTER_NAME,
    count,
    theme,
    origin,
  });

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}

/* ------------------ SVG dispatcher ------------------ */

function buildSvg(args: {
  name: string;
  count: number;
  theme: string;
  origin: string;
}) {
  const { name, count, theme, origin } = args;

  if (theme === "3d-num") {
    return buildDigitImageSvg({
      name,
      count,
      origin,
      themeDir: "3d-num",
    });
  }

  // default simple badge
  return buildSimpleBadgeSvg({ name, count, theme });
}

/* ------------------ Simple badge SVG ------------------ */

function buildSimpleBadgeSvg({
  name,
  count,
  theme,
}: {
  name: string;
  count: number;
  theme: string;
}) {
  const label = name; // "Jervi-sir"
  const value = count.toString();

  const width = 180;
  const height = 32;

  const bgColor = theme === "dark" ? "#111827" : "#111827";
  const textColor = "#F9FAFB";
  const accentColor = "#10B981";

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
     fill="none" xmlns="http://www.w3.org/2000/svg"
     role="img" aria-label="${label} ${value}">
     
  <title>${label} counter</title>

  <!-- background -->
  <rect width="${width}" height="${height}" rx="6" fill="${bgColor}" />

  <!-- left highlighted area (value zone) -->
  <rect x="0" y="0" width="100" height="${height}" rx="6" fill="${accentColor}" />

  <!-- right zone (label zone) -->
  <rect x="100" y="0" width="${width - 100}" height="${height}" rx="6" fill="rgba(15,23,42,0.9)" />

  <!-- VALUE on the LEFT -->
  <text x="90" y="20"
    fill="${textColor}"
    font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
    font-size="14"
    text-anchor="end">
    ${escapeXml(value)}
  </text>

  <!-- LABEL on the RIGHT -->
  <text x="${width - 10}" y="20"
    fill="${textColor}"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="12"
    text-anchor="end">
    ${escapeXml("nth visitor")}
  </text>

</svg>
  `.trim();
}



/* ------------------ Image digits SVG ------------------ */

function buildDigitImageSvg({
  name,
  count,
  origin,
  themeDir,
}: {
  name: string;
  count: number;
  origin: string;
  themeDir: string; // e.g. "3d-num"
}) {
  const label = name;
  const value = count.toString(); // e.g. "12345"
  const digits = value.split(""); // ["1","2","3","4","5"]

  // adjust these to match your gif size
  const digitWidth = 32;
  const digitHeight = 32;
  const gap = 4;

  const width = digits.length * digitWidth + (digits.length - 1) * gap;
  const height = digitHeight;

  const images = digits
    .map((d, index) => {
      if (!/^[0-9]$/.test(d)) return "";
      const x = index * (digitWidth + gap);
      const src = `${origin}/theme/${themeDir}/${d}.gif`;
      return `<image href="${src}" x="${x}" y="0" width="${digitWidth}" height="${digitHeight}" />`;
    })
    .join("\n");

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} ${value}">
  <title>${label} counter</title>
  ${images}
</svg>
  `.trim();
}

/* ------------------ Utils ------------------ */

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
