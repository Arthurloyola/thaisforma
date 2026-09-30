import type { WorkoutRepository } from '../contracts';
import type { ID, Workout } from '../../types/workout';
import { createEmitter } from '../../utils/emitter';
import type { ThaisformaDB } from './db';

const byOrder = (a: Workout, b: Workout) => a.order - b.order || a.createdAt.localeCompare(b.createdAt);

export class IndexedDbWorkoutRepository implements WorkoutRepository {
  private readonly emitter = createEmitter();

  constructor(private readonly db: ThaisformaDB) {}

  async list(): Promise<Workout[]> {
    const all = await this.db.workouts.toArray();
    return all.sort(byOrder);
  }

  get(id: ID): Promise<Workout | undefined> {
    return this.db.workouts.get(id);
  }

  async save(workout: Workout): Promise<Workout> {
    const toSave: Workout = { ...workout, updatedAt: new Date().toISOString() };
    await this.db.workouts.put(toSave);
    this.emitter.emit();
    return toSave;
  }

  async remove(id: ID): Promise<void> {
    await this.db.workouts.delete(id);
    this.emitter.emit();
  }

  async nextOrder(): Promise<number> {
    const last = await this.db.workouts.orderBy('order').last();
    return (last?.order ?? -1) + 1;
  }

  async replaceAll(workouts: Workout[]): Promise<void> {
    await this.db.transaction('rw', this.db.workouts, async () => {
      await this.db.workouts.clear();
      await this.db.workouts.bulkPut(workouts);
    });
    this.emitter.emit();
  }

  subscribe = (listener: () => void) => this.emitter.subscribe(listener);
}
