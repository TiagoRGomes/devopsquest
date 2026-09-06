import { Globe } from "lucide-react";
import { LANGS, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const { lang, setLang, t } = useI18n();

  if (variant === "full") {
    return (
      <div className="flex flex-wrap gap-2">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={lang === l.code}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition-colors",
              lang === l.code
                ? "border-primary bg-primary/12 text-foreground"
                : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
            )}
          >
            <span aria-hidden>{l.flag}</span>
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <label className="relative inline-flex items-center">
      <Globe className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" />
      <span className="sr-only">{t("shell.language")}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as (typeof LANGS)[number]["code"])}
        className="appearance-none rounded-lg border border-border bg-surface-2 py-2 pl-8 pr-2.5 text-xs text-foreground outline-none focus:border-primary"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.code.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
