// Editor de texto com formatação, imagens e vídeos, usado no painel de administração.
import { useEffect, useRef } from "react";
import {
  Bold,
  Code2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Underline,
  Video,
  Eraser,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { sanitizeHtml, toHtml, videoEmbedHtml } from "@/lib/rich-text";

interface Props {
  value: string;
  onChange: (html: string) => void;
  rows?: number;
}

export function RichTextEditor({ value, onChange, rows = 6 }: Props) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  // Só reescrevemos o conteúdo quando ele muda por fora (troca de aula/idioma).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = toHtml(value ?? "");
    if (el.innerHTML !== next && document.activeElement !== el) el.innerHTML = next;
  }, [value]);

  function emit() {
    const el = ref.current;
    if (el) onChange(sanitizeHtml(el.innerHTML));
  }

  function run(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  }

  function insert(html: string) {
    ref.current?.focus();
    document.execCommand("insertHTML", false, html);
    emit();
  }

  const buttons: { icon: typeof Bold; label: string; action: () => void }[] = [
    { icon: Bold, label: t("rt.bold"), action: () => run("bold") },
    { icon: Italic, label: t("rt.italic"), action: () => run("italic") },
    { icon: Underline, label: t("rt.underline"), action: () => run("underline") },
    { icon: Heading3, label: t("rt.heading"), action: () => run("formatBlock", "<h3>") },
    { icon: List, label: t("rt.bullets"), action: () => run("insertUnorderedList") },
    { icon: ListOrdered, label: t("rt.numbers"), action: () => run("insertOrderedList") },
    { icon: Quote, label: t("rt.quote"), action: () => run("formatBlock", "<blockquote>") },
    {
      icon: Code2,
      label: t("rt.code"),
      action: () => {
        const text = window.getSelection()?.toString();
        if (text) insert(`<code>${text}</code>`);
        else insert("<code>comando</code>");
      },
    },
    {
      icon: Link2,
      label: t("rt.link"),
      action: () => {
        const url = window.prompt(t("rt.linkPrompt"), "https://");
        if (url) run("createLink", url);
      },
    },
    {
      icon: ImageIcon,
      label: t("rt.image"),
      action: () => {
        const url = window.prompt(t("rt.imagePrompt"), "https://");
        if (url) insert(`<img src="${url}" alt="" />`);
      },
    },
    {
      icon: Video,
      label: t("rt.video"),
      action: () => {
        const url = window.prompt(t("rt.videoPrompt"), "https://");
        if (url) insert(videoEmbedHtml(url));
      },
    },
    { icon: Eraser, label: t("rt.clear"), action: () => run("removeFormat") },
  ];

  return (
    <div className="rounded-lg border border-border bg-surface-2">
      <div className="flex flex-wrap gap-1 border-b border-border px-2 py-1.5">
        {buttons.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={action}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onInput={emit}
        onBlur={emit}
        style={{ minHeight: `${rows * 1.75}rem` }}
        className="rich-editor max-w-none px-3 py-2 text-sm leading-relaxed text-foreground outline-none [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3 [&_code]:font-mono [&_code]:text-accent [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-lg [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-lg [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_video]:w-full [&_video]:rounded-lg"
      />
    </div>
  );
}
