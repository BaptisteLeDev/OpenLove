import { timingSafeEqual } from "node:crypto";

import type { User } from "@supabase/supabase-js";
import { z } from "zod";

import { env } from "@/shared/env";
import { getPartner } from "@/shared/supabase/server";

type Auth = "partner" | "cron" | "public";
type Ctx = { user: User };
type Schema = z.ZodType;

function fail(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

function sameSecret(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function authorize(req: Request, auth: Auth): Promise<{ user: User } | null | "public"> {
  if (auth === "public") return "public";
  if (auth === "partner") {
    const user = await getPartner(req);
    return user && { user };
  }
  const token = /^Bearer (.+)$/.exec(req.headers.get("authorization") ?? "")?.[1];
  return token && sameSecret(token, env().CRON_SECRET) ? "public" : null;
}

async function readInput(req: Request): Promise<unknown> {
  if (req.method === "GET") return Object.fromEntries(new URL(req.url).searchParams);
  return req.json().catch(() => undefined);
}

export function withContract<I extends Schema = z.ZodVoid, O extends Schema = Schema>(
  opts: { input?: I; output: O; auth: Auth },
  handler: (input: z.output<I>, ctx: Ctx) => z.input<O> | Promise<z.input<O>>,
) {
  return async (req: Request): Promise<Response> => {
    try {
      const who = await authorize(req, opts.auth);
      if (!who) return fail(401, "unauthorized", "unauthorized");
      const parsed = opts.input ? opts.input.safeParse(await readInput(req)) : undefined;
      if (parsed && !parsed.success) return fail(400, "validation_failed", "invalid input");
      const user = who === "public" ? (undefined as never) : who.user;
      const out = opts.output.safeParse(await handler(parsed?.data as z.output<I>, { user }));
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
