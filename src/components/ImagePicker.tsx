import { useId, useState, type ChangeEvent } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { repositories } from '../storage';
import { prepareImage } from '../utils/image';
import { ExerciseImage } from './ExerciseImage';
import { useToast } from './Feedback';

interface Props {
  imageId: string | null;
  exerciseName: string;
  onChange: (imageId: string | null) => void;
}

/**
 * Seleciona uma foto da galeria, comprime e grava no IndexedDB.
 * O exercício guarda apenas o id gerado — nada depende do arquivo original.
 */
export function ImagePicker({ imageId, exerciseName, onChange }: Props) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite escolher a mesma foto de novo
    if (!file) return;
    setBusy(true);
    try {
      const blob = await prepareImage(file);
      const id = await repositories.images.put(blob);
      onChange(id);
    } catch {
      toast('Essa imagem não pôde ser aberta. Escolha outra foto da galeria.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="image-picker">
      <ExerciseImage imageId={imageId} name={exerciseName} className="image-picker__preview" />
      <div className="image-picker__actions">
        <label htmlFor={inputId} className={`btn btn--soft${busy ? ' is-busy' : ''}`} aria-disabled={busy}>
          <ImagePlus aria-hidden="true" />
          {busy ? 'Salvando imagem…' : imageId ? 'Trocar imagem' : 'Adicionar imagem'}
        </label>
        {imageId && !busy && (
          <button type="button" className="icon-btn icon-btn--danger" onClick={() => onChange(null)} aria-label="Remover imagem">
            <Trash2 />
          </button>
        )}
      </div>
      <input id={inputId} className="visually-hidden" type="file" accept="image/*" onChange={handleFile} disabled={busy} />
    </div>
  );
}
