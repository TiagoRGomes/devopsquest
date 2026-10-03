import { CONTENT_GEN_ES } from "@/lib/content-i18n/gen-es";
import { CONTENT_GEN_EN } from "@/lib/content-i18n/gen-en";
import { CONTENT_ES_A, CONTENT_EN_A } from "@/lib/content-i18n/a";
import { CONTENT_ES_B, CONTENT_EN_B } from "@/lib/content-i18n/b";
import { CONTENT_ES_C, CONTENT_EN_C } from "@/lib/content-i18n/c";
const pt: Record<string,string> = await Bun.file("tmpgen/pt.json").json();
for (const [l, d] of [["es",{...CONTENT_GEN_ES,...CONTENT_ES_A,...CONTENT_ES_B,...CONTENT_ES_C}],["en",{...CONTENT_GEN_EN,...CONTENT_EN_A,...CONTENT_EN_B,...CONTENT_EN_C}]] as const) {
  const out: Record<string,string> = {}; let miss=0;
  for (const k in pt) { const v=(d as any)[k]; const ok = v && v!==pt[k] && v.split(" | ").length===pt[k].split(" | ").length;
    if (ok) out[k]=v; else miss++; }
  await Bun.write(`tmpgen/${l}.json`, JSON.stringify(out));
  console.log(l,"missing",miss);
}
