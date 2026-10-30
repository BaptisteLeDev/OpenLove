import { getHome } from "@/features/home/server/getHome";
import { homeResponse } from "@/shared/contracts/home";
import { withContract } from "@/shared/http/withContract";

export const GET = withContract({ output: homeResponse, auth: "partner" }, (_, { partner, sb }) =>
  getHome(sb, partner.coupleId),
);
