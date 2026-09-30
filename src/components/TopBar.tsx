import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

interface Props {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
}

export function TopBar({ title, onBack, backLabel = 'Voltar', actions }: Props) {
  return (
    <header className="topbar">
      {onBack && (
        <button type="button" className="icon-btn" onClick={onBack} aria-label={backLabel}>
          <ChevronLeft />
        </button>
      )}
      <h1 className="topbar__title">{title}</h1>
      {actions}
    </header>
  );
}
