import type { NextConfig } from "next";

const r2Public =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() || process.env.R2_PUBLIC_URL?.trim();
let r2Hostname: string | undefined;
try {
  if (r2Public) r2Hostname = new URL(r2Public).hostname;
} catch {
  r2Hostname = undefined;
}

/** Buckets públicos R2 usam `*.r2.dev`; incluir na build mesmo sem env (Docker não tinha NEXT_PUBLIC_* no build). */
const r2DevPattern = {
  protocol: "https" as const,
  hostname: "*.r2.dev",
  pathname: "/**" as const,
};

const remotePatterns = [r2DevPattern];
if (r2Hostname && !r2Hostname.endsWith(".r2.dev")) {
  remotePatterns.push({
    protocol: "https",
    hostname: r2Hostname,
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": ["./generated/prisma/**", "./node_modules/pg/**", "./node_modules/@prisma/adapter-pg/**"],
  },
  images: {
    remotePatterns,
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
