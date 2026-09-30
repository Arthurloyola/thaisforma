import { repositories, settingsStore, type Repositories } from '../storage';
import type { ActiveSession, AppSettings, SessionRecord, StoredImage, Workout } from '../types/workout';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../utils/binary';
import { drafts } from './drafts';

interface BackupImage extends Omit<StoredImage, 'data'> {
  base64: string;
}

export interface BackupFile {
  app: 'thaisforma';
  version: 1;
  exportedAt: string;
  settings: AppSettings;
  workouts: Workout[];
  activeSessions: ActiveSession[];
  history: SessionRecord[];
  images: BackupImage[];
}

export async function createBackup(repos: Repositories = repositories): Promise<Blob> {
  const images = await repos.images.exportAll();
  const file: BackupFile = {
    app: 'thaisforma',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: settingsStore.get(),
    workouts: await repos.workouts.list(),
    activeSessions: await repos.sessions.listActive(),
    history: await repos.sessions.listHistory(),
    images: images.map(({ data, ...rest }) => ({ ...rest, base64: arrayBufferToBase64(data) }))
  };
  return new Blob([JSON.stringify(file)], { type: 'application/json' });
}

export async function restoreBackup(file: Blob, repos: Repositories = repositories): Promise<number> {
  let parsed: BackupFile;
  try {
    parsed = JSON.parse(await file.text()) as BackupFile;
  } catch {
    throw new Error('O arquivo escolhido não é uma cópia de segurança do Thaís Maromba.');
  }
  if (parsed?.app !== 'thaisforma' || !Array.isArray(parsed.workouts)) {
    throw new Error('O arquivo escolhido não é uma cópia de segurança do Thaís Maromba.');
  }
  await repos.images.replaceAll(
    (parsed.images ?? []).map(({ base64, ...rest }) => ({ ...rest, data: base64ToArrayBuffer(base64) }))
  );
  await repos.workouts.replaceAll(parsed.workouts);
  await repos.sessions.replaceAll(parsed.activeSessions ?? [], parsed.history ?? []);
  if (parsed.settings) settingsStore.set(parsed.settings);
  drafts.clearAll();
  return parsed.workouts.length;
}

export async function eraseEverything(repos: Repositories = repositories): Promise<void> {
  await repos.workouts.replaceAll([]);
  await repos.images.replaceAll([]);
  await repos.sessions.replaceAll([], []);
  drafts.clearAll();
}

/** No celular, abre o menu de compartilhar (salvar em Arquivos, Drive, WhatsApp…); senão, baixa. */
export async function saveBackupFile(blob: Blob): Promise<'shared' | 'downloaded'> {
  const date = new Date().toISOString().slice(0, 10);
  const name = `thais-maromba-backup-${date}.json`;
  const file = new File([blob], name, { type: 'application/json' });
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Backup do Thaís Maromba' });
      return 'shared';
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') throw err;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}
