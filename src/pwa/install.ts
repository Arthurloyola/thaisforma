import { useSyncExternalStore } from 'react';
import { createEmitter } from '../utils/emitter';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// O evento pode disparar antes do React montar, por isso é capturado no carregamento do módulo.
let deferred: BeforeInstallPromptEvent | null = null;
const emitter = createEmitter();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    emitter.emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    emitter.emit();
  });
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function useInstallPrompt() {
  const canPrompt = useSyncExternalStore(emitter.subscribe, () => deferred !== null, () => false);
  const install = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    emitter.emit();
    return outcome === 'accepted';
  };
  return { canPrompt, install };
}
