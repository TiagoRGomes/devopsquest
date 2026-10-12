import { BookOpen, Castle, Cloud, GitBranch, Mountain, Network, Package, Sparkles, Telescope, Terminal } from 'lucide-react';
import atlas from '@/assets/realm-atlas.jpg';
import realm1 from '@/assets/realm-1.jpg';
import realm2 from '@/assets/realm-2.jpg';
import realm3 from '@/assets/realm-3.jpg';
import realm4 from '@/assets/realm-4.jpg';
import realm5 from '@/assets/realm-5.jpg';
import realm6 from '@/assets/realm-6.jpg';
import realm7 from '@/assets/realm-7.jpg';
import realm8 from '@/assets/realm-8.jpg';
import realm9 from '@/assets/realm-9.jpg';
import realm10 from '@/assets/realm-10.jpg';
import { REGIONS } from '@/data/world';

// Coordinates are in the uncropped atlas image, never in a viewport crop.
export const REALM_ART = [
  { x: 12, y: 29, icon: Terminal, tone: 'success', image: realm1 },
  { x: 31, y: 30, icon: Network, tone: 'success', image: realm2 },
  { x: 50, y: 27, icon: BookOpen, tone: 'primary', image: realm3 },
  { x: 69, y: 32, icon: Package, tone: 'legendary', image: realm4 },
  { x: 89, y: 29, icon: Castle, tone: 'destructive', image: realm5 },
  { x: 90, y: 65, icon: Cloud, tone: 'primary', image: realm6 },
  { x: 71, y: 66, icon: Sparkles, tone: 'success', image: realm7 },
  { x: 51, y: 65, icon: Mountain, tone: 'accent', image: realm8 },
  { x: 28, y: 65, icon: GitBranch, tone: 'accent', image: realm9 },
  { x: 10, y: 63, icon: Telescope, tone: 'legendary', image: realm10 },
] as const;
export { atlas };
export function moduleRealmArt(moduleId: string) {
  const index = REGIONS.findIndex(region => region.moduleIds.includes(moduleId));
  return REALM_ART[Math.max(0, index)] ?? REALM_ART[0];
}