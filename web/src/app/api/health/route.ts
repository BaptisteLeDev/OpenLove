import { healthResponse } from "@/shared/contracts/health";
import { withContract } from "@/shared/http/withContract";

export const GET = withContract({ output: healthResponse, auth: "public" }, () => ({ ok: true }));
