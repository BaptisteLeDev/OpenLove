import { z } from "zod";

export const colorRoles = [
  "primary",
  "onPrimary",
  "primaryContainer",
  "onPrimaryContainer",
  "inversePrimary",
  "secondary",
  "onSecondary",
  "secondaryContainer",
  "onSecondaryContainer",
  "tertiary",
  "onTertiary",
  "tertiaryContainer",
  "onTertiaryContainer",
  "background",
  "onBackground",
  "surface",
  "onSurface",
  "surfaceVariant",
  "onSurfaceVariant",
  "surfaceTint",
  "inverseSurface",
  "inverseOnSurface",
  "error",
  "onError",
  "errorContainer",
  "onErrorContainer",
  "outline",
  "outlineVariant",
  "scrim",
  "surfaceBright",
  "surfaceContainer",
  "surfaceContainerHigh",
  "surfaceContainerHighest",
  "surfaceContainerLow",
  "surfaceContainerLowest",
  "surfaceDim",
] as const;

export type ColorRole = (typeof colorRoles)[number];

export const hexColor = z.string().regex(/^#[0-9a-f]{6}$/);

const colors = z.strictObject(
  Object.fromEntries(colorRoles.map((r) => [r, hexColor])) as Record<ColorRole, typeof hexColor>,
);

export const themeResponse = z.strictObject({ seed: hexColor, light: colors, dark: colors });

const grey = Object.fromEntries(colorRoles.map((r) => [r, "#808080"]));

export const examples = {
  valid: [{ seed: "#4f6f8a", light: grey, dark: grey }],
  invalid: [
    { seed: "#4f6f8a", light: grey },
    { seed: "#4f6f8a", light: { ...grey, primary: "red" }, dark: grey },
    { seed: "#4f6f8a", light: { ...grey, primary: 8421504 }, dark: grey },
  ],
};
