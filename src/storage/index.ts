/**
 * Ponto único de troca da persistência.
 *
 * Hoje: IndexedDB (via Dexie), 100% local e offline.
 * Amanhã: troque as instâncias abaixo por implementações de Supabase/Firebase
 * que sigam os contratos de `./contracts` — nenhuma tela precisa mudar.
 */
import type { ImageRepository, MetaRepository, SessionRepository, WorkoutRepository } from './contracts';
import { ThaisformaDB } from './indexeddb/db';
import { IndexedDbWorkoutRepository } from './indexeddb/IndexedDbWorkoutRepository';
import { IndexedDbImageRepository } from './indexeddb/IndexedDbImageRepository';
import { IndexedDbSessionRepository } from './indexeddb/IndexedDbSessionRepository';
import { IndexedDbMetaRepository } from './indexeddb/IndexedDbMetaRepository';

export interface Repositories {
  workouts: WorkoutRepository;
  images: ImageRepository;
  sessions: SessionRepository;
  meta: MetaRepository;
}

export function createIndexedDbRepositories(dbName = 'thaisforma'): Repositories {
  const db = new ThaisformaDB(dbName);
  return {
    workouts: new IndexedDbWorkoutRepository(db),
    images: new IndexedDbImageRepository(db),
    sessions: new IndexedDbSessionRepository(db),
    meta: new IndexedDbMetaRepository(db)
  };
}

export const repositories: Repositories = createIndexedDbRepositories();

export { settingsStore } from './settingsStore';
export type * from './contracts';
