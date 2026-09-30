import { useSyncExternalStore } from 'react';
import { settingsStore } from '../storage';

export function useSettings() {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.get, settingsStore.get);
}
