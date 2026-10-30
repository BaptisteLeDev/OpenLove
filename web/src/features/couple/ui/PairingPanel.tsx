"use client";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useTransition } from "react";

import type { PairingQr } from "../domain/pairing";

type Result = PairingQr | { error: "refused" };

const QR_SIZE = 256;

export function PairingPanel({ action }: { action: () => Promise<Result> }) {
  const t = useTranslations("settings.pairing");
  const format = useFormatter();
  const [result, setResult] = useState<Result | null>(null);
  const [pending, startTransition] = useTransition();
  const show = () => startTransition(async () => setResult(await action()));
  return (
    <section className="flex w-full max-w-sm flex-col gap-4">
      <h2 className="text-title-large">{t("title")}</h2>
      <p>{t("intro")}</p>
      <button
        type="button"
        onClick={show}
        disabled={pending}
        className="rounded-full bg-primary p-2 text-on-primary"
      >
        {t("show")}
      </button>
      {result && "error" in result && <p role="alert">{t("refused")}</p>}
      {result && "qr" in result && (
        <>
          <Image
            src={result.qr}
            alt={t("qrAlt")}
            width={QR_SIZE}
            height={QR_SIZE}
            unoptimized
            className="w-full"
          />
          <p>
            {t("expires", {
              time: format.dateTime(new Date(result.expiresAt), { timeStyle: "short" }),
            })}
          </p>
        </>
      )}
    </section>
  );
}
