import { useTranslations } from "next-intl";

import { signIn } from "@/features/couple/server/auth";
import { LoginForm } from "@/features/couple/ui/LoginForm";

export default function LoginPage() {
  const t = useTranslations("login");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-headline-large">{t("title")}</h1>
      <LoginForm action={signIn} />
    </main>
  );
}
