import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Info, Plus, Trash2 } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { ExerciseEditor, type ExerciseErrors } from '../components/ExerciseEditor';
import { useConfirm, useToast } from '../components/Feedback';
import { useGoBack } from '../hooks/useGoBack';
import { repositories } from '../storage';
import { drafts } from '../services/drafts';
import {
  MUSCLE_GROUPS,
  cleanupOrphanImages,
  createEmptyExercise,
  createEmptyWorkout,
  deleteWorkout
} from '../services/workoutService';
import type { Exercise, Workout } from '../types/workout';
import { isValidUrl, normalizeUrl } from '../utils/url';

interface Errors {
  name?: string;
  exercises: Record<string, ExerciseErrors>;
}

function validate(w: Workout): Errors {
  const errors: Errors = { exercises: {} };
  if (!w.name.trim()) errors.name = 'Dê um nome ao treino.';
  w.exercises.forEach((e) => {
    const ex: ExerciseErrors = {};
    if (!e.name.trim()) ex.name = 'Dê um nome ao exercício.';
    if (!isValidUrl(e.videoUrl)) ex.videoUrl = 'Esse link não parece válido. Cole o endereço completo do vídeo.';
    if (ex.name || ex.videoUrl) errors.exercises[e.id] = ex;
  });
  return errors;
}

const hasErrors = (e: Errors) => !!e.name || Object.keys(e.exercises).length > 0;

