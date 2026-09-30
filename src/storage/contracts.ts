/**
 * Contratos da camada de dados.
 *
 * A interface do app (páginas, hooks e serviços) conversa SOMENTE com estas
 * interfaces. Para migrar para Supabase/Firebase, basta criar novas classes
 * que implementem estes contratos e trocá-las em `storage/index.ts`.
 */
import type { ActiveSession, ID, SessionRecord, StoredImage, Workout } from '../types/workout';
import type { Listener } from '../utils/emitter';

export interface WorkoutRepository {
  list(): Promise<Workout[]>;
  get(id: ID): Promise<Workout | undefined>;
  /** Cria ou atualiza (upsert). Atualiza `updatedAt` automaticamente. */
  save(workout: Workout): Promise<Workout>;
  remove(id: ID): Promise<void>;
  nextOrder(): Promise<number>;
  replaceAll(workouts: Workout[]): Promise<void>;
  subscribe(listener: Listener): () => void;
}

export interface ImageRepository {
  /** Guarda o arquivo e devolve o id que o exercício vai referenciar. */
  put(blob: Blob): Promise<ID>;
  get(id: ID): Promise<Blob | undefined>;
  remove(id: ID): Promise<void>;
  listIds(): Promise<ID[]>;
  removeMany(ids: ID[]): Promise<void>;
  exportAll(): Promise<StoredImage[]>;
  replaceAll(images: StoredImage[]): Promise<void>;
}

export interface SessionRepository {
  getActive(workoutId: ID): Promise<ActiveSession | undefined>;
  listActive(): Promise<ActiveSession[]>;
  saveActive(session: ActiveSession): Promise<void>;
  clearActive(workoutId: ID): Promise<void>;
  listHistory(): Promise<SessionRecord[]>;
  addHistory(record: SessionRecord): Promise<void>;
  removeHistory(id: ID): Promise<void>;
  replaceAll(active: ActiveSession[], history: SessionRecord[]): Promise<void>;
  subscribe(listener: Listener): () => void;
}

/** Pequeno armazenamento chave/valor para flags internas (ex.: dados de exemplo já criados). */
export interface MetaRepository {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
}
