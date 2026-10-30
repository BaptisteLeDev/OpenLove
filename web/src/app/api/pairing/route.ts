import { exchangePairingCode } from "@/features/couple/server/pairing";
import { pairingRequest, pairingResponse } from "@/shared/contracts/pairing";
import { withContract } from "@/shared/http/withContract";

export const POST = withContract(
  { input: pairingRequest, output: pairingResponse, auth: "public" },
  exchangePairingCode,
);
