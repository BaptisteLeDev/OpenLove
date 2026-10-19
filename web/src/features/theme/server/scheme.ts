import {
  argbFromHex,
  type DynamicScheme,
  Hct,
  hexFromArgb,
  SchemeTonalSpot,
} from "@material/material-color-utilities";

import { type ColorRole, colorRoles } from "@/shared/contracts/theme";

type Colors = Record<ColorRole, string>;
export type Scheme = { seed: string; light: Colors; dark: Colors };

type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  letterSpacing: number;
};
type Tokens = { typography: Record<string, TypeStyle>; shape: Record<string, number> };

const HEX = /^#[0-9a-f]{6}$/;

function assertHex(v: string): string {
  if (!HEX.test(v)) throw new Error(`not a #rrggbb color: ${v}`);
  return v;
}

function colors(s: DynamicScheme): Colors {
  return Object.fromEntries(colorRoles.map((r) => [r, hexFromArgb(s[r])])) as Colors;
}

export function schemeFromSeed(seed: string): Scheme {
  const hct = Hct.fromInt(argbFromHex(assertHex(seed)));
  return {
    seed,
    light: colors(new SchemeTonalSpot(hct, false, 0)),
    dark: colors(new SchemeTonalSpot(hct, true, 0)),
  };
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const colorVars = (c: Colors) =>
  colorRoles.map((r) => `--md-sys-color-${kebab(r)}:${assertHex(c[r])};`).join("");

// Output lands in a <style> element: only #rrggbb and numbers get through.
export function themeCss(scheme: Scheme, tokens: Tokens): string {
  const type = Object.entries(tokens.typography).map(([k, t]) => {
    const p = `--md-sys-typescale-${kebab(k)}`;
    return `${p}-size:${+t.fontSize}px;${p}-line-height:${+t.lineHeight}px;${p}-weight:${+t.fontWeight};${p}-tracking:${+t.letterSpacing}px;`;
  });
  const shape = Object.entries(tokens.shape).map(
    ([k, v]) => `--md-sys-shape-corner-${kebab(k)}:${+v}px;`,
  );
  return (
    `:root{${colorVars(scheme.light)}${type.join("")}${shape.join("")}}` +
    `@media (prefers-color-scheme: dark){:root{${colorVars(scheme.dark)}}}`
  );
}
