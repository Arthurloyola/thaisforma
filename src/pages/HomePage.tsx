import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Wordmark } from '../components/Wordmark';
import { ProgressBar } from '../components/Progress';
import { useActiveSessions, useHistory, useWorkouts } from '../hooks/useData';
import { useSettings } from '../hooks/useSettings';
import type { Workout } from '../types/workout';
import { addDays, isSameDay, startOfWeek } from '../utils/dates';
import { capitalize, formatLongDate, greeting, plural, relativeDay } from '../utils/format';
import { sessionsInWeek } from '../utils/stats';

const LINES = [
  'Constância é o que transforma.',
  'Um exercício de cada vez.',
  'Hoje o corpo agradece amanhã.',
  'Força também é aparecer.',
  'Cada série conta.',
  'Seu ritmo, sua evolução.',
  'Pequenos treinos, grandes mudanças.'
];
const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

export function HomePage() {
  const { data: workouts = [], loading } = useWorkouts();
  const { data: history = [] } = useHistory();
  const { data: actives = [] } = useActiveSessions();
  const settings = useSettings();
  const now = new Date();

  const byId = new Map(workouts.map((w) => [w.id, w]));

  // Treino em andamento tem prioridade; senão, o próximo da sequência.
  const active = [...actives]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .find((s) => byId.has(s.workoutId) && s.completedExerciseIds.length > 0);

  let today: Workout | undefined;
  let done = 0;
  if (active) {
    today = byId.get(active.workoutId)!;
    const ids = new Set(today.exercises.map((e) => e.id));
    done = active.completedExerciseIds.filter((id) => ids.has(id)).length;
  } else if (workouts.length) {
    const lastIdx = workouts.findIndex((w) => w.id === history[0]?.workoutId);
    today = workouts[(lastIdx + 1) % workouts.length];
  }

  const week = sessionsInWeek(history, now);
  const weekStart = startOfWeek(now);
  const others = workouts.filter((w) => w.id !== today?.id);

  const dayIndex = Math.floor(now.getTime() / 86_400_000) % LINES.length;

  return (
    <div className="page home">
      <header className="home__header">
        <Wordmark />
        <h1 className="home__greeting">
          {greeting(now)}, {settings.userName || 'Thaís'}.
        </h1>
        <p className="home__line">
          {capitalize(formatLongDate(now))}. {LINES[dayIndex]}
        </p>
      </header>

      {loading ? (
        <div className="spinner" aria-label="Carregando" />
      ) : today ? (
        <section className="today" aria-label="Treino de hoje">
          <span className="today__letter" aria-hidden="true">
            {today.tag || today.name.charAt(0)}
          </span>
          <p className="today__kicker">
            {active ? 'Treino em andamento' : history.length ? 'Próximo da sequência' : 'Para começar'}
          </p>
          <h2 className="today__name">{today.name}</h2>
          <p className="today__meta">
            {[today.muscleGroup, plural(today.exercises.length, 'exercício', 'exercícios')].filter(Boolean).join(', ')}
          </p>
          {active && (
            <div className="today__progress">
              <ProgressBar value={today.exercises.length ? done / today.exercises.length : 0} label="Progresso do treino" />
              <span>
                {done} de {today.exercises.length} concluídos
              </span>
            </div>
          )}
          <Link to={`/treinos/${today.id}`} className="btn btn--light btn--lg btn--block today__cta">
            {active ? 'Continuar treino' : 'Começar treino'}
          </Link>
        </section>
      ) : (
        <div className="empty">
          <h2>Seu primeiro treino começa aqui</h2>
          <p>Crie um treino com os exercícios da sua ficha e acompanhe cada série pelo celular.</p>
          <Link to="/treinos/novo" className="btn btn--primary">
            <Plus aria-hidden="true" /> Criar treino
          </Link>
        </div>
      )}

      <section className="section week" aria-label="Sua semana">
        <div className="week__head">
          <h2 className="section-title">Sua semana</h2>
          <span className="week__count">
            {week.length} de {settings.weeklyGoal} treinos
          </span>
        </div>
        <ol className="week__days">
          {WEEKDAYS.map((label, i) => {
            const date = addDays(weekStart, i);
            const trained = week.some((h) => isSameDay(new Date(h.finishedAt), date));
            const isToday = isSameDay(date, now);
            return (
              <li key={i} className={`week__day${trained ? ' is-trained' : ''}${isToday ? ' is-today' : ''}`}>
                <span className="week__dot">{date.getDate()}</span>
                <span className="week__label">{label}</span>
              </li>
            );
          })}
        </ol>
        {history[0] && (
          <p className="week__last">
            Último treino: {history[0].workoutName}, {relativeDay(history[0].finishedAt, now)}.
          </p>
        )}
      </section>

      {others.length > 0 && (
        <section className="section">
          <h2 className="section-title">Outros treinos</h2>
          <div className="quick">
            {others.map((w) => (
              <Link key={w.id} to={`/treinos/${w.id}`} className="quick__item">
                <span className="quick__tag">{w.tag || w.name.charAt(0)}</span>
                <span className="quick__name">{w.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
