import type { AppSettings } from '../types/workout';
import { createEmitter } from '../utils/emitter';

/** Configurações pequenas ficam no localStorage (leitura síncrona, sem piscar a tela). */
const KEY = 'thaisforma:settings';
const DEFAULTS: AppSettings = { userName: 'Thaís', weeklyGoal: 4 };

const emitter = createEmitter();
let cache: AppSettings | null = null;

function read(): AppSettings {
  if (cache) return cache;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    cache = raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppSettings>) } : { ...DEFAULTS };
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache;
}

export const settingsStore = {
  get: read,
  set(patch: Partial<AppSettings>) {
    cache = { ...read(), ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(cache));
    } catch {
      /* armazenamento cheio ou bloqueado: mantém em memória */
    }
    emitter.emit();
  },
  reset() {
    cache = { ...DEFAULTS };
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignora */
    }
    emitter.emit();
  },
  subscribe: emitter.subscribe
};
