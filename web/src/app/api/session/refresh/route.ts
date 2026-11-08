import { refreshSession } from "@/features/couple/server/session";
import { refreshRequest, sessionResponse } from "@/shared/contracts/session";
import { withContract } from "@/shared/http/withContract";

export const POST = withContract(
  { input: refreshRequest, output: sessionResponse, auth: "public" },
  refreshSession,
);
