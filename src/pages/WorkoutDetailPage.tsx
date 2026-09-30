import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, RotateCcw, StickyNote, Trophy } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { ProgressBar } from '../components/Progress';
import { TrainingExerciseCard } from '../components/TrainingExerciseCard';
import { RestTimer, type RestRequest } from '../components/RestTimer';
import { Lightbox } from '../components/Lightbox';
import { useConfirm, useToast } from '../components/Feedback';
import { useActiveSession, useWorkout } from '../hooks/useData';
import { useGoBack } from '../hooks/useGoBack';
import { useWakeLock } from '../hooks/useWakeLock';
import { finishSession, resetSession, toggleExercise } from '../services/sessionService';
import { formatRest, plural } from '../utils/format';

export function WorkoutDetailPage() {
  const { id } = useParams();
  const { data: workout, loading } = useWorkout(id);
  const { data: session } = useActiveSession(id);
  const navigate = useNavigate();
  const goBack = useGoBack('/treinos');
  const confirm = useConfirm();
  const toast = useToast();

  const cardRefs = useRef(new Map<string, HTMLElement>());
  const [rest, setRest] = useState<RestRequest | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; alt: string } | null>(null);
  const closeRest = useCallback(() => setRest(null), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  useWakeLock(!!workout);

  const completed = useMemo(() => {
    const ids = new Set(workout?.exercises.map((e) => e.id));
    return new Set((session?.completedExerciseIds ?? []).filter((x) => ids.has(x)));
  }, [session, workout]);

  if (loading) return <div className="spinner" aria-label="Carregando" />;
  if (!workout) {
    return (
      <>
        <TopBar onBack={goBack} />
        <div className="page page--sub">
          <div className="empty">
            <h2>Treino não encontrado</h2>
            <p>Ele pode ter sido excluído. Volte para a lista e escolha outro treino.</p>
            <Link to="/treinos" className="btn btn--primary">Ver meus treinos</Link>
          </div>
        </div>
      </>
    );
  }

  const total = workout.exercises.length;
  const doneCount = completed.size;
  const allDone = total > 0 && doneCount === total;

  async function handleToggle(exerciseId: string, index: number) {
    const nowDone = await toggleExercise(workout!.id, exerciseId);
    if (!nowDone) return;
    navigator.vibrate?.(30);
    // Avança automaticamente para o próximo exercício pendente.
    const doneNow = new Set(completed).add(exerciseId);
    const list = workout!.exercises;
    const next = list.find((e, i) => i > index && !doneNow.has(e.id)) ?? list.find((e) => !doneNow.has(e.id));
    if (next) {
      window.setTimeout(() => cardRefs.current.get(next.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 280);
    }
  }

  async function handleFinish() {
    if (!allDone) {
      const ok = await confirm({
        title: 'Finalizar o treino agora?',
        message: `Você concluiu ${doneCount} de ${total} exercícios. O treino vai para o seu histórico assim mesmo.`,
        confirmLabel: 'Finalizar treino'
      });
      if (!ok) return;
    }
    await finishSession(workout!);
    toast('Treino finalizado. Muito bem!');
    navigate('/', { replace: true });
  }

  async function handleReset() {
    const ok = await confirm({
      title: 'Recomeçar o treino?',
      message: 'Todos os exercícios voltam a ficar pendentes.',
      confirmLabel: 'Recomeçar'
    });
    if (ok) {
      await resetSession(workout!.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <>
      <TopBar
        title={workout.name}
        onBack={goBack}
        actions={
          <Link to={`/treinos/${workout.id}/editar`} className="icon-btn" aria-label="Editar treino">
            <Pencil />
          </Link>
        }
      />

      <div className="train-progress">
        <div className="train-progress__text">
          <span>
            <strong>{doneCount}</strong> de {plural(total, 'exercício', 'exercícios')} concluídos
          </span>
          <span className="train-progress__pct">{total ? Math.round((doneCount / total) * 100) : 0}%</span>
        </div>
        <ProgressBar value={total ? doneCount / total : 0} label="Progresso do treino" />
      </div>

      <div className="page page--sub train">
        <header className="train__intro">
          {workout.tag && <span className="train__tag">Treino {workout.tag}</span>}
          {workout.muscleGroup && <span className="train__group">{workout.muscleGroup}</span>}
          {workout.description && <p className="train__desc">{workout.description}</p>}
          {workout.notes && (
            <p className="train__notes">
              <StickyNote aria-hidden="true" /> {workout.notes}
            </p>
          )}
        </header>

        {total === 0 ? (
          <div className="empty">
            <h2>Nenhum exercício ainda</h2>
            <p>Adicione os exercícios da sua ficha para começar a treinar.</p>
            <Link to={`/treinos/${workout.id}/editar`} className="btn btn--primary">
              <Pencil aria-hidden="true" /> Editar treino
            </Link>
          </div>
        ) : (
          <div className="train__list">
            {workout.exercises.map((ex, i) => (
              <TrainingExerciseCard
                key={ex.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(ex.id, el);
                  else cardRefs.current.delete(ex.id);
                }}
                exercise={ex}
                index={i}
                done={completed.has(ex.id)}
                onToggle={() => handleToggle(ex.id, i)}
                onRest={() => setRest({ key: Date.now(), seconds: ex.restSeconds, label: formatRest(ex.restSeconds) })}
                onOpenImage={(url) => setLightbox({ url, alt: ex.name })}
              />
            ))}
          </div>
        )}

        {total > 0 && (
          <section className={`finish${allDone ? ' is-complete' : ''}`}>
            {allDone && (
              <>
                <Trophy className="finish__icon" aria-hidden="true" />
                <h2 className="finish__title">Treino completo</h2>
                <p className="finish__text">Todos os {total} exercícios feitos. Finalize para registrar na sua evolução.</p>
              </>
            )}
            <button type="button" className={`btn btn--block btn--lg ${allDone ? 'btn--primary' : 'btn--outline'}`} onClick={handleFinish} disabled={doneCount === 0}>
              Finalizar treino
            </button>
            {doneCount > 0 && (
              <button type="button" className="btn btn--ghost btn--block" onClick={handleReset}>
                <RotateCcw aria-hidden="true" /> Recomeçar do zero
              </button>
            )}
          </section>
        )}
      </div>

      <RestTimer request={rest} onClose={closeRest} />
      <Lightbox url={lightbox?.url ?? null} alt={lightbox?.alt ?? ''} onClose={closeLightbox} />
    </>
  );
}
