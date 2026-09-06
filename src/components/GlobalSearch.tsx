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

export function GlobalSearch() {
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
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Buscar aulas, labs, desafios…</span>
        <kbd className="ml-1 hidden rounded border border-border px-1.5 py-0.5 text-[10px] md:inline">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar em todo o curso…" />
        <CommandList>
          <CommandEmpty>Nada encontrado.</CommandEmpty>
          <CommandGroup heading="Módulos">
            {MODULES.map((m) => (
              <CommandItem
                key={m.id}
                value={`modulo ${m.index} ${m.title} ${m.topics.join(" ")}`}
                onSelect={() => go(`/modulos/${m.slug}`)}
              >
                Módulo {m.index} — {m.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Aulas">
            {ALL_LESSONS.map((l) => (
              <CommandItem
                key={l.id}
                value={`aula ${l.title} ${l.tools.join(" ")}`}
                onSelect={() => go(`/aulas/${l.id}`)}
              >
                {l.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Laboratórios">
            {LABS.map((l) => (
              <CommandItem key={l.id} value={`lab ${l.title}`} onSelect={() => go("/laboratorios")}>
                {l.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Desafios e Boss Battles">
            {CHALLENGES.map((c) => (
              <CommandItem key={c.id} value={`desafio ${c.title}`} onSelect={() => go("/desafios")}>
                {c.title}
              </CommandItem>
            ))}
            {BOSSES.map((b) => (
              <CommandItem key={b.id} value={`boss ${b.name}`} onSelect={() => go("/boss-battles")}>
                Boss: {b.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