export function WorkoutEditPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const goBack = useGoBack(isNew ? '/treinos' : `/treinos/${id}`);
  const confirm = useConfirm();
  const toast = useToast();
  const draftKey = drafts.key(id);

  const [draft, setDraft] = useState<Workout | null>(null);
  const [baseline, setBaseline] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [restored, setRestored] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors | null>(null);
  const [saving, setSaving] = useState(false);

  // Carrega o treino (ou um treino vazio) e recupera rascunho não salvo, se houver.
  useEffect(() => {
    let alive = true;
    (async () => {
      const base = isNew ? createEmptyWorkout() : await repositories.workouts.get(id!);
      if (!alive) return;
      if (!base) return setNotFound(true);
      const saved = drafts.load(draftKey);
      const baseJson = JSON.stringify(base);
      setBaseline(baseJson);
      if (saved && (isNew || saved.id === base.id) && JSON.stringify(saved) !== baseJson) {
        setDraft(saved);
        setRestored(true);
      } else {
        setDraft(base);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, isNew, draftKey]);

  const dirty = useMemo(() => !!draft && JSON.stringify(draft) !== baseline, [draft, baseline]);

  // Rede de segurança: o rascunho sobrevive a refresh ou fechamento acidental.
  useEffect(() => {
    if (!draft) return;
    if (dirty) drafts.save(draftKey, draft);
    else drafts.remove(draftKey);
  }, [draft, dirty, draftKey]);

  if (notFound) {
    return (
      <>
        <TopBar onBack={goBack} />
        <div className="page page--sub">
          <div className="empty">
            <h2>Treino não encontrado</h2>
            <p>Ele pode ter sido excluído.</p>
            <button type="button" className="btn btn--primary" onClick={() => navigate('/treinos', { replace: true })}>
              Ver meus treinos
            </button>
          </div>
        </div>
      </>
    );
  }
  if (!draft) return <div className="spinner" aria-label="Carregando" />;

  const update = (patch: Partial<Workout>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const updateExercise = (exId: string, patch: Partial<Exercise>) =>
    setDraft((d) => (d ? { ...d, exercises: d.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)) } : d));

  function addExercise() {
    const ex = createEmptyExercise();
    setDraft((d) => (d ? { ...d, exercises: [...d.exercises, ex] } : d));
    setExpandedId(ex.id);
    window.setTimeout(() => {
      const el = document.getElementById(`ex-${ex.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el?.querySelector('input')?.focus({ preventScroll: true });
    }, 60);
  }

  function moveExercise(index: number, dir: -1 | 1) {
    setDraft((d) => {
      if (!d) return d;
      const list = [...d.exercises];
      const target = index + dir;
      if (target < 0 || target >= list.length) return d;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...d, exercises: list };
    });
  }

  async function removeExercise(ex: Exercise) {
    const ok = await confirm({
      title: `Remover ${ex.name || 'este exercício'}?`,
      message: 'A remoção só vale depois que você salvar o treino.',
      confirmLabel: 'Remover exercício',
      danger: true
    });
    if (ok) setDraft((d) => (d ? { ...d, exercises: d.exercises.filter((e) => e.id !== ex.id) } : d));
  }

  async function handleSave() {
    if (!draft) return;
    const result = validate(draft);
    if (hasErrors(result)) {
      setErrors(result);
      const firstEx = draft.exercises.find((e) => result.exercises[e.id]);
      if (result.name) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (firstEx) {
        setExpandedId(firstEx.id);
        window.setTimeout(() => document.getElementById(`ex-${firstEx.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      }
      toast('Confira os campos destacados antes de salvar.', 'error');
      return;
    }
    setSaving(true);
    try {
      const toSave: Workout = {
        ...draft,
        tag: draft.tag.trim().toUpperCase(),
        name: draft.name.trim(),
        muscleGroup: draft.muscleGroup.trim(),
        exercises: draft.exercises.map((e) => ({ ...e, name: e.name.trim(), videoUrl: normalizeUrl(e.videoUrl) })),
        order: isNew ? await repositories.workouts.nextOrder() : draft.order
      };
      await repositories.workouts.save(toSave);
      drafts.remove(draftKey);
      setBaseline(JSON.stringify(toSave));
      void cleanupOrphanImages();
      toast('Treino salvo');
      navigate(`/treinos/${toSave.id}`, { replace: true });
    } catch (err) {
      console.error(err);
      toast('Não foi possível salvar. Verifique o espaço livre do celular e tente de novo.', 'error');
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (dirty) {
      const ok = await confirm({
        title: 'Sair sem salvar?',
        message: 'As alterações feitas agora serão descartadas.',
        confirmLabel: 'Descartar alterações',
        cancelLabel: 'Continuar editando',
        danger: true
      });
      if (!ok) return;
    }
    drafts.remove(draftKey);
    goBack();
  }

  async function handleDelete() {
    const ok = await confirm({
      title: `Excluir ${draft!.name || 'este treino'}?`,
      message: 'O treino e as imagens dos exercícios serão apagados deste celular.',
      confirmLabel: 'Excluir treino',
      danger: true
    });
    if (!ok) return;
    await deleteWorkout(draft!.id);
    toast('Treino excluído');
    navigate('/treinos', { replace: true });
  }

  function discardRestored() {
    drafts.remove(draftKey);
    setRestored(false);
    setDraft(JSON.parse(baseline) as Workout);
  }

  const liveErrors = errors ? validate(draft) : null; // erros somem conforme ela corrige

  return (
    <>
      <TopBar title={isNew ? 'Novo treino' : 'Editar treino'} onBack={handleCancel} backLabel="Cancelar edição" />

      <div className="page page--sub page--with-bar edit">
        {restored && (
          <div className="banner">
            <Info aria-hidden="true" />
            <div className="banner__body">
              Recuperamos as alterações que ainda não tinham sido salvas.
              <br />
              <button type="button" onClick={discardRestored}>Descartar e usar a versão salva</button>
            </div>
          </div>
        )}

        <section className="edit__card">
          <div className="edit__title-row">
            <label className="field edit__tag">
              <span className="field__label">Letra</span>
              <input className="input input--tag" value={draft.tag} maxLength={2} onChange={(e) => update({ tag: e.target.value })} placeholder="A" />
            </label>
            <label className="field edit__name">
              <span className="field__label">Nome do treino</span>
              <input
                className={`input${liveErrors?.name ? ' input--invalid' : ''}`}
                value={draft.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Ex.: Pernas"
                autoCapitalize="sentences"
              />
            </label>
          </div>
          {liveErrors?.name && <span className="field__error">{liveErrors.name}</span>}

          <div className="field">
            <span className="field__label">Grupo muscular</span>
            <div className="chips" role="group" aria-label="Grupo muscular">
              {MUSCLE_GROUPS.map((g) => (
                <button key={g} type="button" className="chip" aria-pressed={draft.muscleGroup === g} onClick={() => update({ muscleGroup: draft.muscleGroup === g ? '' : g })}>
                  {g}
                </button>
              ))}
            </div>
            <input className="input" value={draft.muscleGroup} onChange={(e) => update({ muscleGroup: e.target.value })} placeholder="Ou escreva outro grupo" />
          </div>

          <label className="field">
            <span className="field__label">Descrição</span>
            <textarea className="textarea" rows={2} value={draft.description} onChange={(e) => update({ description: e.target.value })} placeholder="Objetivo do treino" />
          </label>

          <label className="field">
            <span className="field__label">Observações</span>
            <textarea className="textarea" rows={2} value={draft.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Aquecimento, lembretes…" />
          </label>
        </section>

        <section className="section">
          <div className="edit__ex-head">
            <h2 className="section-title">Exercícios</h2>
            <span className="muted">{draft.exercises.length}</span>
          </div>

          {draft.exercises.length === 0 && (
            <p className="edit__hint">Adicione os exercícios na ordem em que você faz. Dá para reorganizar depois com as setas.</p>
          )}

          <div className="stack">
            {draft.exercises.map((ex, i) => (
              <ExerciseEditor
                key={ex.id}
                exercise={ex}
                index={i}
                total={draft.exercises.length}
                expanded={expandedId === ex.id}
                errors={liveErrors?.exercises[ex.id]}
                onToggle={() => setExpandedId((cur) => (cur === ex.id ? null : ex.id))}
                onChange={(patch) => updateExercise(ex.id, patch)}
                onMove={(dir) => moveExercise(i, dir)}
                onRemove={() => removeExercise(ex)}
              />
            ))}
          </div>

          <button type="button" className="btn btn--outline btn--lg btn--block edit__add" onClick={addExercise}>
            <Plus aria-hidden="true" /> Adicionar exercício
          </button>
        </section>

        {!isNew && (
          <button type="button" className="btn btn--ghost btn--block edit__delete" onClick={handleDelete}>
            <Trash2 aria-hidden="true" /> Excluir treino
          </button>
        )}
      </div>

      <div className="action-bar">
        <div className="action-bar__inner">
          <button type="button" className="btn btn--ghost" onClick={handleCancel}>Cancelar</button>
          <button type="button" className="btn btn--primary btn--lg" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar treino'}
          </button>
        </div>
      </div>
    </>
  );
}
