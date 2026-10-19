import { type NextRequest, NextResponse } from "next/server";

import { proxyClient } from "@/shared/supabase/server";

const PUBLIC = new Set(["/login", "/setup"]);

// Session presence only; Couple membership is checked by the page (D10).
export async function proxy(req: NextRequest) {
  if (PUBLIC.has(req.nextUrl.pathname)) return NextResponse.next({ request: req });
  const { sb, respond } = proxyClient(req);
  const { data } = await sb.auth.getClaims();
  if (!data?.claims && !PUBLIC.has(req.nextUrl.pathname))
    return respond(NextResponse.redirect(new URL("/login", req.url)));
  return respond(NextResponse.next({ request: req }));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
