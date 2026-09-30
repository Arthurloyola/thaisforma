import { ArrowDown, ArrowUp, ChevronDown, ExternalLink, Trash2 } from 'lucide-react';
import type { Exercise } from '../types/workout';
import { formatRest } from '../utils/format';
import { isValidUrl, openExternal } from '../utils/url';
import { ImagePicker } from './ImagePicker';
import { Stepper } from './Stepper';

export interface ExerciseErrors {
  name?: string;
  videoUrl?: string;
}

interface Props {
  exercise: Exercise;
  index: number;
  total: number;
  expanded: boolean;
  errors?: ExerciseErrors;
  onToggle: () => void;
  onChange: (patch: Partial<Exercise>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

export function ExerciseEditor({ exercise, index, total, expanded, errors, onToggle, onChange, onMove, onRemove }: Props) {
  const hasError = !!(errors?.name || errors?.videoUrl);
  const bodyId = `ex-body-${exercise.id}`;

  return (
    <section className={`ex-editor${expanded ? ' is-open' : ''}${hasError ? ' has-error' : ''}`} id={`ex-${exercise.id}`}>
      <div className="ex-editor__head">
        <button type="button" className="ex-editor__toggle" onClick={onToggle} aria-expanded={expanded} aria-controls={bodyId}>
          <span className="ex-editor__index">{index + 1}</span>
          <span className="ex-editor__summary">
            <span className="ex-editor__name">{exercise.name || 'Novo exercício'}</span>
            <span className="ex-editor__meta">
              {exercise.sets} × {exercise.reps || '—'}
              {exercise.load ? `, ${exercise.load}` : ''}
            </span>
          </span>
          <ChevronDown className="ex-editor__chevron" aria-hidden="true" />
        </button>
        <div className="ex-editor__order">
          <button type="button" className="icon-btn" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Mover para cima">
            <ArrowUp />
          </button>
          <button type="button" className="icon-btn" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Mover para baixo">
            <ArrowDown />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="ex-editor__body" id={bodyId}>
          <label className="field">
            <span className="field__label">Nome do exercício</span>
            <input
              className={`input${errors?.name ? ' input--invalid' : ''}`}
              value={exercise.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Ex.: Supino inclinado"
              autoCapitalize="sentences"
            />
            {errors?.name && <span className="field__error">{errors.name}</span>}
          </label>

          <div className="field">
            <span className="field__label">Imagem</span>
            <ImagePicker imageId={exercise.imageId} exerciseName={exercise.name} onChange={(imageId) => onChange({ imageId })} />
          </div>

          <div className="field-grid">
            <div className="field">
              <span className="field__label">Séries</span>
              <Stepper label="séries" value={exercise.sets} min={1} max={20} onChange={(sets) => onChange({ sets })} />
            </div>
            <label className="field">
              <span className="field__label">Repetições</span>
              <input className="input" value={exercise.reps} onChange={(e) => onChange({ reps: e.target.value })} placeholder="12" />
            </label>
            <label className="field">
              <span className="field__label">Carga</span>
              <input className="input" value={exercise.load} onChange={(e) => onChange({ load: e.target.value })} placeholder="10 kg" />
            </label>
            <div className="field">
              <span className="field__label">Descanso</span>
              <Stepper
                label="descanso"
                value={exercise.restSeconds}
                min={0}
                max={600}
                step={15}
                format={formatRest}
                onChange={(restSeconds) => onChange({ restSeconds })}
              />
            </div>
          </div>

          <label className="field">
            <span className="field__label">Link do vídeo no YouTube</span>
            <div className="input-with-action">
              <input
                className={`input${errors?.videoUrl ? ' input--invalid' : ''}`}
                type="url"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                value={exercise.videoUrl}
                onChange={(e) => onChange({ videoUrl: e.target.value })}
                placeholder="https://youtu.be/…"
              />
              <button
                type="button"
                className="icon-btn icon-btn--filled"
                onClick={() => openExternal(exercise.videoUrl)}
                disabled={!exercise.videoUrl.trim() || !isValidUrl(exercise.videoUrl)}
                aria-label="Testar link do vídeo"
              >
                <ExternalLink />
              </button>
            </div>
            {errors?.videoUrl ? (
              <span className="field__error">{errors.videoUrl}</span>
            ) : (
              <span className="field__hint">No YouTube, toque em Compartilhar e depois em Copiar link.</span>
            )}
          </label>

          <label className="field">
            <span className="field__label">Observações</span>
            <textarea
              className="textarea"
              value={exercise.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="Postura, ajuste do aparelho, cadência…"
              rows={3}
            />
          </label>

          <button type="button" className="btn btn--ghost ex-editor__remove" onClick={onRemove}>
            <Trash2 aria-hidden="true" /> Remover exercício
          </button>
        </div>
      )}
    </section>
  );
}
