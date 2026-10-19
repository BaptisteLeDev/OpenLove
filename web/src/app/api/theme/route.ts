import { getTheme } from "@/features/theme/server/getTheme";
import { themeResponse } from "@/shared/contracts/theme";
import { withContract } from "@/shared/http/withContract";

export const GET = withContract({ output: themeResponse, auth: "public" }, getTheme);
