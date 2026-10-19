import { join } from "node:path";

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");

// Repo root: server code imports design/tokens.json (ADR 0003).
const root = join(import.meta.dirname, "..");

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: { root },
  outputFileTracingRoot: root,
};

export default withNextIntl(nextConfig);
