import type { SessionRepository } from '../contracts';
import type { ActiveSession, ID, SessionRecord } from '../../types/workout';
import { createEmitter } from '../../utils/emitter';
import type { ThaisformaDB } from './db';

export class IndexedDbSessionRepository implements SessionRepository {
  private readonly emitter = createEmitter();

  constructor(private readonly db: ThaisformaDB) {}

  getActive(workoutId: ID): Promise<ActiveSession | undefined> {
    return this.db.activeSessions.get(workoutId);
  }

  listActive(): Promise<ActiveSession[]> {
    return this.db.activeSessions.toArray();
  }

  async saveActive(session: ActiveSession): Promise<void> {
    await this.db.activeSessions.put(session);
    this.emitter.emit();
  }

  async clearActive(workoutId: ID): Promise<void> {
    await this.db.activeSessions.delete(workoutId);
    this.emitter.emit();
  }

  async listHistory(): Promise<SessionRecord[]> {
    const all = await this.db.history.toArray();
    return all.sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
  }

  async addHistory(record: SessionRecord): Promise<void> {
    await this.db.history.put(record);
    this.emitter.emit();
  }

  async removeHistory(id: ID): Promise<void> {
    await this.db.history.delete(id);
    this.emitter.emit();
  }

  async replaceAll(active: ActiveSession[], history: SessionRecord[]): Promise<void> {
    await this.db.transaction('rw', this.db.activeSessions, this.db.history, async () => {
      await this.db.activeSessions.clear();
      await this.db.history.clear();
      await this.db.activeSessions.bulkPut(active);
      await this.db.history.bulkPut(history);
    });
    this.emitter.emit();
  }

  subscribe = (listener: () => void) => this.emitter.subscribe(listener);
}
