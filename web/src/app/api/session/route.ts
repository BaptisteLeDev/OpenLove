import { signInForSession } from "@/features/couple/server/session";
import { signInRequest, sessionResponse } from "@/shared/contracts/session";
import { withContract } from "@/shared/http/withContract";

export const POST = withContract(
  { input: signInRequest, output: sessionResponse, auth: "public" },
  signInForSession,
);
