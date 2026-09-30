import { repositories, type Repositories } from '../storage';
import { buildSampleWorkouts } from './seed';
import { cleanupOrphanImages } from './workoutService';

const SEEDED_KEY = 'seeded';

/** Cria os treinos de exemplo só na primeira abertura (nunca recria se ela apagar tudo). */
export async function ensureSeeded(repos: Repositories = repositories): Promise<void> {
  if (await repos.meta.get<boolean>(SEEDED_KEY)) return;
  const existing = await repos.workouts.list();
  if (existing.length === 0) {
    await repos.workouts.replaceAll(buildSampleWorkouts());
  }
  await repos.meta.set(SEEDED_KEY, true);
}

export async function addSampleWorkouts(repos: Repositories = repositories): Promise<number> {
  const start = await repos.workouts.nextOrder();
  const samples = buildSampleWorkouts(start);
  for (const w of samples) await repos.workouts.save(w);
  return samples.length;
}

/**
 * Pede ao navegador para não apagar os dados em caso de pouco espaço.
 * (No iPhone, instalar na Tela de Início é o que realmente protege os dados.)
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true;
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

export async function initializeApp(): Promise<void> {
  await ensureSeeded();
  void requestPersistentStorage();
  void cleanupOrphanImages().catch(() => undefined);
}
