import { useTranslations } from "next-intl";

import type { Milestone as MilestoneValue } from "../domain/milestone";

export function Milestone({ value }: { value: MilestoneValue }) {
  const t = useTranslations("home.milestone");
  return (
    <section className="flex flex-col items-center gap-1">
      <h2 className="text-title-medium">{t("title")}</h2>
      <p className="text-display-small">{t("totalDays", { count: value.totalDays })}</p>
      <p className="text-body-large">{t("breakdown", value).replace(/\s+/g, " ").trim()}</p>
    </section>
  );
}
