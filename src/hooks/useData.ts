import { useEffect, useState, type DependencyList } from 'react';
import { repositories } from '../storage';
import type { ActiveSession, SessionRecord, Workout } from '../types/workout';

interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
}

/** Executa a consulta e refaz sempre que o repositório avisar que algo mudou. */
export function useRepositoryQuery<T>(
  query: () => Promise<T>,
  subscribe: (listener: () => void) => () => void,
  deps: DependencyList
): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({ data: undefined, loading: true });

  useEffect(() => {
    let alive = true;
    const run = () => {
      query()
        .then((data) => alive && setState({ data, loading: false }))
        .catch((err) => {
          console.error(err);
          if (alive) setState((s) => ({ ...s, loading: false }));
        });
    };
    run();
    const unsubscribe = subscribe(run);
    return () => {
      alive = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export const useWorkouts = () =>
  useRepositoryQuery<Workout[]>(() => repositories.workouts.list(), repositories.workouts.subscribe, []);

export const useWorkout = (id: string | undefined) =>
  useRepositoryQuery<Workout | undefined>(
    () => (id ? repositories.workouts.get(id) : Promise.resolve(undefined)),
    repositories.workouts.subscribe,
    [id]
  );

export const useActiveSession = (workoutId: string | undefined) =>
  useRepositoryQuery<ActiveSession | undefined>(
    () => (workoutId ? repositories.sessions.getActive(workoutId) : Promise.resolve(undefined)),
    repositories.sessions.subscribe,
    [workoutId]
  );

export const useActiveSessions = () =>
  useRepositoryQuery<ActiveSession[]>(() => repositories.sessions.listActive(), repositories.sessions.subscribe, []);

export const useHistory = () =>
  useRepositoryQuery<SessionRecord[]>(() => repositories.sessions.listHistory(), repositories.sessions.subscribe, []);
