export type RestState = { elapsed: number; started: number | null; autoStarted: boolean };
export const REST_DURATION = 600000;
export const restKey = 'slides:backend-workshop:rest';
export const initialRest = (): RestState => ({ elapsed: 0, started: null, autoStarted: false });
export const restRemaining = (rest: RestState, now = Date.now()) => Math.max(0, REST_DURATION - rest.elapsed - (rest.started === null ? 0 : Math.max(0, now - rest.started)));
export const formatTime = (ms: number) => {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};
export function updateRest(rest: RestState, operation: 'enter' | 'toggle' | 'reset', now = Date.now()): RestState {
  if (operation === 'enter') return rest.autoStarted ? rest : { elapsed: 0, started: now, autoStarted: true };
  if (operation === 'reset') return { elapsed: 0, started: null, autoStarted: true };
  const remaining = restRemaining(rest, now);
  if (!remaining) return rest;
  return { elapsed: REST_DURATION - remaining, started: rest.started === null ? now : null, autoStarted: true };
}
export function readRest(fresh: boolean): RestState {
  if (fresh) return initialRest();
  try {
    const rest = JSON.parse(sessionStorage.getItem(restKey) ?? 'null') as RestState | null;
    if (rest && Number.isFinite(rest.elapsed) && rest.elapsed >= 0 && rest.elapsed <= REST_DURATION
      && (rest.started === null || (Number.isFinite(rest.started) && rest.started >= 0)) && typeof rest.autoStarted === 'boolean') return rest;
  } catch { /* Ignore malformed or unavailable session storage. */ }
  return initialRest();
}
