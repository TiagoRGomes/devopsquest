import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ALL_LESSONS, MODULES } from "@/data/curriculum";
import { LABS } from "@/data/labs";
import { BOSSES, CHALLENGES } from "@/data/challenges";
import { useI18n } from "@/lib/i18n";
import { contentText } from "@/lib/content-i18n";
import { cn } from "@/lib/utils";

export function GlobalSearch({ className, showLabel = false }: { className?: string; showLabel?: boolean }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(to: string) {
    setOpen(false);
    void navigate({ to });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("search.placeholderButton")}
        className={cn(
          "inline-flex min-w-0 items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
          className,
        )}
      >
        <Search className="size-4 shrink-0" />
        <span className={cn("truncate", showLabel ? "inline" : "hidden sm:inline")}>{t("search.placeholderButton")}</span>
        <kbd className="ml-1 hidden rounded border border-border px-1.5 py-0.5 text-[10px] md:inline">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("search.dialogPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("search.empty")}</CommandEmpty>
          <CommandGroup heading={t("search.modules")}>
            {MODULES.map((m) => {
              const title = contentText(lang, m.id, "title", m.title);
              return (
                <CommandItem
                  key={m.id}
                  value={`modulo ${m.index} ${title} ${m.topics.join(" ")}`}
                  onSelect={() => go(`/modulos/${m.slug}`)}
                >
                  {t("search.module", { index: m.index, title })}
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandGroup heading={t("search.lessons")}>
            {ALL_LESSONS.map((l) => {
              const title = contentText(lang, l.id, "title", l.title);
              return (
                <CommandItem
                  key={l.id}
                  value={`aula ${title} ${l.tools.join(" ")}`}
                  onSelect={() => go(`/aulas/${l.id}`)}
                >
                  {title}
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandGroup heading={t("search.labs")}>
            {LABS.map((l) => (
              <CommandItem key={l.id} value={`lab ${l.title}`} onSelect={() => go("/laboratorios")}>
                {l.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t("search.challengesAndBosses")}>
            {CHALLENGES.map((c) => (
              <CommandItem key={c.id} value={`desafio ${c.title}`} onSelect={() => go("/desafios")}>
                {c.title}
              </CommandItem>
            ))}
            {BOSSES.map((b) => (
              <CommandItem key={b.id} value={`boss ${b.name}`} onSelect={() => go("/boss-battles")}>
                {t("search.boss", { name: b.name })}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
