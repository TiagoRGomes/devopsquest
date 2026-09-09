import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  Boxes,
  FlaskConical,
  Gauge,
  Rocket,
  Skull,
  Terminal,
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
      { title: "Jornada DevOps — do zero ao nível Ninja" },
      {
        name: "description",
        content:
          "Trilha gamificada de DevOps com aulas, laboratórios práticos, desafios, Boss Battles e projeto de portfólio. Disponível em português, espanhol e inglês.",
      },
      { property: "og:title", content: "Jornada DevOps — do zero ao nível Ninja" },
      {
        property: "og:description",
        content: "Aprenda DevOps na prática com XP, níveis, laboratórios e um projeto real de portfólio.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, lang } = useI18n();
  const { session } = useAuth();

  const stats = [
    { value: MODULES.length, label: t("landing.statModules") },
    { value: ALL_LESSONS.length, label: t("landing.statLessons") },
    { value: LABS.length, label: t("landing.statLabs") },
    { value: BOSSES.length, label: t("landing.statBosses") },
  ];

  const features = [
    { icon: BookOpen, title: t("landing.f1.title"), text: t("landing.f1.text") },
    { icon: FlaskConical, title: t("landing.f2.title"), text: t("landing.f2.text") },
    { icon: Award, title: t("landing.f3.title"), text: t("landing.f3.text") },
    { icon: Boxes, title: t("landing.f4.title"), text: t("landing.f4.text") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <span className="grid size-9 place-items-center rounded-lg bg-level text-primary-foreground">
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
        <section className="relative overflow-hidden border-b border-border">
          <img
            src={heroImage}
            alt=""
            width={1600}
            height={912}
            aria-hidden
            className="absolute inset-0 size-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
          <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {t("landing.eyebrow")}
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              <span className="text-gradient">{t("landing.title")}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("landing.subtitle")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {session ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
                >
                  <Rocket className="size-4" />
                  {t("landing.ctaDashboard")}
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth"
                    search={{ mode: "signup" }}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
                  >
                    <Rocket className="size-4" />
                    {t("landing.ctaPrimary")}
                  </Link>
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-5 py-3 text-sm font-medium text-foreground hover:bg-surface"
                  >
                    {t("landing.ctaSecondary")}
                  </Link>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 px-2 py-3 text-sm text-accent hover:underline"
                  >
                    {t("landing.ctaGuest")}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t("landing.note")}</p>

            <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="panel px-4 py-3.5">
                  <dt className="font-display text-2xl font-semibold text-foreground">{s.value}</dt>
                  <dd className="mt-0.5 text-xs text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="max-w-3xl font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {t("landing.featuresTitle")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("landing.featuresLead")}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="panel p-5">
                <span className="inline-grid size-10 place-items-center rounded-lg bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-3.5 font-display text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-surface-2/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {t("landing.pathTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("landing.pathLead")}</p>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {REGIONS.map((r) => (
                <li key={r.id} className="panel px-4 py-3.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                    {String(r.order).padStart(2, "0")}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-foreground">
                    {contentText(lang, r.id, "name", r.name)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{contentText(lang, r.id, "theme", r.theme)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="panel bg-hero p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {t("landing.finalTitle")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("landing.finalText")}</p>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
              >
                <Skull className="size-4" />
                {t("landing.ctaPrimary")}
              </Link>
            </div>
            <div className="panel p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-foreground">
                {t("landing.langTitle")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("landing.langText")}</p>
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
