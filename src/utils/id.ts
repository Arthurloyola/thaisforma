export function createId(): string {
  // randomUUID só existe em contexto seguro (https/localhost); o fallback cobre testes via IP da rede.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
