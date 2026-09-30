import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="sheet-layer" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" aria-hidden="true" />
        {title && <h2 className="sheet__title">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body
  );
}

export function SheetAction({
  icon,
  label,
  onClick,
  danger
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button type="button" className={`sheet-action${danger ? ' sheet-action--danger' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
