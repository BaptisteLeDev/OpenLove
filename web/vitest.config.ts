import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const local = join(import.meta.dirname, ".env.local");

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}", "test/**/*.test.ts"],
    env: existsSync(local) ? parseEnv(readFileSync(local, "utf8")) : {},
  },
});
