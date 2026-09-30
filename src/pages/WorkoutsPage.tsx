import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { WorkoutCard } from '../components/WorkoutCard';
import { useConfirm, useToast } from '../components/Feedback';
import { useActiveSessions, useWorkouts } from '../hooks/useData';
import { deleteWorkout, duplicateWorkout } from '../services/workoutService';
import type { Workout } from '../types/workout';
import { plural } from '../utils/format';

export function WorkoutsPage() {
  const { data: workouts = [], loading } = useWorkouts();
  const { data: actives = [] } = useActiveSessions();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  const progressFor = (w: Workout) => {
    const s = actives.find((a) => a.workoutId === w.id);
    if (!s) return undefined;
    const ids = new Set(w.exercises.map((e) => e.id));
    return { done: s.completedExerciseIds.filter((id) => ids.has(id)).length, total: w.exercises.length };
  };

  async function handleDelete(w: Workout) {
    const ok = await confirm({
      title: `Excluir ${w.name}?`,
      message: 'O treino e as imagens dos exercícios serão apagados deste celular. O histórico de treinos feitos continua na Evolução.',
      confirmLabel: 'Excluir treino',
      danger: true
    });
    if (!ok) return;
    await deleteWorkout(w.id);
    toast('Treino excluído');
  }

  async function handleDuplicate(w: Workout) {
    const copy = await duplicateWorkout(w.id);
    if (copy) toast(`${copy.name} criado`);
  }

  return (
    <div className="page">
      <h1 className="page-title">Meus treinos</h1>
      <p className="page-lead">{loading ? ' ' : plural(workouts.length, 'treino cadastrado', 'treinos cadastrados')}</p>

      <Link to="/treinos/novo" className="btn btn--primary btn--lg btn--block workouts__new">
        <Plus aria-hidden="true" /> Novo treino
      </Link>

      {loading ? (
        <div className="spinner" aria-label="Carregando" />
      ) : workouts.length === 0 ? (
        <div className="empty section">
          <h2>Nenhum treino por aqui</h2>
          <p>Toque em Novo treino para montar sua ficha com exercícios, cargas e vídeos.</p>
        </div>
      ) : (
        <div className="stack section">
          {workouts.map((w) => (
            <WorkoutCard
              key={w.id}
              workout={w}
              progress={progressFor(w)}
              onEdit={() => navigate(`/treinos/${w.id}/editar`)}
              onDuplicate={() => handleDuplicate(w)}
              onDelete={() => handleDelete(w)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
