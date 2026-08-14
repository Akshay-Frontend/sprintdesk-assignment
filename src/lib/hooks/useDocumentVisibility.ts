import { useSyncExternalStore } from 'react';

function subscribe(cb: () => void) {
  document.addEventListener('visibilitychange', cb);
  return () => document.removeEventListener('visibilitychange', cb);
}

function getSnapshot(): DocumentVisibilityState {
  return document.visibilityState;
}

function getServerSnapshot(): DocumentVisibilityState {
  return 'visible';
}

export function useDocumentVisibility() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
