import { Download, Printer, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { downloadCertificatePdf } from "@/lib/certificate-pdf";

export interface CertificateData {
  kind: "module" | "final";
  studentName: string;
  moduleTitle?: string;
  score?: number;
  hours: number;
  issuedAt: string;
  code: string;
  lessons?: number;
  labs?: number;
}

function formatDate(iso: string, lang: string) {
  const locale = lang === "es" ? "es-ES" : lang === "en" ? "en-US" : "pt-BR";
  try {
    return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export function Certificate({ data }: { data: CertificateData }) {
  const { t, lang } = useI18n();
  const isFinal = data.kind === "final";

  return (
    <div className="space-y-3">
      <div
        id="certificate-print"
        className={`relative overflow-hidden rounded-2xl border p-8 text-center sm:p-12 ${
          isFinal
            ? "border-legendary/50 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--legendary)_18%,transparent),transparent_65%)] bg-surface"
            : "border-border bg-surface"
        }`}
      >
        <div className="pointer-events-none absolute inset-3 rounded-xl border border-border/70" />
        <div className="relative">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-accent">
            {t("brand.name")}
          </p>
          <h2
            className={`mt-4 font-display text-xl font-semibold sm:text-3xl ${
              isFinal ? "text-legendary" : "text-foreground"
            }`}
          >
            {isFinal ? t("cert.final") : t("cert.module")}
          </h2>

          <p className="mt-8 text-sm text-muted-foreground">{t("cert.certifies")}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-foreground sm:text-4xl">
            {data.studentName}
          </p>

          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-foreground/90">
            {isFinal
              ? t("cert.finalLine", { lessons: data.lessons ?? 0, labs: data.labs ?? 0 })
              : t("cert.moduleLine", { module: data.moduleTitle ?? "", score: data.score ?? 0 })}
          </p>

          <div className="mt-9 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {isFinal ? t("cert.hours") : t("cert.hoursModule")}
              </p>
              <p className="mt-1 font-display text-lg text-foreground">{data.hours}h</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("cert.issued")}</p>
              <p className="mt-1 font-display text-lg text-foreground">{formatDate(data.issuedAt, lang)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("cert.code")}</p>
              <p className="mt-1 font-mono text-sm text-foreground">{data.code}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-1">
            <div className="h-px w-56 bg-border" />
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-success" /> {t("cert.signature")}
            </p>
          </div>
        </div>
      </div>

      <div className="no-print flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            downloadCertificatePdf(data, {
              brand: t("brand.name"),
              heading: isFinal ? t("cert.final") : t("cert.module"),
              certifies: t("cert.certifies"),
              line: isFinal
                ? t("cert.finalLine", { lessons: data.lessons ?? 0, labs: data.labs ?? 0 })
                : t("cert.moduleLine", { module: data.moduleTitle ?? "", score: data.score ?? 0 }),
              hoursLabel: isFinal ? t("cert.hours") : t("cert.hoursModule"),
              issuedLabel: t("cert.issued"),
              codeLabel: t("cert.code"),
              signature: t("cert.signature"),
              hoursValue: `${data.hours}h`,
              issuedValue: formatDate(data.issuedAt, lang),
            });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Download className="size-4" /> {t("cert.download")}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-sm font-semibold text-foreground hover:border-primary/50"
        >
          <Printer className="size-4" /> {t("cert.print")}
        </button>
      </div>
    </div>
  );
}
