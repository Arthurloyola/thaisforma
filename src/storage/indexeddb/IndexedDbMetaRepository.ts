import type { MetaRepository } from '../contracts';
import type { ThaisformaDB } from './db';

export class IndexedDbMetaRepository implements MetaRepository {
  constructor(private readonly db: ThaisformaDB) {}

  async get<T>(key: string): Promise<T | undefined> {
    const entry = await this.db.meta.get(key);
    return entry?.value as T | undefined;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.db.meta.put({ key, value });
  }
}
