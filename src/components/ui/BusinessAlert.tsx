import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@src/utils';

export type InlineAlertType = 'success' | 'error' | 'info';

type Props = {
  type: InlineAlertType;
  title: string;
  description: string | React.ReactNode;
  onClose?: () => void;
  className?: string;
};

export function BusinessAlert({ type, title, description, onClose, className }: Props) {
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertTriangle : Info;
  const iconColor = type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-blue-600';
  const bgColor = type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50';
  const borderColor = type === 'success' ? 'border-green-200' : type === 'error' ? 'border-red-200' : 'border-blue-200';

  return (
    <div className={cn(
      "relative flex items-start gap-3 rounded-lg border p-4 shadow-sm transition-all",
      bgColor,
      borderColor,
      className
    )}>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-black/5 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className={cn("flex mt-0.5 h-6 w-6 shrink-0 items-center justify-center rounded-full", bgColor)}>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
      
      <div className="flex-1 pr-6">
        <h3 className={cn("text-[13px] font-bold", type === 'error' ? 'text-red-900' : type === 'success' ? 'text-green-900' : 'text-blue-900')}>
          {title}
        </h3>
        <div className={cn("mt-1 text-[12px] leading-relaxed whitespace-pre-line", type === 'error' ? 'text-red-700' : type === 'success' ? 'text-green-700' : 'text-blue-700')}>
          {description}
        </div>
      </div>
    </div>
  );
}
