export type Listener = () => void;

export interface Emitter {
  subscribe(listener: Listener): () => void;
  emit(): void;
}

export function createEmitter(): Emitter {
  const listeners = new Set<Listener>();
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit() {
      listeners.forEach((l) => l());
    }
  };
}
