import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Lightbox({ url, alt, onClose }: { url: string | null; alt: string; onClose: () => void }) {
  useEffect(() => {
    if (!url) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [url, onClose]);

  if (!url) return null;
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
      <button type="button" className="icon-btn lightbox__close" aria-label="Fechar imagem" onClick={onClose}>
        <X />
      </button>
      <img src={url} alt={alt} />
    </div>,
    document.body
  );
}
