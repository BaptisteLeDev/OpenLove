import { useTranslations } from "next-intl";

import type { UpcomingDate as UpcomingDateValue } from "../domain/upcomingDate";

export function UpcomingDate({ value }: { value: UpcomingDateValue | null }) {
  const t = useTranslations("home.upcomingDate");
  return (
    <section className="flex flex-col items-center gap-1">
      <h2 className="text-title-medium">{t("title")}</h2>
      {value ? (
        <>
          <p className="text-body-large">{value.label}</p>
          <p className="text-body-medium">{t("inDays", { count: value.inDays })}</p>
        </>
      ) : (
        <p className="text-body-large">{t("none")}</p>
      )}
    </section>
  );
}
