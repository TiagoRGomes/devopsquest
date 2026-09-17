// Renderização segura do conteúdo escrito no painel de administração.
// O editor grava HTML simples (texto formatado, imagens, vídeos e links);
// aqui limpamos as marcações antes de exibir.

const ALLOWED: Record<string, string[]> = {
  p: [],
  br: [],
  hr: [],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  s: [],
  h2: [],
  h3: [],
  h4: [],
  ul: [],
  ol: [],
  li: [],
  blockquote: [],
  code: [],
  pre: [],
  span: [],
  div: [],
  figure: [],
  figcaption: [],
  table: [],
  thead: [],
  tbody: [],
  tr: [],
  th: [],
  td: [],
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height"],
  video: ["src", "controls", "poster", "width", "height"],
  source: ["src", "type"],
  iframe: ["src", "title", "allow", "allowfullscreen", "width", "height"],
};

const SELF_CLOSING = new Set(["br", "img", "source", "hr"]);

function safeUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (v.startsWith("javascript:") || v.startsWith("data:text/html") || v.startsWith("vbscript:")) {
    return false;
  }
  return true;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?([a-zA-Z0-9-]+)((?:\s[^>]*)?)\/?>/g, (match, rawTag: string, attrs: string) => {
      const tag = rawTag.toLowerCase();
      const allowed = ALLOWED[tag];
      if (!allowed) return "";
      if (match.startsWith("</")) return `</${tag}>`;
      const kept: string[] = [];
      const attrRe = /([a-zA-Z-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s">]+))?/g;
      let found: RegExpExecArray | null;
      while ((found = attrRe.exec(attrs ?? ""))) {
        const name = (found[1] ?? "").toLowerCase();
        if (!allowed.includes(name)) continue;
        const value = (found[2] ?? "").replace(/^['"]|['"]$/g, "");
        if ((name === "href" || name === "src") && !safeUrl(value)) continue;
        kept.push(value ? `${name}="${escapeAttr(value)}"` : name);
      }
      if (tag === "a" && !kept.some((k) => k.startsWith("rel="))) {
        kept.push('rel="noopener noreferrer"');
      }
      const attrText = kept.length > 0 ? ` ${kept.join(" ")}` : "";
      return `<${tag}${attrText}${SELF_CLOSING.has(tag) ? " /" : ""}>`;
    });
}

/** Detecta se o texto já é HTML vindo do editor. */
export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-zA-Z][^>]*>/.test(value);
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function toHtml(value: string): string {
  if (looksLikeHtml(value)) return sanitizeHtml(value);
  return `<p>${escapeText(value).replace(/\n/g, "<br />")}</p>`;
}

const PROSE = [
  "max-w-none text-[15px] leading-relaxed text-foreground/90",
  "[&_p]:mb-3 [&_p:last-child]:mb-0",
  "[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground",
  "[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground",
  "[&_h4]:mt-3 [&_h4]:mb-1.5 [&_h4]:font-medium [&_h4]:text-foreground",
  "[&_strong]:text-foreground [&_a]:text-primary [&_a]:underline",
  "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1",
  "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-accent",
  "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-surface-2 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[13px]",
  "[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-border",
  "[&_video]:my-3 [&_video]:w-full [&_video]:rounded-xl [&_video]:border [&_video]:border-border",
  "[&_iframe]:my-3 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-xl [&_iframe]:border [&_iframe]:border-border",
].join(" ");

export function RichText({
  value,
  className = "",
  inline = false,
}: {
  value: string;
  className?: string;
  inline?: boolean;
}) {
  const html = { __html: toHtml(value) };
  if (inline) {
    return <span className={`${PROSE} block ${className}`} dangerouslySetInnerHTML={html} />;
  }
  return <div className={`${PROSE} ${className}`} dangerouslySetInnerHTML={html} />;
}

/** Converte um link de vídeo (YouTube, Vimeo, arquivo) no HTML de incorporação. */
export function videoEmbedHtml(url: string): string {
  const clean = url.trim();
  const yt = clean.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) {
    return `<iframe src="https://www.youtube.com/embed/${yt[1]}" title="video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }
  const vimeo = clean.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return `<iframe src="https://player.vimeo.com/video/${vimeo[1]}" title="video" allowfullscreen></iframe>`;
  }
  return `<video src="${escapeAttr(clean)}" controls></video>`;
}
