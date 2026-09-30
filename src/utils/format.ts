const locale = 'pt-BR';

export function formatRest(seconds: number): string {
  if (!seconds || seconds <= 0) return 'Sem pausa';
  if (seconds < 60) return `${seconds} s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m} min ${s} s` : `${m} min`;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function formatLongDate(date = new Date()): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function relativeDay(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(now) - start(d)) / 86_400_000);
  if (diff <= 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 7) return `há ${diff} dias`;
  return formatShortDate(iso);
}

export function formatDuration(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60_000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h} h ${String(r).padStart(2, '0')} min` : `${h} h`;
}

export function plural(n: number, singular: string, pluralForm: string): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

export function capitalize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
