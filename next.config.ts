import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/reports{,/**}": ["./node_modules/@fontsource/noto-sans/files/noto-sans-latin-*-normal.woff"],
  },
  serverExternalPackages: ["pdfkit", "@fontsource/noto-sans"],
};

export default nextConfig;
