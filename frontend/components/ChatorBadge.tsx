import { Flame } from 'lucide-react';

interface ChatorBadgeProps {
  showText?: boolean;
}

export default function ChatorBadge({ showText = false }: ChatorBadgeProps) {
  return (
    <span 
      className={`inline-flex items-center gap-0.5 bg-[#FFF2E0] text-chator border border-[#FEE2C3] rounded-tag select-none font-bold ${
        showText ? 'px-2 py-0.5 text-xs' : 'p-0.5'
      }`}
      title="Certified चटोर"
    >
      <Flame size={showText ? 14 : 12} fill="currentColor" className="stroke-none animate-pulse" />
      {showText && <span className="font-heading text-[10px] uppercase tracking-wider">चटोर</span>}
    </span>
  );
}
