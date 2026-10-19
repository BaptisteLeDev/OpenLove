// Rules = ARCHITECTURE.md section 3. Unanchored paths so test/arch-fixtures
// exercise the same rules as src (see test/arch.test.ts).
module.exports = {
  forbidden: [
    { name: "no-circular", severity: "error", from: {}, to: { circular: true } },
    {
      name: "domain-imports-only-domain-and-contracts",
      severity: "error",
      from: { path: "features/([^/]+)/domain/", pathNot: "\\.test\\." },
      to: { pathNot: ["features/$1/domain/", "shared/contracts/"] },
    },
    {
      name: "ui-never-reaches-server",
      severity: "error",
      from: { path: "features/[^/]+/ui/" },
      to: { path: "features/[^/]+/server/|shared/supabase/server", reachable: true },
    },
    {
      name: "api-routes-only-contract-and-server",
      severity: "error",
      from: { path: "app/api/", pathNot: "\\.test\\." },
      to: {
        pathNot: ["shared/http/", "shared/contracts/", "features/[^/]+/server/"],
        dependencyTypesNot: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-bundled", "core"],
      },
    },
    {
      name: "no-cross-feature-internals",
      severity: "error",
      from: { path: "features/([^/]+)/" },
      to: { path: "features/", pathNot: "features/$1/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
  },
};
