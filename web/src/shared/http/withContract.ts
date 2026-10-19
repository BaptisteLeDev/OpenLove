import { createHash, timingSafeEqual } from "node:crypto";

import type { User } from "@supabase/supabase-js";
import { z } from "zod";

import { env } from "@/shared/env";
import { getPartner } from "@/shared/supabase/server";

type Auth = "partner" | "cron" | "public";
type Ctx<A extends Auth> = A extends "partner" ? { user: User } : object;
type Schema = z.ZodType;

function fail(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

const digest = (v: string) => createHash("sha256").update(v).digest();

function bearer(req: Request) {
  return /^Bearer (.+)$/.exec(req.headers.get("authorization") ?? "")?.[1];
}

async function authorize(req: Request, mode: Auth): Promise<{ user?: User } | null> {
  if (mode === "public") return {};
  const token = bearer(req);
  if (mode === "partner") {
    const user = await getPartner(token);
    return user && { user };
  }
  const ok = token && timingSafeEqual(digest(token), digest(env().CRON_SECRET));
  return ok ? {} : null;
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
      if (!who) return fail(401, "unauthorized", "unauthorized");
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
