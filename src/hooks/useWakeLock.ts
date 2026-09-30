import { useEffect } from 'react';

/** Mantém a tela acesa durante o treino (quando o navegador suporta). */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const s = await navigator.wakeLock.request('screen');
        if (cancelled) s.release();
        else sentinel = s;
      } catch {
        /* sem permissão ou bateria fraca: segue sem */
      }
    };
    const onVisible = () => document.visibilityState === 'visible' && request();

    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      sentinel?.release().catch(() => undefined);
    };
  }, [enabled]);
}
