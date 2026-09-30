import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/** Volta uma tela; se o app foi aberto direto nesta tela, vai para o destino padrão. */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [navigate, fallback]);
}
