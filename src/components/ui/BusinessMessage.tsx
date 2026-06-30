'use client';

import { useMessageStore } from '@src/store/message.store';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@src/utils';

export function BusinessMessage() {
  const { isOpen, message, closeMessage } = useMessageStore();

  if (!isOpen || !message) return null;

  const Icon = message.type === 'success' ? CheckCircle2 : message.type === 'error' ? AlertTriangle : Info;
  const iconColor = message.type === 'success' ? 'text-green-600' : message.type === 'error' ? 'text-red-600' : 'text-blue-600';
  const bgColor = message.type === 'success' ? 'bg-green-50' : message.type === 'error' ? 'bg-red-50' : 'bg-blue-50';
  const borderColor = message.type === 'success' ? 'border-green-200' : message.type === 'error' ? 'border-red-200' : 'border-blue-200';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 transition-all backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl relative animate-in zoom-in-95 fade-in duration-200",
        borderColor
      )}>
        {/* Close Button */}
        <button 
          onClick={closeMessage}
          className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className={cn("flex mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-full", bgColor)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
          
          <div className="flex-1">
            <h2 className="text-sm font-bold text-gray-900">{message.title}</h2>
            <p className="mt-1 text-[13px] text-gray-600 leading-relaxed">{message.description}</p>
            
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  if (message.onAction) message.onAction();
                  closeMessage();
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90",
                  message.type === 'success' ? 'bg-green-600' : message.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                )}
              >
                {message.actionLabel || 'Acknowledge'}
              </button>
              {message.cancelLabel && (
                <button
                  onClick={() => {
                    if (message.onCancel) message.onCancel();
                    closeMessage();
                  }}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {message.cancelLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
