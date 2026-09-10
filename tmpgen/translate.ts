// Traduz o conteúdo PT para ES/EN via Lovable AI Gateway, com cache resumível.
const pt: Record<string, string> = await Bun.file("/tmp/tr/pt.json").json();
const lang = process.argv[2] as "es" | "en";
const cachePath = `/tmp/tr/${lang}.json`;
const done: Record<string, string> = (await Bun.file(cachePath).exists())
  ? await Bun.file(cachePath).json()
  : {};

const target = lang === "es" ? "Spanish (Spain, español de España)" : "English (US)";
const SYS = `You are a professional technical translator for a DevOps learning platform.
Translate every JSON string value from Brazilian Portuguese into ${target}.
Rules:
- Keep DevOps/technical terms, tool names, product names, CLI commands, flags, file names, YAML/JSON keys, URLs and code identifiers exactly as they are (Docker, Kubernetes, kubectl, GitOps, Pod, Deployment, CloudShop, etc).
- Preserve the " | " separator that splits list items, and keep the same number of items.
- Preserve placeholders like {count}, {xp}.
- Natural, clear, didactic prose aimed at any beginner; no personal names.
- Reply ONLY with a JSON object mapping the same keys to translated strings. No markdown fences.`;

const keys = Object.keys(pt).filter((k) => !done[k]);
const batches: string[][] = [];
let cur: string[] = [];
let size = 0;
for (const k of keys) {
  const len = pt[k].length;
  if (cur.length && (size + len > 5000 || cur.length >= 25)) {
    batches.push(cur);
    cur = [];
    size = 0;
  }
  cur.push(k);
  size += len;
}
if (cur.length) batches.push(cur);
console.log(lang, "batches", batches.length);

async function call(batch: string[], attempt = 1): Promise<void> {
  const payload: Record<string, string> = {};
  for (const k of batch) payload[k] = pt[k];
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env["LOVABLE_API_KEY"]}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYS },
          { role: "user", content: JSON.stringify(payload) },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
    const json = await res.json();
    const text: string = json.choices[0].message.content;
    const parsed = JSON.parse(text.replace(/^```json\s*|```$/g, ""));
    for (const k of batch) {
      const v = parsed[k];
      if (typeof v === "string" && v.trim()) done[k] = v;
    }
  } catch (e) {
    if (attempt >= 4) {
      console.error("FAIL", batch[0], String(e).slice(0, 160));
      return;
    }
    await new Promise((r) => setTimeout(r, 2000 * attempt));
    return call(batch, attempt + 1);
  }
}

let i = 0;
const CONC = 6;
async function worker() {
  while (i < batches.length) {
    const idx = i++;
    await call(batches[idx]);
    if (idx % 5 === 0) {
      await Bun.write(cachePath, JSON.stringify(done, null, 1));
      console.log(lang, idx + 1, "/", batches.length);
    }
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
await Bun.write(cachePath, JSON.stringify(done, null, 1));
console.log(lang, "translated", Object.keys(done).length, "of", Object.keys(pt).length);
