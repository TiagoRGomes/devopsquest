import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Award,
  BookOpen,
  Boxes,
  Briefcase,
  Flame,
  FlaskConical,
  Gauge,
  Library,
  LogIn,
  Map,
  Menu,
  Skull,
  Swords,
  Target,
  Terminal,
  UserCog,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";
import { initials, useAuth } from "@/lib/auth";
import { XpBar } from "@/components/ui-bits";
import { GlobalSearch } from "@/components/GlobalSearch";

const NAV = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/mapa", label: "Mapa da Jornada", icon: Map },
  { to: "/skills", label: "Skill Tree", icon: Activity },
  { to: "/modulos", label: "Módulos", icon: BookOpen },
  { to: "/laboratorios", label: "Laboratórios", icon: FlaskConical },
  { to: "/desafios", label: "Desafios", icon: Target },
  { to: "/boss-battles", label: "Boss Battles", icon: Skull },
  { to: "/projeto", label: "Projeto PrintQuest", icon: Boxes },
  { to: "/carreira", label: "Carreira DevOps", icon: Briefcase },
  { to: "/conquistas", label: "Conquistas", icon: Award },
  { to: "/recursos", label: "Recursos", icon: Library },
  { to: "/perfil", label: "Perfil", icon: UserCog },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="space-y-1" aria-label="Navegação principal">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/14 text-foreground shadow-[inset_2px_0_0_0_var(--primary)]"
                : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4", active ? "text-primary" : "")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-lg bg-level text-primary-foreground">
        <Terminal className="size-4.5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-sm font-semibold tracking-tight text-foreground">
          DevOps Quest RPG
        </span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          do código à produção
        </span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { progress, level, hydrated } = useProgress();
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-border bg-sidebar px-4 py-5 lg:flex">
          <Brand />
          <div className="rounded-xl border border-border bg-surface-2 p-3.5">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-sm font-semibold text-foreground">Nível {level.level}</p>
              <p className="font-mono text-xs text-accent">{progress.xp} XP</p>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{level.className}</p>
            <XpBar percent={level.progress} className="mt-2.5" />
            <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
              {level.xpIntoLevel}/{level.xpForNext} XP para o nível {level.level + 1}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavLinks />
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {user ? "Progresso salvo na sua conta." : "Entre para salvar seu progresso na nuvem."}
          </p>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menu"
                className="rounded-lg border border-border p-2 text-muted-foreground lg:hidden"
              >
                <Menu className="size-4" />
              </button>
              <div className="lg:hidden">
                <Brand />
              </div>
              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <GlobalSearch />
                <span className="hidden items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-xs text-foreground sm:inline-flex">
                  <Flame className="size-3.5 text-legendary" />
                  {hydrated ? progress.streak : 0} dias
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/12 px-2.5 py-2 text-xs text-primary">
                  <Zap className="size-3.5" />
                  {hydrated ? progress.xp : 0} XP
                </span>
                {user ? (
                  <Link
                    to="/perfil"
                    className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-level font-display text-xs font-semibold text-primary-foreground"
                    aria-label="Perfil"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name ?? "Foto do perfil"}
                        className="size-full object-cover"
                      />
                    ) : (
                      initials(profile?.display_name, user.email)
                    )}
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <LogIn className="size-3.5" />
                    Entrar
                  </Link>
                )}
              </div>
            </div>
            <div className="px-4 pb-2 sm:px-6 lg:hidden">
              <XpBar percent={level.progress} />
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>

          <footer className="border-t border-border px-4 py-6 sm:px-6 lg:px-8">
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Swords className="size-3.5 text-accent" />
              DevOps Quest RPG — conteúdo original, baseado no que as vagas pedem hoje.
            </p>
          </footer>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[85%] overflow-y-auto border-r border-border bg-sidebar px-4 py-5">
            <div className="mb-5 flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="rounded-lg border border-border p-2 text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
