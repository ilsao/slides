import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { usePlayback, type PlaybackRuntime } from '../../../src/presentation';
import { IconButton } from '../../../src/presentation/Player';
import { formatTime, initialRest, readRest, restKey, restRemaining, updateRest, type RestState } from './rest';

type RestRuntime = { rest: RestState; remaining: string; finished: boolean; toggle: () => void; reset: () => void };
const Context = createContext<RestRuntime | null>(null);

export function RestProvider({ children, fresh }: { children: ReactNode; fresh: boolean }) {
  const { state } = usePlayback();
  const [rest, setRest] = useState(() => readRest(fresh));
  const [now, setNow] = useState(Date.now());
  const generation = useRef(state.generation);
  useEffect(() => {
    const restarted = generation.current !== state.generation;
    generation.current = state.generation;
    setRest(previous => {
      const next = restarted ? initialRest() : previous;
      return state.slideId === 28 ? updateRest(next, 'enter') : next;
    });
  }, [state.slideId, state.generation]);
  useEffect(() => {
    try { sessionStorage.setItem(restKey, JSON.stringify(rest)); } catch { /* The timer also works without persistence. */ }
  }, [rest]);
  useEffect(() => {
    if (rest.started === null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [rest.started]);
  const ms = restRemaining(rest, now);
  return <Context.Provider value={{ rest, remaining: formatTime(ms), finished: ms === 0,
    toggle: () => {
      const actionTime = Date.now();
      setNow(actionTime); setRest(previous => updateRest(previous, 'toggle', actionTime));
    },
    reset: () => {
      const actionTime = Date.now();
      setNow(actionTime); setRest(previous => updateRest(previous, 'reset', actionTime));
    },
  }}>{children}</Context.Provider>;
}

export const useRestPreview = () => useContext(Context)?.remaining ?? '10:00';

export function RestControls({ state }: PlaybackRuntime) {
  const runtime = useContext(Context)!;
  if (state.slideId !== 28) return null;
  const { rest, remaining, finished, toggle, reset } = runtime;
  return <div className="rest-controls backend-rest-controls"><span>休息倒數 <b>{remaining}</b></span>
    <IconButton disabled={finished} label={finished ? '休息已結束，請先重設' : rest.started !== null ? '暫停休息倒數' : '開始休息倒數'} onClick={toggle}>{rest.started !== null && !finished ? <Pause size={18}/> : <Play size={18}/>}</IconButton>
    <IconButton label="重設休息倒數" onClick={reset}><RotateCcw size={18}/></IconButton>
  </div>;
}
