import "server-only";
import { adminClient } from "@/shared/supabase/server";

import tokens from "../../../../../design/tokens.json";
import { schemeFromSeed, themeCss } from "./scheme";

export async function getTheme() {
  try {
    const { data, error } = await adminClient()
      .from("couples")
      .select("seed")
      .order("created_at")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return schemeFromSeed(data?.seed ?? tokens.seed);
  } catch (err) {
    console.error("getTheme: seed read failed, using default", err);
    return schemeFromSeed(tokens.seed);
  }
}

export const getThemeCss = async () => themeCss(await getTheme(), tokens);
