import { BookOpen, Castle, Cloud, GitBranch, Mountain, Network, Package, Sparkles, Telescope, Terminal } from 'lucide-react';
import atlas from '@/assets/realm-atlas.jpg';
import { REGIONS } from '@/data/world';

// Coordinates are in the uncropped atlas image, never in a viewport crop.
export const REALM_ART = [
  { x: 12, y: 29, icon: Terminal, tone: 'success' },
  { x: 31, y: 30, icon: Network, tone: 'success' },
  { x: 50, y: 27, icon: BookOpen, tone: 'primary' },
  { x: 69, y: 32, icon: Package, tone: 'legendary' },
  { x: 89, y: 29, icon: Castle, tone: 'destructive' },
  { x: 90, y: 65, icon: Cloud, tone: 'primary' },
  { x: 71, y: 66, icon: Sparkles, tone: 'success' },
  { x: 51, y: 65, icon: Mountain, tone: 'accent' },
  { x: 28, y: 65, icon: GitBranch, tone: 'accent' },
  { x: 10, y: 63, icon: Telescope, tone: 'legendary' },
] as const;
export { atlas };
export function moduleRealmArt(moduleId: string) {
  const index = REGIONS.findIndex(region => region.moduleIds.includes(moduleId));
  return REALM_ART[Math.max(0, index)] ?? REALM_ART[0];
}