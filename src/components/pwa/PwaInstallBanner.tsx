'use client';

import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '@src/hooks/usePWAInstall';

export default function PwaInstallBanner() {
  const { isIOS, isStandalone, shouldShowPrompt, promptInstall, dismissPrompt } = usePWAInstall();

  if (!shouldShowPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl p-4 z-50 flex items-start gap-4 animate-in slide-in-from-bottom-5">
      <div className="h-10 w-10 bg-[#920793]/10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden p-1">
        <img src="/icons/icon-192x192.png" alt="App Icon" className="h-full w-full object-contain" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Install RegentMFB Activate</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          Install our app on your device for quick access from your home screen.
        </p>
        <div className="mt-3 flex items-center gap-2">
          {!isIOS ? (
            <button 
              onClick={promptInstall} 
              className="flex-1 bg-[#920793] hover:bg-[#720573] text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" /> Install App
            </button>
          ) : (
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs py-2 px-3 rounded-lg flex flex-col gap-1.5">
              <span className="font-semibold text-[#920793] dark:text-[#d330d4]">iOS Install Instructions:</span>
              <div className="flex items-center gap-1">
                <span>1. Tap</span> <Share className="h-3 w-3" /> <span>Share</span>
              </div>
              <div className="flex items-center gap-1">
                <span>2. Tap</span> <PlusSquare className="h-3 w-3" /> <span>Add to Home Screen</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <button 
        onClick={dismissPrompt} 
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 p-1"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
