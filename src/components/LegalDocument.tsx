import { useI18n } from "@/lib/i18n";

const SECTION_COUNT = 12;

/** Renderiza os Termos de Serviço ou a Política de Privacidade no idioma ativo. */
export function LegalDocument({ doc }: { doc: "terms" | "privacy" }) {
  const { t } = useI18n();
  const prefix = doc === "terms" ? "legal.t" : "legal.p";
  const sections = Array.from({ length: SECTION_COUNT }, (_, i) => ({
    title: t(`${prefix}.${i + 1}.title`),
    body: t(`${prefix}.${i + 1}.body`),
  }));

  return (
    <article className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          {t(doc === "terms" ? "legal.terms.title" : "legal.privacy.title")}
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-accent">
          {t("legal.updated")}
        </p>
      </header>

      {sections.map((s) => (
        <section
          key={s.title}
          className="rounded-2xl border border-border bg-surface-2 p-5 sm:p-6"
        >
          <h2 className="font-display text-lg font-semibold text-foreground">{s.title}</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {s.body}
          </p>
        </section>
      ))}

      <p className="pb-4 text-xs leading-relaxed text-muted-foreground">{t("legal.brandNote")}</p>
    </article>
  );
}
