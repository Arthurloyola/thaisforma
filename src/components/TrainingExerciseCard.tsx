import { forwardRef } from 'react';
import { Check, Play, StickyNote, Timer } from 'lucide-react';
import type { Exercise } from '../types/workout';
import { formatRest } from '../utils/format';
import { openExternal } from '../utils/url';
import { ExerciseImage } from './ExerciseImage';

interface Props {
  exercise: Exercise;
  index: number;
  done: boolean;
  onToggle: () => void;
  onRest: () => void;
  onOpenImage: (url: string) => void;
}

export const TrainingExerciseCard = forwardRef<HTMLElement, Props>(function TrainingExerciseCard(
  { exercise, index, done, onToggle, onRest, onOpenImage },
  ref
) {
  const stats = [
    { label: 'Séries', value: String(exercise.sets) },
    { label: 'Repetições', value: exercise.reps || '—' },
    { label: 'Carga', value: exercise.load || '—' },
    { label: 'Descanso', value: formatRest(exercise.restSeconds) }
  ];

  return (
    <article ref={ref} className={`train-card${done ? ' is-done' : ''}`} aria-label={`${index + 1}. ${exercise.name}`}>
      <div className="train-card__media">
        <ExerciseImage imageId={exercise.imageId} name={exercise.name} className="train-card__image" onOpen={onOpenImage} />
        <span className="train-card__index" aria-hidden="true">
          {done ? <Check /> : index + 1}
        </span>
      </div>

      <div className="train-card__content">
        <h2 className="train-card__name">{exercise.name}</h2>

        <dl className="train-card__stats">
          {stats.map((s) => (
            <div key={s.label} className="train-card__stat">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>

        {exercise.notes && (
          <p className="train-card__notes">
            <StickyNote aria-hidden="true" />
            <span>{exercise.notes}</span>
          </p>
        )}

        <div className="train-card__tools">
          {exercise.videoUrl && (
            <button type="button" className="btn btn--soft" onClick={() => openExternal(exercise.videoUrl)}>
              <Play aria-hidden="true" /> Assistir exercício
            </button>
          )}
          {exercise.restSeconds > 0 && (
            <button type="button" className="btn btn--outline" onClick={onRest} aria-label={`Iniciar descanso de ${formatRest(exercise.restSeconds)}`}>
              <Timer aria-hidden="true" /> {formatRest(exercise.restSeconds)}
            </button>
          )}
        </div>

        <button
          type="button"
          className={`btn btn--block btn--lg train-card__done ${done ? 'btn--light' : 'btn--primary'}`}
          onClick={onToggle}
          aria-pressed={done}
        >
          <Check aria-hidden="true" />
          {done ? 'Concluído' : 'Marcar como concluído'}
        </button>
      </div>
    </article>
  );
});
