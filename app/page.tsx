// app/page.tsx
import Image from "next/image";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-app.vercel.app";

export default function HomePage() {
  const exampleName = "jervi-counter";
  const exampleUrl = `${SITE_URL}/api/counter/${exampleName}`;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Next Counter</h1>
      <p className="text-slate-300 mb-6 max-w-xl text-center">
        Simple global visitor counter as an SVG badge. Powered by Next.js +
        Vercel + Upstash Redis.
      </p>

      <h2 className="text-xl font-semibold mb-2">Usage</h2>
      <p className="text-slate-300 mb-2">
        1. Pick a counter name, for example:{" "}
        <code className="bg-slate-800 px-1 rounded">jervi</code>
      </p>
      <p className="text-slate-300 mb-4">
        2. Use this Markdown in your README:
      </p>

      <pre className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm mb-4 w-full max-w-xl overflow-x-auto">
        <code>{`![](https://jervi-counter.vercel.app/api/counter?theme=3d-num)`}</code>
      </pre>

      <p className="text-slate-300 mb-2">
        3. Every time the image loads, the counter increments.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Live example</h2>
      <p className="text-slate-400 text-sm mb-2">
        Refresh this page to see the number grow:
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={exampleUrl}
        alt="Counter example"
        className="border border-slate-800 rounded-md bg-slate-900"
      />
    </main>
  );
}
