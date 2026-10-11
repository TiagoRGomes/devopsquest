import logo from '@/assets/devopsquest-logo.png';
import { cn } from '@/lib/utils';

export function BrandLogo({ className = '' }: { className?: string }) {
  return <img src={logo} width={1024} height={1024} alt="DevOpsQuest" className={cn('brand-logo', className)} />;
}