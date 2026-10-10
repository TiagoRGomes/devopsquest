import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Difficulty, Rarity } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export function XpBar({ percent, className }: { percent: number; className?: string }) {
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-xp transition-[width] duration-700"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

export function Panel({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return <Tag className={cn("panel p-5", className)}>{children}</Tag>;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        )}
        <h2 className="text-2xl font-semibold text-foreground sm:text-[1.7rem]">{title}</h2>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Chip({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "primary" | "accent" | "success" | "warning" | "danger" | "epic" | "legendary";
  className?: string;
}) {
  const tones: Record<string, string> = {
    muted: "border-border bg-surface-2 text-muted-foreground",
    primary: "border-primary/40 bg-primary/12 text-primary",
    accent: "border-accent/40 bg-accent/12 text-accent",
    success: "border-success/40 bg-success/12 text-success",
    warning: "border-warning/40 bg-warning/12 text-warning",
    danger: "border-destructive/40 bg-destructive/12 text-destructive",
    epic: "border-epic/40 bg-epic/12 text-epic",
    legendary: "border-legendary/40 bg-legendary/12 text-legendary",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyChip({ level }: { level: Difficulty }) {
  const { t } = useI18n();
  const tone = {
    Iniciante: "success",
    Intermediário: "primary",
    Avançado: "warning",
    Ninja: "epic",
  } as const;
  return <Chip tone={tone[level]}>{t(`diff.${level}`)}</Chip>;
}

export function RarityChip({ rarity }: { rarity: Rarity }) {
  const { t } = useI18n();
  const tone = {
    Comum: "muted",
    Raro: "primary",
    Épico: "epic",
    Lendário: "legendary",
  } as const;
  return <Chip tone={tone[rarity]}>{t(`rar.${rarity}`)}</Chip>;
}

export function InsightBox({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "why" | "mistake" | "tip" | "security" | "interview";
  children: ReactNode;
}) {
  const styles: Record<string, string> = {
    why: "border-l-primary bg-primary/[0.07]",
    mistake: "border-l-warning bg-warning/[0.07]",
    tip: "border-l-success bg-success/[0.07]",
    security: "border-l-destructive bg-destructive/[0.07]",
    interview: "border-l-epic bg-epic/[0.07]",
  };
  return (
    <div className={cn("rounded-r-lg border-l-2 px-4 py-3", styles[tone])}>
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/70">{label}</p>
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="panel px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon && <span className="text-accent">{icon}</span>}
      </div>
      <p className="mt-1.5 font-display text-2xl font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="panel px-6 py-12 text-center">
      <p className="font-display text-lg font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function LockedOverlay({ requiredLevel }: { requiredLevel: number }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-muted-foreground">
      {t("ui.locked", { level: requiredLevel })}
    </span>
  );
}
