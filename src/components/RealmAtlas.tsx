import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Compass, Lock, Swords } from 'lucide-react';
import mapImage from '@/assets/medieval-world.jpg';
import { REGIONS } from '@/data/world';
import { getModuleById } from '@/data/curriculum';
import { useI18n } from '@/lib/i18n';
import { contentText } from '@/lib/content-i18n';
import { useProgress } from '@/lib/progress';
import { Button } from '@/components/ui/button';
const points = [[72,66],[17,69],[30,39],[86,42],[55,46],[79,19],[12,40],[15,15],[52,17],[42,66]];
export function RealmAtlas() {
  const [selected, setSelected] = useState(0);
  const { lang, t } = useI18n();
  const { level } = useProgress();
  const region = REGIONS[selected];
  if (!region) return null;
  const module = getModuleById(region.moduleIds[0]);
  return <div className="realm-atlas">
    <div className="realm-map">
      <img src={mapImage} width={1536} height={1024} loading="lazy" alt={t('map.title')} />
      <span className="map-compass" aria-hidden><Compass /></span>
      {REGIONS.map((r, i) => <Button key={r.id} variant="outline" size="icon" className={`realm-pin ${i === selected ? 'is-selected' : ''}`} style={{left: `${points[i]?.[0] ?? 50}%`, top: `${points[i]?.[1] ?? 50}%`}} onClick={() => setSelected(i)} aria-label={`${r.order}. ${contentText(lang,r.id,'name',r.name)}`} aria-pressed={i === selected}>{r.order}</Button>)}
    </div>
    <div className="realm-caption">
      <div className="flex min-w-0 items-center gap-3"><span className="crest-small"><Swords className="size-5" /></span><div><p className="text-xs uppercase text-primary">{t('rpg.mapRealm')} {region.order}</p><h3 className="mt-1 font-display text-xl font-bold">{contentText(lang,region.id,'name',region.name)}</h3><p className="mt-1 text-sm text-muted-foreground">{contentText(lang,region.id,'theme',region.theme)}</p></div></div>
      <div className="flex flex-wrap items-center gap-4"><span className="flex items-center gap-1.5 text-xs text-muted-foreground">{level.level < region.requiredLevel && <Lock className="size-3" />}{t('rpg.mapReq')} {region.requiredLevel} · {region.xp} XP</span>{module && <Button asChild variant="default"><Link to="/modulos/$slug" params={{slug:module.slug}}>{t('mod.openModule')}<ArrowRight /></Link></Button>}</div>
    </div>
  </div>;
}
