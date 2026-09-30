import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { BottomSheet } from './BottomSheet';

/* ---------------- Toast ---------------- */
type ToastTone = 'default' | 'error';
interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => undefined);

/* ---------------- Confirmação ---------------- */
export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
}
const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(async () => false);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<number>();
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = 'default') => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone });
    timer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const confirm = useCallback(
    (opts: ConfirmOptions) => new Promise<boolean>((resolve) => setConfirmState({ ...opts, resolve })),
    []
  );

  const close = (value: boolean) => {
    confirmState?.resolve(value);
    setConfirmState(null);
  };

  return (
    <ToastContext.Provider value={showToast}>
      <ConfirmContext.Provider value={confirm}>
        {children}
        <div className="toast-region" aria-live="polite">
          {toast && (
            <div key={toast.id} className={`toast${toast.tone === 'error' ? ' toast--error' : ''}`}>
              {toast.message}
            </div>
          )}
        </div>
        <BottomSheet open={!!confirmState} onClose={() => close(false)} title={confirmState?.title}>
          {confirmState?.message && <p className="sheet__message">{confirmState.message}</p>}
          <div className="sheet__buttons">
            <button type="button" className={`btn btn--block btn--lg ${confirmState?.danger ? 'btn--danger' : 'btn--primary'}`} onClick={() => close(true)}>
              {confirmState?.confirmLabel}
            </button>
            <button type="button" className="btn btn--block btn--ghost" onClick={() => close(false)}>
              {confirmState?.cancelLabel ?? 'Cancelar'}
            </button>
          </div>
        </BottomSheet>
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
export const useConfirm = () => useContext(ConfirmContext);
