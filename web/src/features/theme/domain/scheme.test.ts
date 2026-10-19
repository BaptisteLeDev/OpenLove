import { expect, test } from "vitest";

import { colorRoles } from "@/shared/contracts/theme";

import { schemeFromSeed, themeCss } from "./scheme";

test("changing the seed changes the scheme", () => {
  const a = schemeFromSeed("#3f6f8f");
  const b = schemeFromSeed("#8f3f5a");
  expect(a.light.primary).not.toBe(b.light.primary);
  expect(a.dark.primary).not.toBe(b.dark.primary);
});

test("scheme has every role as #rrggbb, light differs from dark", () => {
  const s = schemeFromSeed("#3f6f8f");
  for (const mode of [s.light, s.dark]) {
    expect(Object.keys(mode).sort()).toEqual([...colorRoles].sort());
    for (const v of Object.values(mode)) expect(v).toMatch(/^#[0-9a-f]{6}$/);
  }
  expect(s.light.surface).not.toBe(s.dark.surface);
});

test("invalid seed is rejected", () => {
  expect(() => schemeFromSeed("red")).toThrow();
});

const tokens = {
  typography: {
    bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: 400, letterSpacing: 0.5 },
  },
  shape: { medium: 12 },
};

test("themeCss emits light vars on :root and dark under prefers-color-scheme", () => {
  const s = schemeFromSeed("#3f6f8f");
  const css = themeCss(s, tokens);
  expect(css).toContain(`--md-sys-color-on-primary-container:${s.light.onPrimaryContainer};`);
  const dark = css.slice(css.indexOf("@media (prefers-color-scheme: dark)"));
  expect(dark).toContain(`--md-sys-color-primary:${s.dark.primary};`);
  expect(css).toContain("--md-sys-typescale-body-large-size:16px;");
  expect(css).toContain("--md-sys-typescale-body-large-tracking:0.5px;");
  expect(css).toContain("--md-sys-shape-corner-medium:12px;");
});

test("themeCss refuses a non-hex value", () => {
  const s = schemeFromSeed("#3f6f8f");
  const bad = { ...s, light: { ...s.light, primary: "red;}body{x:y" } };
  expect(() => themeCss(bad, tokens)).toThrow();
});
