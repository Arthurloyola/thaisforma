import type { SessionRecord } from '../types/workout';
import { addDays, dayKey, startOfDay, startOfWeek } from './dates';

export function sessionsInWeek(history: SessionRecord[], ref = new Date()): SessionRecord[] {
  const start = startOfWeek(ref).getTime();
  const end = addDays(startOfWeek(ref), 7).getTime();
  return history.filter((h) => {
    const t = new Date(h.finishedAt).getTime();
    return t >= start && t < end;
  });
}

export function countByDay(history: SessionRecord[]): Map<string, number> {
  const map = new Map<string, number>();
  history.forEach((h) => {
    const k = dayKey(new Date(h.finishedAt));
    map.set(k, (map.get(k) ?? 0) + 1);
  });
  return map;
}

/** Semanas seguidas com pelo menos um treino (a semana atual só conta se já tiver treino). */
export function weekStreak(history: SessionRecord[], now = new Date()): number {
  const weeks = new Set(history.map((h) => startOfWeek(new Date(h.finishedAt)).getTime()));
  let cursor = startOfWeek(now);
  if (!weeks.has(cursor.getTime())) cursor = addDays(cursor, -7);
  let streak = 0;
  while (weeks.has(cursor.getTime())) {
    streak++;
    cursor = addDays(cursor, -7);
  }
  return streak;
}

export interface DayCell {
  date: Date;
  count: number;
  isFuture: boolean;
  isToday: boolean;
}

/** Grade das últimas N semanas (segunda a domingo), terminando na semana atual. */
export function calendarGrid(history: SessionRecord[], weeks = 5, now = new Date()): DayCell[] {
  const counts = countByDay(history);
  const first = addDays(startOfWeek(now), -7 * (weeks - 1));
  const today = startOfDay(now).getTime();
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = addDays(first, i);
    return {
      date,
      count: counts.get(dayKey(date)) ?? 0,
      isFuture: date.getTime() > today,
      isToday: date.getTime() === today
    };
  });
}

export function favoriteWorkout(history: SessionRecord[]): { name: string; count: number } | null {
  const map = new Map<string, number>();
  history.forEach((h) => map.set(h.workoutName, (map.get(h.workoutName) ?? 0) + 1));
  let best: { name: string; count: number } | null = null;
  map.forEach((count, name) => {
    if (!best || count > best.count) best = { name, count };
  });
  return best;
}
