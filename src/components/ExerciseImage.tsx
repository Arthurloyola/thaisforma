import { useImageUrl } from '../hooks/useImageUrl';

interface Props {
  imageId: string | null;
  name: string;
  className?: string;
  onOpen?: (url: string) => void;
}

export function ExerciseImage({ imageId, name, className = '', onOpen }: Props) {
  const url = useImageUrl(imageId);

  if (url) {
    const img = <img src={url} alt={name || 'Imagem do exercício'} loading="lazy" decoding="async" />;
    return onOpen ? (
      <button type="button" className={`ex-image ${className}`} onClick={() => onOpen(url)} aria-label={`Ampliar imagem de ${name}`}>
        {img}
      </button>
    ) : (
      <div className={`ex-image ${className}`}>{img}</div>
    );
  }

  return (
    <div className={`ex-image ex-image--empty ${className}`} aria-hidden="true">
      <span>{(name.trim()[0] ?? '·').toUpperCase()}</span>
    </div>
  );
}
