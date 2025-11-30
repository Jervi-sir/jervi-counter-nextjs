// app/api/counter/route.ts
import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "edge";

// Your one and only "username"
const COUNTER_NAME = "Jervi-sir";

/**
 * Digit sprites as data URLs, so GitHub's Camo proxy & CSP
 * can't block them inside SVG.
 *
 * For each digit:
 *   - base64 encode your GIF/PNG file
 *   - prepend "data:image/gif;base64," or "data:image/png;base64,"
 *
 * Example (PowerShell):
 *   [Convert]::ToBase64String([IO.File]::ReadAllBytes("public/theme/3d-num/0.gif"))
 * Then paste the string in place of "PASTE_0_HERE"
 */
const DIGIT_SPRITES: Record<string, string> = {
  "0": "data:image/gif;base64,PASTE_0_HERE",
  "1": "data:image/gif;base64,PASTE_1_HERE",
  "2": "data:image/gif;base64,PASTE_2_HERE",
  "3": "data:image/gif;base64,PASTE_3_HERE",
  "4": "data:image/gif;base64,PASTE_4_HERE",
  "5": "data:image/gif;base64,PASTE_5_HERE",
  "6": "data:image/gif;base64,PASTE_6_HERE",
  "7": "data:image/gif;base64,PASTE_7_HERE",
  "8": "data:image/gif;base64,PASTE_8_HERE",
  "9": "data:image/gif;base64,PASTE_9_HERE",
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const theme = searchParams.get("theme") ?? "simple";

  // always increment the same key
  const count = await kv.incr(`counter:${COUNTER_NAME}`);

  const svg = buildSvg({
    name: COUNTER_NAME,
    count,
    theme,
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
}) {
  const { name, count, theme } = args;

  if (theme === "3d-num") {
    return buildDigitImageSvg({
      name,
      count,
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
}: {
  name: string;
  count: number;
}) {
  const label = name;
  const value = count.toString(); // e.g. "12345"
  const digits = value.split(""); // ["1","2","3","4","5"]

  // adjust these to match your GIF/PNG size
  const digitWidth = 32;
  const digitHeight = 32;
  const gap = 4;

  const width = digits.length * digitWidth + (digits.length - 1) * gap;
  const height = digitHeight;

  const images = digits
    .map((d, index) => {
      if (!/^[0-9]$/.test(d)) return "";

      const src = DIGIT_SPRITES[d];
      if (!src) return "";

      const x = index * (digitWidth + gap);
      return `<image href="${src}" x="${x}" y="0" width="${digitWidth}" height="${digitHeight}" />`;
    })
    .join("\n");

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
     xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} ${value}">
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
