import { repositories, type Repositories } from '../storage';
import type { Exercise, ID, Workout } from '../types/workout';
import { createId } from '../utils/id';
import { drafts } from './drafts';

export const MUSCLE_GROUPS = [
  'Pernas',
  'Glúteos',
  'Posterior',
  'Costas',
  'Bíceps',
  'Peito',
  'Ombros',
  'Tríceps',
  'Abdômen',
  'Corpo todo',
  'Cardio'
];

export function createEmptyExercise(): Exercise {
  return {
    id: createId(),
    name: '',
    imageId: null,
    sets: 3,
    reps: '12',
    load: '',
    restSeconds: 60,
    notes: '',
    videoUrl: ''
  };
}

export function createEmptyWorkout(): Workout {
  const now = new Date().toISOString();
  return {
    id: createId(),
    tag: '',
    name: '',
    description: '',
    muscleGroup: '',
    notes: '',
    exercises: [],
    order: 0,
    createdAt: now,
    updatedAt: now
  };
}

export async function duplicateWorkout(id: ID, repos: Repositories = repositories): Promise<Workout | undefined> {
  const original = await repos.workouts.get(id);
  if (!original) return undefined;
  const now = new Date().toISOString();
  const copy: Workout = {
    ...original,
    id: createId(),
    name: `${original.name} (cópia)`,
    // As imagens são compartilhadas por id; a limpeza só apaga imagens sem nenhuma referência.
    exercises: original.exercises.map((e) => ({ ...e, id: createId() })),
    order: await repos.workouts.nextOrder(),
    createdAt: now,
    updatedAt: now
  };
  return repos.workouts.save(copy);
}

export async function deleteWorkout(id: ID, repos: Repositories = repositories): Promise<void> {
  await repos.workouts.remove(id);
  await repos.sessions.clearActive(id);
  drafts.remove(drafts.key(id));
  await cleanupOrphanImages(repos);
}

/** Apaga imagens que nenhum treino (nem rascunho) usa mais. */
export async function cleanupOrphanImages(repos: Repositories = repositories): Promise<number> {
  const used = drafts.referencedImageIds();
  (await repos.workouts.list()).forEach((w) =>
    w.exercises.forEach((e) => e.imageId && used.add(e.imageId))
  );
  const orphans = (await repos.images.listIds()).filter((id) => !used.has(id));
  await repos.images.removeMany(orphans);
  return orphans.length;
}
