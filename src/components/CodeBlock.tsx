import { useState } from "react";
import { Check, Copy, ShieldAlert } from "lucide-react";
import type { CodeBlock as CodeBlockType } from "@/lib/types";

export function CodeBlock({ block }: { block: CodeBlockType }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-surface-2">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{block.label}</p>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {block.language}
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label="Copiar código"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
        >
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </figcaption>
      <pre className="max-h-[32rem] overflow-auto px-4 py-3.5 text-[12.5px] leading-relaxed text-foreground/90">
        <code>{block.code}</code>
      </pre>
      {block.securityNote && (
        <p className="flex items-start gap-2 border-t border-border bg-destructive/10 px-4 py-2.5 text-xs text-foreground/90">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span>
            <strong className="font-semibold">Nota de segurança:</strong> {block.securityNote}
          </span>
        </p>
      )}
    </figure>
  );
}
