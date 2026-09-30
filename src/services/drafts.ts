import type { Workout } from '../types/workout';

/** Rascunhos da tela de edição: sobrevivem a refresh antes de salvar. */
const PREFIX = 'thaisforma:draft:';

const hasStorage = () => typeof localStorage !== 'undefined';

export const drafts = {
  key: (workoutId?: string) => `${PREFIX}${workoutId ?? 'novo'}`,
  load(key: string): Workout | null {
    if (!hasStorage()) return null;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Workout) : null;
    } catch {
      return null;
    }
  },
  save(key: string, workout: Workout) {
    if (!hasStorage()) return;
    try {
      localStorage.setItem(key, JSON.stringify(workout));
    } catch {
      /* cheio: o rascunho é só uma rede de segurança */
    }
  },
  remove(key: string) {
    if (hasStorage()) localStorage.removeItem(key);
  },
  /** Ids de imagem usados por rascunhos ainda não salvos (não podem ser apagados). */
  referencedImageIds(): Set<string> {
    const ids = new Set<string>();
    if (!hasStorage()) return ids;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith(PREFIX)) continue;
      drafts.load(k)?.exercises.forEach((e) => e.imageId && ids.add(e.imageId));
    }
    return ids;
  },
  clearAll() {
    if (!hasStorage()) return;
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  }
};
