import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { formatClock } from '../utils/format';

export interface RestRequest {
  key: number;
  seconds: number;
  label: string;
}

/** Cronômetro de descanso flutuante. Calcula pelo horário final, então não atrasa em segundo plano. */
export function RestTimer({ request, onClose }: { request: RestRequest | null; onClose: () => void }) {
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!request) return;
    setEndsAt(Date.now() + request.seconds * 1000);
    setNow(Date.now());
    setFinished(false);
    // O AudioContext precisa nascer de um toque do usuário (regra do iPhone).
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audio.current ??= new Ctx();
      void audio.current.resume();
    } catch {
      audio.current = null;
    }
  }, [request]);

  useEffect(() => {
    if (!request || finished) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [request, finished]);

  const remaining = Math.max(0, (endsAt - now) / 1000);

  useEffect(() => {
    if (!request || finished || endsAt === 0 || remaining > 0) return;
    setFinished(true);
    navigator.vibrate?.([220, 120, 220]);
    const ctx = audio.current;
    if (ctx) {
      [0, 0.28].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.22);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.24);
      });
    }
    const t = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(t);
  }, [remaining, request, finished, endsAt, onClose]);

  if (!request) return null;
  const total = request.seconds || 1;
  const pct = finished ? 1 : 1 - remaining / total;

  return (
    <div className={`rest-timer${finished ? ' is-finished' : ''}`} role="timer" aria-live="polite">
      <div className="rest-timer__bar" style={{ transform: `scaleX(${pct})` }} aria-hidden="true" />
      <div className="rest-timer__text">
        <span className="rest-timer__label">{finished ? 'Descanso concluído' : `Descanso, ${request.label}`}</span>
        <span className="rest-timer__clock">{finished ? 'Bora!' : formatClock(remaining)}</span>
      </div>
      {!finished && (
        <button type="button" className="rest-timer__btn" onClick={() => setEndsAt((e) => e + 15_000)} aria-label="Mais 15 segundos">
          <Plus /> 15 s
        </button>
      )}
      <button type="button" className="rest-timer__btn rest-timer__btn--icon" onClick={onClose} aria-label="Fechar cronômetro">
        <X />
      </button>
    </div>
  );
}
