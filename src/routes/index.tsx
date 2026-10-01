import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Boxes,
  Flame,
  FlaskConical,
  Gauge,
  GitCommitHorizontal,
  Lock,
  MessagesSquare,
  Radio,
  Rocket,
  ScrollText,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Terminal,
  Trophy,
  Zap,
} from "lucide-react";
import heroImage from "@/assets/landing-hero.jpg";
import { ALL_LESSONS, MODULES } from "@/data/curriculum";
import { LABS } from "@/data/labs";
import { BOSSES } from "@/data/challenges";
import { REGIONS } from "@/data/world";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { contentText } from "@/lib/content-i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jornada DevOps — campanha do nível 1 ao Ninja" },
      {
        name: "description",
        content:
          "Trilha gamificada de DevOps: 10 reinos, 60 missões, laboratórios reais, Boss Battles de produção, exames, comunidade e certificados em PDF. Português, espanhol e inglês.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Jornada DevOps — campanha do nível 1 ao Ninja" },
      {
        property: "og:description",
        content:
          "Atravesse 10 reinos, derrote os chefes de produção e evolua até o nível 50 com aulas, laboratórios e um projeto de portfólio.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, lang } = useI18n();
  const { session } = useAuth();

  const bossName = (bossId: string) => {
    const boss = BOSSES.find((b) => b.id === bossId);
    return boss ? contentText(lang, boss.id, "name", boss.name) : "";
  };

  const hud = [
    { icon: Boxes, value: MODULES.length, label: t("rpg.hudRealms") },
    { icon: BookOpen, value: ALL_LESSONS.length, label: t("rpg.hudQuests") },
    { icon: FlaskConical, value: LABS.length, label: t("rpg.hudLabs") },
    { icon: Skull, value: BOSSES.length, label: t("rpg.hudBosses") },
    { icon: ScrollText, value: t("rpg.hudCertsValue"), label: t("rpg.hudCerts") },
  ];

  const attrs = [
    { label: t("rpg.attrAuto"), value: 18, icon: Zap },
    { label: t("rpg.attrCloud"), value: 12, icon: Boxes },
    { label: t("rpg.attrResil"), value: 24, icon: Flame },
    { label: t("rpg.attrSec"), value: 8, icon: Shield },
  ];

  const mechanics = [
    { icon: Swords, title: t("rpg.m1.title"), text: t("rpg.m1.text") },
    { icon: Trophy, title: t("rpg.m2.title"), text: t("rpg.m2.text") },
    { icon: MessagesSquare, title: t("rpg.m3.title"), text: t("rpg.m3.text") },
    { icon: Sparkles, title: t("rpg.m4.title"), text: t("rpg.m4.text") },
    { icon: Boxes, title: t("rpg.m5.title"), text: t("rpg.m5.text") },
    { icon: Award, title: t("rpg.m6.title"), text: t("rpg.m6.text") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <span className="grid size-9 place-items-center rounded-lg bg-level text-primary-foreground shadow-glow">
            <Terminal className="size-4.5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold tracking-tight text-foreground">
              {t("brand.name")}
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              {t("brand.tagline")}
            </span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            {session ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Gauge className="size-3.5" />
                {t("nav.dashboard")}
              </Link>
            ) : (
              <Link
                to="/auth"
                className="rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-surface"
              >
                {t("shell.signIn")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border">
          <img
            src={heroImage}
            alt=""
            width={1600}
            height={912}
            aria-hidden
            className="absolute inset-0 size-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-hero" />
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

          <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-success">
                  <Radio className="size-3" />
                  {t("rpg.badgeSeason")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-epic/40 bg-epic/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-epic">
                  <MessagesSquare className="size-3" />
                  {t("rpg.badgeGuild")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {t("rpg.badgeLangs")}
                </span>
              </div>

              <p className="mt-6 font-mono text-xs uppercase tracking-[0.22em] text-accent">
                {t("rpg.heroKicker")}
              </p>
              <h1 className="mt-3 font-display text-5xl font-semibold leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                {t("rpg.heroTitle1")}{" "}
                <span className="text-gradient drop-shadow-[0_0_32px_color-mix(in_oklab,var(--primary)_55%,transparent)]">
                  {t("rpg.heroTitle2")}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t("rpg.heroLead")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {session ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-level px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
                  >
                    <Rocket className="size-4" />
                    {t("rpg.ctaContinue")}
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      search={{ mode: "signup" }}
                      className="inline-flex items-center gap-2 rounded-xl bg-level px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
                    >
                      <Swords className="size-4" />
                      {t("rpg.ctaCreate")}
                    </Link>
                    <Link
                      to="/auth"
                      className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-surface-2 px-5 py-3 text-sm font-medium text-foreground hover:bg-surface"
                    >
                      {t("rpg.ctaLogin")}
                    </Link>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-1.5 px-2 py-3 text-sm text-accent hover:underline"
                    >
                      {t("rpg.ctaGuest")}
                    </Link>
                  </>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{t("rpg.note")}</p>
            </div>

            {/* CHARACTER SHEET */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-level opacity-20 blur-2xl" aria-hidden />
              <div className="panel relative overflow-hidden p-5 shadow-elevated sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                    {t("rpg.sheet")}
                  </p>
                  <span className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                    01 / 50
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="relative grid size-14 shrink-0 place-items-center rounded-xl bg-level text-primary-foreground shadow-glow">
                    <Terminal className="size-6" />
                    <span className="absolute -bottom-1.5 -right-1.5 grid size-6 place-items-center rounded-full border border-background bg-surface font-mono text-[10px] font-semibold text-accent">
                      1
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-semibold text-foreground">
                      {t("rpg.sheetName")}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{t("rpg.sheetClass")}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("rpg.xpNext")}</span>
                    <span className="font-mono text-foreground">150 / 600 XP</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full w-1/4 rounded-full bg-xp shadow-glow" />
                  </div>
                </div>

                <div className="mt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t("rpg.attrs")}
                  </p>
                  <ul className="mt-2.5 space-y-2.5">
                    {attrs.map(({ label, value, icon: Icon }) => (
                      <li key={label} className="flex items-center gap-2.5">
                        <Icon className="size-3.5 shrink-0 text-accent" />
                        <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                          <span
                            className="block h-full rounded-full bg-xp"
                            style={{ width: `${value}%` }}
                          />
                        </span>
                        <span className="w-8 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                          {value}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t("rpg.firstBadges")}
                  </p>
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    {[
                      { icon: GitCommitHorizontal, label: t("rpg.badgeCommit") },
                      { icon: Radio, label: t("rpg.badgePing") },
                      { icon: Rocket, label: t("rpg.badgeShip"), locked: true },
                    ].map(({ icon: Icon, label, locked }) => (
                      <div
                        key={label}
                        className={
                          locked
                            ? "rounded-xl border border-border bg-surface-2/50 p-2.5 text-center opacity-55"
                            : "rounded-xl border border-accent/30 bg-accent/10 p-2.5 text-center"
                        }
                      >
                        <span className="mx-auto grid size-7 place-items-center rounded-lg bg-surface-2 text-accent">
                          {locked ? <Lock className="size-3.5" /> : <Icon className="size-3.5" />}
                        </span>
                        <p className="mt-1.5 text-[10px] leading-tight text-muted-foreground">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HUD */}
        <section className="border-b border-border bg-surface-2/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {t("rpg.hudTitle")}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {hud.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="panel flex items-center gap-3 px-4 py-3.5 transition-colors hover:border-primary/40"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                    <Icon className="size-4.5" />
                  </span>
                  <span>
                    <dt className="font-display text-2xl font-semibold leading-none text-foreground">
                      {value}
                    </dt>
                    <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {label}
                    </dd>
                  </span>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* REALM MAP */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {t("rpg.mapTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("rpg.mapLead")}</p>

          <ol className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REGIONS.map((r, i) => (
              <li
                key={r.id}
                className="group panel relative overflow-hidden p-4 transition-all hover:-translate-y-0.5 hover:border-primary/45"
              >
                <span
                  className="absolute inset-x-0 top-0 h-px bg-xp opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-level font-display text-sm font-semibold text-primary-foreground">
                    {String(r.order).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                      {t("rpg.mapRealm")} {r.order}
                      {i === 0 ? "" : ""}
                    </p>
                    <p className="font-display text-base font-semibold leading-tight text-foreground">
                      {contentText(lang, r.id, "name", r.name)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {contentText(lang, r.id, "theme", r.theme)}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/12 px-2 py-1 text-[11px] text-destructive">
                    <Skull className="size-3" />
                    {bossName(r.bossId) || t("rpg.mapBoss")}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                    {t("rpg.mapReq")} {r.requiredLevel}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-accent">
                    <Zap className="size-3" />
                    {r.xp} XP
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* MECHANICS */}
        <section className="border-y border-border bg-surface-2/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {t("rpg.mechTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("rpg.mechLead")}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mechanics.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="panel p-5 transition-all hover:-translate-y-0.5 hover:border-primary/45"
                >
                  <span className="inline-grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-3.5 font-display text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="panel relative overflow-hidden bg-hero p-6 sm:p-8">
              <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
              <div className="relative">
                <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                  {t("rpg.finalTitle")}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {t("rpg.finalText")}
                </p>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-level px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
                >
                  <Swords className="size-4" />
                  {t("rpg.ctaCreate")}
                </Link>
              </div>
            </div>
            <div className="panel p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-foreground">
                {t("rpg.langTitle")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("rpg.langText")}</p>
              <div className="mt-5">
                <LanguageSwitcher variant="full" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-8 sm:px-6">
        <p className="mx-auto w-full max-w-6xl text-xs text-muted-foreground">{t("shell.footer")}</p>
      </footer>
    </div>
  );
}
