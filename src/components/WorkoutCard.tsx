import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Workout } from '../types/workout';
import { plural } from '../utils/format';
import { BottomSheet, SheetAction } from './BottomSheet';

interface Props {
  workout: Workout;
  progress?: { done: number; total: number };
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function WorkoutCard({ workout, progress, onEdit, onDuplicate, onDelete }: Props) {
  const [menu, setMenu] = useState(false);
  const run = (fn: () => void) => () => {
    setMenu(false);
    fn();
  };
  const inProgress = progress && progress.done > 0;

  return (
    <article className="workout-card">
      <Link to={`/treinos/${workout.id}`} className="workout-card__link">
        <span className="workout-card__tag" aria-hidden="true">{workout.tag || workout.name.charAt(0) || '·'}</span>
        <span className="workout-card__body">
          <span className="workout-card__name">{workout.name || 'Treino sem nome'}</span>
          <span className="workout-card__meta">
            {[workout.muscleGroup, plural(workout.exercises.length, 'exercício', 'exercícios')].filter(Boolean).join(', ')}
          </span>
          {inProgress && (
            <span className="workout-card__status">
              Em andamento: {progress.done} de {progress.total}
            </span>
          )}
        </span>
      </Link>
      <button type="button" className="icon-btn workout-card__more" onClick={() => setMenu(true)} aria-label={`Opções de ${workout.name}`}>
        <MoreHorizontal />
      </button>

      <BottomSheet open={menu} onClose={() => setMenu(false)} title={workout.name}>
        <SheetAction icon={<Pencil />} label="Editar treino" onClick={run(onEdit)} />
        <SheetAction icon={<Copy />} label="Duplicar treino" onClick={run(onDuplicate)} />
        <SheetAction icon={<Trash2 />} label="Excluir treino" onClick={run(onDelete)} danger />
      </BottomSheet>
    </article>
  );
}
