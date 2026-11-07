import { exchangePairingCode } from "@/features/couple/server/pairing";
import { pairingRequest, sessionResponse } from "@/shared/contracts/session";
import { withContract } from "@/shared/http/withContract";

export const POST = withContract(
  { input: pairingRequest, output: sessionResponse, auth: "public" },
  exchangePairingCode,
);
