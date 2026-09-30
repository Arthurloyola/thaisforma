import { describe, expect, it } from 'vitest';
import { createIndexedDbRepositories } from '..';
import { ensureSeeded } from '../../services/bootstrap';
import { finishSession, toggleExercise } from '../../services/sessionService';
import { cleanupOrphanImages, createEmptyExercise, createEmptyWorkout, deleteWorkout, duplicateWorkout } from '../../services/workoutService';

/** Abrir uma nova instância com o mesmo nome de banco = reabrir o app após refresh. */
const reopen = (name: string) => createIndexedDbRepositories(name);

describe('persistência local', () => {
  it('cria os treinos de exemplo uma única vez', async () => {
    const repos = reopen('t-seed');
    await ensureSeeded(repos);
    expect(await repos.workouts.list()).toHaveLength(4);

    await repos.workouts.replaceAll([]); // ela apagou tudo
    await ensureSeeded(reopen('t-seed'));
    expect(await reopen('t-seed').workouts.list()).toHaveLength(0);
  });

  it('treino criado e editado continua salvo após reabrir', async () => {
    const repos = reopen('t-workout');
    const w = createEmptyWorkout();
    w.name = 'Pernas';
    w.exercises = [{ ...createEmptyExercise(), name: 'Agachamento', load: '20 kg' }];
    await repos.workouts.save(w);

    const after = reopen('t-workout');
    const loaded = await after.workouts.get(w.id);
    expect(loaded?.name).toBe('Pernas');
    expect(loaded?.exercises[0].load).toBe('20 kg');

    await after.workouts.save({ ...loaded!, exercises: [{ ...loaded!.exercises[0], load: '25 kg' }] });
    expect((await reopen('t-workout').workouts.get(w.id))?.exercises[0].load).toBe('25 kg');
  });

  it('imagem da galeria persiste byte a byte e com o tipo correto', async () => {
    const repos = reopen('t-image');
    const bytes = new Uint8Array([255, 216, 255, 224, 1, 2, 3, 4, 5]);
    const id = await repos.images.put(new Blob([bytes], { type: 'image/jpeg' }));

    const blob = await reopen('t-image').images.get(id);
    expect(blob?.type).toBe('image/jpeg');
    expect(new Uint8Array(await blob!.arrayBuffer())).toEqual(bytes);
  });

  it('limpeza só remove imagens sem uso, inclusive após duplicar e excluir', async () => {
    const repos = reopen('t-cleanup');
    const used = await repos.images.put(new Blob([new Uint8Array([1])], { type: 'image/png' }));
    const orphan = await repos.images.put(new Blob([new Uint8Array([2])], { type: 'image/png' }));
    const w = { ...createEmptyWorkout(), name: 'Glúteos', exercises: [{ ...createEmptyExercise(), name: 'Elevação', imageId: used }] };
    await repos.workouts.save(w);

    expect(await cleanupOrphanImages(repos)).toBe(1);
    expect(await repos.images.get(orphan)).toBeUndefined();

    const copy = await duplicateWorkout(w.id, repos);
    await deleteWorkout(w.id, repos);
    expect(await repos.images.get(used)).toBeDefined(); // a cópia ainda usa a imagem

    await deleteWorkout(copy!.id, repos);
    expect(await repos.images.get(used)).toBeUndefined();
  });

  it('progresso do treino sobrevive ao refresh e vai para o histórico ao finalizar', async () => {
    const repos = reopen('t-session');
    const w = {
      ...createEmptyWorkout(),
      name: 'Costas',
      exercises: [createEmptyExercise(), createEmptyExercise()].map((e, i) => ({ ...e, name: `Ex ${i}` }))
    };
    await repos.workouts.save(w);
    expect(await toggleExercise(w.id, w.exercises[0].id, repos)).toBe(true);

    const after = reopen('t-session');
    expect((await after.sessions.getActive(w.id))?.completedExerciseIds).toEqual([w.exercises[0].id]);

    const record = await finishSession(w, after);
    expect(record.completedCount).toBe(1);
    expect(record.totalCount).toBe(2);
    expect(await reopen('t-session').sessions.getActive(w.id)).toBeUndefined();
    expect(await reopen('t-session').sessions.listHistory()).toHaveLength(1);
  });
});
