import { useEffect, useState } from 'react';
import { repositories } from '../storage';

// Imagens são imutáveis por id (trocar a foto gera um id novo), então o cache é seguro.
const cache = new Map<string, string>();

export function useImageUrl(imageId: string | null | undefined): string | undefined {
  const [state, setState] = useState<{ id?: string; url?: string }>(() =>
    imageId ? { id: imageId, url: cache.get(imageId) } : {}
  );

  useEffect(() => {
    if (!imageId) return;
    const cached = cache.get(imageId);
    if (cached) {
      setState({ id: imageId, url: cached });
      return;
    }
    let alive = true;
    repositories.images
      .get(imageId)
      .then((blob) => {
        if (!alive) return;
        if (!blob) return setState({ id: imageId, url: undefined });
        const url = URL.createObjectURL(blob);
        cache.set(imageId, url);
        setState({ id: imageId, url });
      })
      .catch(() => alive && setState({ id: imageId, url: undefined }));
    return () => {
      alive = false;
    };
  }, [imageId]);

  return imageId && state.id === imageId ? state.url : undefined;
}
