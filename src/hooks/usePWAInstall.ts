'use client';

import { useState, useEffect } from 'react';

// Extend window object for Chrome's beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // No persistent dismissal across refreshes, as requested

    // Check if already in standalone (PWA) mode
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      // @ts-ignore - iOS safari specific
      const isStandaloneNavigator = window.navigator.standalone === true;
      return isStandaloneMedia || isStandaloneNavigator;
    };

    setIsStandalone(checkStandalone());

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if the script in the head caught it before hydration
    if (typeof window !== 'undefined' && (window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
    }

    // Capture Android/Chrome install prompt if it fires after hydration
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const dismissPrompt = () => {
    setHasDismissed(true);
    // Automatically re-show after 1 hour if they don't refresh
    setTimeout(() => {
      setHasDismissed(false);
    }, 60 * 60 * 1000);
  };

  const shouldShowPrompt = isClient && !isStandalone && !hasDismissed;

  return {
    isIOS,
    isStandalone,
    deferredPrompt,
    shouldShowPrompt,
    promptInstall,
    dismissPrompt,
  };
}
