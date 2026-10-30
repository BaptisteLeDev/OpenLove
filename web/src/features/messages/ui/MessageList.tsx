import { useTranslations } from "next-intl";

type Item = { id: string; authorId: string; body: string; createdAt: string };

export function MessageList({ items, me }: { items: Item[]; me: string }) {
  const t = useTranslations("messages");
  if (items.length === 0) return <p className="text-body-large">{t("empty")}</p>;
  return (
    <ul className="flex w-full max-w-md flex-col gap-2">
      {items.map((m) => (
        <li
          key={m.id}
          className={`max-w-[80%] rounded-2xl px-3 py-2 ${m.authorId === me ? "self-end bg-primary-container" : "self-start bg-surface-container"}`}
        >
          <p className="whitespace-pre-wrap">{m.body}</p>
        </li>
      ))}
    </ul>
  );
}
