import type { NextConfig } from "next";

const workspaceRoot =
  process.env.OUTPUT_FILE_TRACING_ROOT ||
  process.env.NEXT_OUTPUT_FILE_TRACING_ROOT ||
  process.env.NEXT_PRIVATE_OUTPUT_TRACE_ROOT ||
  process.cwd();

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  // Keep TurboPack's root aligned with tracing root for monorepo/Vercel builds
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
