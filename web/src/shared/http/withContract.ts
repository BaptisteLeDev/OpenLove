import { z } from "zod";

import { getPartner, type Partner } from "@/shared/supabase/server";

type Auth = "partner" | "public";
type Ctx<A extends Auth> = A extends "partner" ? { partner: Partner } : object;
type Schema = z.ZodType;

function fail(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

function bearer(req: Request) {
  return /^Bearer (.+)$/.exec(req.headers.get("authorization") ?? "")?.[1];
}

// S13: cookies ride along cross-site, so cookie mutations must prove same origin.
function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  return !!origin && !!host && URL.parse(origin)?.host === host;
}

async function authorize(req: Request, mode: Auth): Promise<Response | { partner?: Partner }> {
  if (mode === "public") return {};
  const token = bearer(req);
  const mutation = req.method !== "GET" && req.method !== "HEAD";
  if (!token && mutation && !sameOrigin(req)) return fail(403, "forbidden", "origin mismatch");
  const who = await getPartner(token);
  if (who.ok) return { partner: who.partner };
  return who.code === "unauthorized"
    ? fail(401, "unauthorized", "unauthorized")
    : fail(403, "not_couple_member", "not a couple member");
}

async function readInput(req: Request): Promise<unknown> {
  if (req.method === "GET") return Object.fromEntries(new URL(req.url).searchParams);
  return req.json().catch(() => undefined);
}

export function withContract<
  I extends Schema = z.ZodVoid,
  O extends Schema = Schema,
  A extends Auth = Auth,
>(
  opts: { input?: I; output: O; auth: A },
  handler: (input: z.output<I>, ctx: Ctx<A>) => z.input<O> | Promise<z.input<O>>,
) {
  return async (req: Request): Promise<Response> => {
    try {
      const who = await authorize(req, opts.auth);
      if (who instanceof Response) return who;
      const parsed = opts.input ? opts.input.safeParse(await readInput(req)) : undefined;
      if (parsed && !parsed.success) return fail(400, "validation_failed", "invalid input");
      const out = opts.output.safeParse(await handler(parsed?.data as z.output<I>, who as Ctx<A>));
      if (!out.success) {
        console.error("withContract: output mismatch", out.error.issues);
        return fail(500, "internal", "internal error");
      }
      return Response.json({ data: out.data });
    } catch (err) {
      console.error("withContract: handler threw", err);
      return fail(500, "internal", "internal error");
    }
  };
}
