# 0007 - Toolchain: TypeScript 7, Oxlint, Oxfmt, React Compiler, ktlint

- Status: accepted (2026-10-19)

## Context
Goal: fewest dependencies and config to maintain; speed comes with any Rust/Go tool. TypeScript 7
(native Go compiler) breaks typescript-eslint (peer `<6.1`), so ESLint cannot stay with it.

## Decision
- Web: TypeScript 7 everywhere (`tsc --noEmit`).
- Lint: Oxlint, type-aware (`oxlint-tsgolint`, needs TS 7), plugins `react`, `nextjs`,
  `jsx-a11y`, `import`. `react/jsx-no-literals` gates hardcoded UI strings.
- Security rules: `eslint-plugin-security` and `eslint-plugin-no-unsanitized` loaded through
  Oxlint `jsPlugins` (alpha). Fallback if they break: native rules (`react/no-danger`, `no-eval`,
  `no-implied-eval`, `no-new-func`, `no-script-url`) + `security-reviewer` before merge.
- Format: Oxfmt (beta), with Tailwind class and import sorting.
- React Compiler on (`reactCompiler: true`).
- Android: ktlint (Gradle) + Android Lint.
- Kept: Vitest, pnpm, dependency-cruiser, knip.

Rejected: Biome (no ESLint plugin loading, so the security rules would be rewritten in GritQL);
ESLint (incompatible with TS 7).

## Consequences
- One lint tool and one formatter on the web, from the same project (Oxc).
- Alpha/beta parts: `jsPlugins`, Oxfmt. A minor Oxc release can break them: pin versions.
- dependency-cruiser warns that TS 7 has no public API yet; it still resolves every module
  (checked: same module count as TS 6, `import type` violations caught). Revisit when it supports
  TS 7.
- Revert trigger: a security rule silently stops firing, or Oxfmt churns formatting between
  minors.
