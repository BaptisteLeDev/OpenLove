import { expect, test, vi } from "vitest";

import { dynamic } from "./layout";

vi.mock("./globals.css", () => ({}));
vi.mock("server-only", () => ({}));
vi.mock("next-intl", () => ({ NextIntlClientProvider: () => null }));
vi.mock("next-intl/server", () => ({ getLocale: vi.fn(), getTranslations: vi.fn() }));
vi.mock("@/shared/supabase/server", () => ({ adminClient: vi.fn() }));

test("layout is dynamic", () => {
  expect(dynamic).toBe("force-dynamic");
});
