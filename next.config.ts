import type { NextConfig } from "next";

const r2Public =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() || process.env.R2_PUBLIC_URL?.trim();
let r2Hostname: string | undefined;
try {
  if (r2Public) r2Hostname = new URL(r2Public).hostname;
} catch {
  r2Hostname = undefined;
}

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/.prisma/**",
      "./node_modules/@prisma/client/**",
    ],
  },
  images: {
    remotePatterns: r2Hostname
      ? [{ protocol: "https", hostname: r2Hostname, pathname: "/**" }]
      : [],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
