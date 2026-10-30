import { useTranslations } from "next-intl";

import { groupByStep } from "@/features/setup/steps";
import type { EnvCheckItem } from "@/shared/envChecklist";

export function SetupChecklist({ items }: { items: EnvCheckItem[] }) {
  const t = useTranslations("setup");
  return (
    <div className="flex flex-col gap-8">
      {groupByStep(items).map((group) => (
        <section key={group.id} className="flex flex-col gap-3">
          <h2 className="text-title-large">{t(`steps.${group.id}.title`)}</h2>
          {t.has(`steps.${group.id}.instructions`) && (
            <ol className="flex list-decimal flex-col gap-1 pl-5">
              {t.raw(`steps.${group.id}.instructions`).map((line: string) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          )}
          {group.items.length > 0 && (
            <ul className="flex flex-col gap-3">
              {group.items.map(({ key, status }) => (
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
          )}
          {t.has(`steps.${group.id}.checklist`) && (
            <>
              <h3 id={`${group.id}-checklist`} className="text-title-medium">
                {t("checklistTitle")}
              </h3>
              <ul
                aria-labelledby={`${group.id}-checklist`}
                className="flex list-disc flex-col gap-1 pl-5"
              >
                {t.raw(`steps.${group.id}.checklist`).map((line: string) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      ))}
    </div>
  );
}
