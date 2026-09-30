import Dexie, { type Table } from 'dexie';
import type { ActiveSession, SessionRecord, StoredImage, Workout } from '../../types/workout';

export interface MetaEntry {
  key: string;
  value: unknown;
}

export class ThaisformaDB extends Dexie {
  workouts!: Table<Workout, string>;
  images!: Table<StoredImage, string>;
  activeSessions!: Table<ActiveSession, string>;
  history!: Table<SessionRecord, string>;
  meta!: Table<MetaEntry, string>;

  constructor(name = 'thaisforma') {
    super(name);
    // Novas versões do schema: adicionar this.version(2).stores({...}).upgrade(...) — nunca editar a v1.
    this.version(1).stores({
      workouts: 'id, order, updatedAt',
      images: 'id',
      activeSessions: 'workoutId',
      history: 'id, workoutId, finishedAt',
      meta: 'key'
    });
  }
}
