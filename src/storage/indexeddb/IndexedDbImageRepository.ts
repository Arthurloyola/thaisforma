import type { ImageRepository } from '../contracts';
import type { ID, StoredImage } from '../../types/workout';
import { blobToArrayBuffer } from '../../utils/binary';
import { createId } from '../../utils/id';
import type { ThaisformaDB } from './db';

/**
 * As imagens são gravadas como ArrayBuffer + tipo MIME (e não como Blob),
 * o formato mais compatível com IndexedDB em Safari/iOS e Android.
 * O app nunca depende do arquivo original da galeria.
 */
export class IndexedDbImageRepository implements ImageRepository {
  constructor(private readonly db: ThaisformaDB) {}

  async put(blob: Blob): Promise<ID> {
    const id = createId();
    const data = await blobToArrayBuffer(blob);
    await this.db.images.put({ id, type: blob.type || 'image/jpeg', data, createdAt: new Date().toISOString() });
    return id;
  }

  async get(id: ID): Promise<Blob | undefined> {
    const record = await this.db.images.get(id);
    return record ? new Blob([record.data], { type: record.type }) : undefined;
  }

  async remove(id: ID): Promise<void> {
    await this.db.images.delete(id);
  }

  async listIds(): Promise<ID[]> {
    return (await this.db.images.toCollection().primaryKeys()) as ID[];
  }

  async removeMany(ids: ID[]): Promise<void> {
    if (ids.length) await this.db.images.bulkDelete(ids);
  }

  exportAll(): Promise<StoredImage[]> {
    return this.db.images.toArray();
  }

  async replaceAll(images: StoredImage[]): Promise<void> {
    await this.db.transaction('rw', this.db.images, async () => {
      await this.db.images.clear();
      await this.db.images.bulkPut(images);
    });
  }
}
