import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Award,
  BookOpen,
  Boxes,
  Briefcase,
  CalendarRange,
  MessagesSquare,
  Flame,
  FlaskConical,
  Gauge,
  Library,
  LogIn,
  Map,
  Menu,
  ScrollText,
  Skull,
  Swords,
  Target,
  Terminal,
  UserCog,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";
import { initials, useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { XpBar } from "@/components/ui-bits";
import { GlobalSearch } from "@/components/GlobalSearch";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { contentText, slugifyClassName } from "@/lib/content-i18n";
import { useIsAdmin } from "@/lib/admin";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", key: "nav.dashboard", icon: Gauge },
  { to: "/minha-trilha", key: "nav.path", icon: CalendarRange },
  { to: "/comunidade", key: "nav.community", icon: MessagesSquare },
  { to: "/mapa", key: "nav.map", icon: Map },
  { to: "/skills", key: "nav.skills", icon: Activity },
  { to: "/modulos", key: "nav.modules", icon: BookOpen },
  { to: "/laboratorios", key: "nav.labs", icon: FlaskConical },
  { to: "/desafios", key: "nav.challenges", icon: Target },
  { to: "/boss-battles", key: "nav.bosses", icon: Skull },
  { to: "/projeto", key: "nav.project", icon: Boxes },
  { to: "/carreira", key: "nav.career", icon: Briefcase },
  { to: "/conquistas", key: "nav.badges", icon: Award },
  { to: "/certificados", key: "exam.nav", icon: ScrollText },
  { to: "/recursos", key: "nav.resources", icon: Library },
  { to: "/perfil", key: "nav.profile", icon: UserCog },
  { to: "/admin", key: "nav.admin", icon: Wand2 },
] as const;

/** Rotas que têm layout próprio (tela inicial e acesso). */
const BARE_ROUTES = ["/", "/auth"];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t , lang } = useI18n();
  const { isAdmin } = useIsAdmin();

  return (
    <nav className="space-y-1" aria-label={t("nav.aria")}>
      {NAV.filter((item) => item.to !== "/admin" || isAdmin).map(({ to, key, icon: Icon }) => {
        const active = pathname.startsWith(to);
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
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  const { t } = useI18n();
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-level text-primary-foreground">
        <Terminal className="size-4.5" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-display text-sm font-semibold tracking-tight text-foreground">
          {t("brand.name")}
        </span>
        <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.16em] text-accent min-[360px]:block">
          {t("brand.tagline")}
        </span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { progress, level, hydrated } = useProgress();
  const { user, profile } = useAuth();
  const { t, lang } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (BARE_ROUTES.includes(pathname)) return <>{children}</>;

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-border bg-sidebar px-4 py-5 lg:flex">
          <Brand />
          <div className="rounded-xl border border-border bg-surface-2 p-3.5">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-sm font-semibold text-foreground">
                {t("shell.level")} {level.level}
              </p>
              <p className="font-mono text-xs text-accent">{progress.xp} XP</p>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{contentText(lang, `class.${slugifyClassName(level.className)}`, "title", level.className)}</p>
            <XpBar percent={level.progress} className="mt-2.5" />
            <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
              {level.xpIntoLevel}/{level.xpForNext} {t("shell.xpToLevel")} {level.level + 1}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavLinks />
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {user ? t("shell.savedCloud") : t("shell.savedLocal")}
          </p>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 sm:px-6 lg:flex lg:gap-3">
              <Button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label={t("shell.openMenu")}
                variant="outline"
                size="icon"
                className="shrink-0 text-muted-foreground lg:hidden"
              >
                <Menu className="size-4" />
              </Button>
              <div className="min-w-0 lg:hidden">
                <Brand />
              </div>
              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <div className="hidden lg:block"><GlobalSearch /></div>
                <div className="hidden lg:block"><LanguageSwitcher /></div>
                <span className="hidden items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-xs text-foreground sm:inline-flex">
                  <Flame className="size-3.5 text-legendary" />
                  {hydrated ? progress.streak : 0} {t("shell.days")}
                </span>
                <span className="hidden items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/12 px-2.5 py-2 text-xs text-primary lg:inline-flex">
                  <Zap className="size-3.5" />
                  {hydrated ? progress.xp : 0} XP
                </span>
                {user ? (
                  <Link
                    to="/perfil"
                    className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-level font-display text-xs font-semibold text-primary-foreground"
                    aria-label={t("shell.profile")}
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name ?? t("shell.profile")}
                        className="size-full object-cover"
                      />
                    ) : (
                      initials(profile?.display_name, user.email)
                    )}
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-3"
                    aria-label={t("shell.signIn")}
                  >
                    <LogIn className="size-3.5" />
                    <span className="hidden sm:inline">{t("shell.signIn")}</span>
                  </Link>
                )}
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 px-4 pb-3 sm:px-6 lg:hidden">
              <GlobalSearch className="w-full justify-start" showLabel />
              <LanguageSwitcher />
              <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-primary/40 bg-primary/12 px-2.5 py-2 text-xs text-primary">
                <Zap className="size-3.5" />
                {hydrated ? progress.xp : 0}
                <span className="sr-only"> XP</span>
              </span>
            </div>
            <div className="px-4 pb-2 sm:px-6 lg:hidden">
              <XpBar percent={level.progress} />
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>

          <footer className="border-t border-border px-4 py-6 sm:px-6 lg:px-8">
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Swords className="size-3.5 text-accent" />
              {t("shell.footer")}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <Link to="/termos" className="hover:text-foreground">
                {t("legal.terms.title")}
              </Link>
              <Link to="/privacidade" className="hover:text-foreground">
                {t("legal.privacy.title")}
              </Link>
            </div>
          </footer>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute inset-0 h-full w-full rounded-none border-0 bg-background/80 backdrop-blur-sm"
            aria-label={t("shell.closeMenu")}
            onClick={() => setMobileOpen(false)}
              />
          <div className="relative h-full w-72 max-w-[85%] overflow-y-auto border-r border-border bg-sidebar px-4 py-5">
            <div className="mb-5 flex items-center justify-between">
              <Brand />
              <Button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label={t("shell.closeMenu")}
                variant="outline"
                size="icon"
                className="text-muted-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
