import { useTranslations } from "next-intl";

import type { EnvCheckItem } from "@/shared/envChecklist";

export function SetupChecklist({ items }: { items: EnvCheckItem[] }) {
  const t = useTranslations("setup");
  return (
    <ul className="flex flex-col gap-3">
      {items.map(({ key, status }) => (
        <li key={key} className="flex flex-col gap-1">
          <p>
            <code>{key}</code> <span>{t(`status.${status}`)}</span>
          </p>
          <p className="text-body-medium">
            {t.has(`vars.${key}`) ? t(`vars.${key}`) : t("genericHowTo")}
          </p>
        </li>
      ))}
    </ul>
  );
}
