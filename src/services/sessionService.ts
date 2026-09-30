import { repositories, type Repositories } from '../storage';
import type { ActiveSession, ID, SessionRecord, Workout } from '../types/workout';
import { createId } from '../utils/id';

/** Marca/desmarca um exercício como concluído. Retorna true se ficou concluído. */
export async function toggleExercise(
  workoutId: ID,
  exerciseId: ID,
  repos: Repositories = repositories
): Promise<boolean> {
  const now = new Date().toISOString();
  const current: ActiveSession = (await repos.sessions.getActive(workoutId)) ?? {
    workoutId,
    startedAt: now,
    updatedAt: now,
    completedExerciseIds: []
  };
  const done = current.completedExerciseIds.includes(exerciseId);
  const completedExerciseIds = done
    ? current.completedExerciseIds.filter((id) => id !== exerciseId)
    : [...current.completedExerciseIds, exerciseId];
  await repos.sessions.saveActive({ ...current, completedExerciseIds, updatedAt: now });
  return !done;
}

export function resetSession(workoutId: ID, repos: Repositories = repositories): Promise<void> {
  return repos.sessions.clearActive(workoutId);
}

/** Registra o treino no histórico e limpa o progresso atual. */
export async function finishSession(workout: Workout, repos: Repositories = repositories): Promise<SessionRecord> {
  const active = await repos.sessions.getActive(workout.id);
  const validIds = new Set(workout.exercises.map((e) => e.id));
  const completed = (active?.completedExerciseIds ?? []).filter((id) => validIds.has(id));
  const record: SessionRecord = {
    id: createId(),
    workoutId: workout.id,
    workoutName: workout.name,
    startedAt: active?.startedAt ?? new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    completedCount: completed.length,
    totalCount: workout.exercises.length
  };
  await repos.sessions.addHistory(record);
  await repos.sessions.clearActive(workout.id);
  return record;
}
