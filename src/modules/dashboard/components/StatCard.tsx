import { LucideIcon } from 'lucide-react';
import { cn } from '@src/utils';

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  sub?: string;
  onClick?: () => void;
};

export function StatCard({ label, value, icon: Icon, iconColor, iconBg, sub, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm border border-gray-100',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]'
      )}
    >
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg ?? '#f5e6f5' }}
      >
        <Icon className="h-5 w-5" style={{ color: iconColor ?? '#920793' }} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] text-gray-500 font-medium leading-none mb-1.5">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-[12px] text-gray-400 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}
