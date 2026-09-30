import { Trash2 } from 'lucide-react';
import { ProgressRing } from '../components/Progress';
import { useConfirm } from '../components/Feedback';
import { useHistory } from '../hooks/useData';
import { useSettings } from '../hooks/useSettings';
import { repositories } from '../storage';
import { capitalize, formatDuration, formatShortDate, formatTime, plural, relativeDay } from '../utils/format';
import { calendarGrid, favoriteWorkout, sessionsInWeek, weekStreak } from '../utils/stats';

const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

export function ProgressPage() {
  const { data: history = [], loading } = useHistory();
  const settings = useSettings();
  const confirm = useConfirm();
  const now = new Date();

  const week = sessionsInWeek(history, now).length;
  const streak = weekStreak(history, now);
  const grid = calendarGrid(history, 5, now);
  const favorite = favoriteWorkout(history);

  async function remove(id: string, name: string) {
    const ok = await confirm({ title: `Apagar este registro de ${name}?`, confirmLabel: 'Apagar registro', danger: true });
    if (ok) await repositories.sessions.removeHistory(id);
  }

  return (
    <div className="page">
      <h1 className="page-title">Evolução</h1>
      <p className="page-lead">Cada treino finalizado aparece aqui.</p>

      <section className="evo-summary section">
        <ProgressRing value={week / Math.max(1, settings.weeklyGoal)} size={116} stroke={10}>
          <strong>{week}</strong>
          <span>de {settings.weeklyGoal}</span>
        </ProgressRing>
        <div className="evo-summary__text">
          <h2>{week >= settings.weeklyGoal ? 'Meta da semana batida' : 'Meta da semana'}</h2>
          <p>
            {week >= settings.weeklyGoal
              ? 'Tudo que vier agora é bônus.'
              : `Faltam ${plural(settings.weeklyGoal - week, 'treino', 'treinos')} para fechar a semana.`}
          </p>
        </div>
      </section>

      <dl className="evo-stats">
        <div>
          <dt>Semanas seguidas</dt>
          <dd>{streak}</dd>
        </div>
        <div>
          <dt>Treinos feitos</dt>
          <dd>{history.length}</dd>
        </div>
        <div>
          <dt>Mais feito</dt>
          <dd className="evo-stats__text">{favorite ? favorite.name : '—'}</dd>
        </div>
      </dl>

      <section className="section">
        <h2 className="section-title">Últimas 5 semanas</h2>
        <div className="calendar" role="grid" aria-label="Dias com treino nas últimas 5 semanas">
          {WEEKDAYS.map((d, i) => (
            <span key={`h${i}`} className="calendar__head" aria-hidden="true">{d}</span>
          ))}
          {grid.map((cell) => (
            <span
              key={cell.date.toISOString()}
              role="gridcell"
              className={`calendar__cell${cell.count ? ' is-trained' : ''}${cell.isToday ? ' is-today' : ''}${cell.isFuture ? ' is-future' : ''}`}
              aria-label={`${formatShortDate(cell.date.toISOString())}: ${cell.count ? plural(cell.count, 'treino', 'treinos') : 'sem treino'}`}
            >
              {cell.date.getDate()}
            </span>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Histórico</h2>
        {loading ? (
          <div className="spinner" aria-label="Carregando" />
        ) : history.length === 0 ? (
          <div className="empty">
            <h2>Nada por aqui ainda</h2>
            <p>Abra um treino, marque os exercícios e toque em Finalizar treino no final.</p>
          </div>
        ) : (
          <ul className="history">
            {history.map((h) => (
              <li key={h.id} className="history__item">
                <div className="history__date">
                  <span className="history__day">{new Date(h.finishedAt).getDate()}</span>
                  <span className="history__month">{formatShortDate(h.finishedAt).replace(/^\d+\s*(de\s*)?/, '').replace('.', '')}</span>
                </div>
                <div className="history__body">
                  <span className="history__name">{h.workoutName}</span>
                  <span className="history__meta">
                    {capitalize(relativeDay(h.finishedAt, now))} às {formatTime(h.finishedAt)}. {h.completedCount} de {h.totalCount} exercícios em{' '}
                    {formatDuration(new Date(h.finishedAt).getTime() - new Date(h.startedAt).getTime())}.
                  </span>
                </div>
                <button type="button" className="icon-btn" onClick={() => remove(h.id, h.workoutName)} aria-label={`Apagar registro de ${h.workoutName}`}>
                  <Trash2 />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
