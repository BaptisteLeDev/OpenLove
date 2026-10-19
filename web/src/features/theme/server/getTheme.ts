import "server-only";
import tokens from "../../../../../design/tokens.json";
import { schemeFromSeed, themeCss } from "../domain/scheme";

// shortcut: default seed only, read the Couple's seed from DB in E2.3.
export const getTheme = () => schemeFromSeed(tokens.seed);

export const getThemeCss = () => themeCss(getTheme(), tokens);
