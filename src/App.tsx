import { useEffect, useState } from 'react';
import { Gallery } from './Gallery';
import { Player } from './presentation/Player';
import type { DeckDefinition } from './presentation';
import { deckEntries, type DeckEntry } from './registry';

function DeckPage({ entry, fresh }: { entry: DeckEntry; fresh: boolean }) {
  const [deck, setDeck] = useState<DeckDefinition | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    void entry.load().then(value => { if (alive) setDeck(value); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [entry]);
  if (failed) return <Status title="投影片無法載入" description="請重新整理後再試一次。"/>;
  if (!deck) return <div className="route-loading" role="status">載入 {entry.title}…</div>;
  return <Player deck={deck} fresh={fresh}/>;
}

function Status({ title, description }: { title: string; description: string }) {
  useEffect(() => { document.title = `${title} · Slides`; }, [title]);
  return <main className="route-status"><span>Slides.</span><h1>{title}</h1><p>{description}</p><a href="/">返回首頁 →</a></main>;
}

export function App() {
  const [route] = useState(() => ({ pathname: location.pathname.replace(/\/$/, '') || '/', fresh: new URLSearchParams(location.search).get('start') === '1' }));
  useEffect(() => {
    if (route.pathname === '/presenter') { location.replace('/'); return; }
  }, [route]);
  if (route.pathname === '/') return <Gallery/>;
  if (route.pathname === '/presenter') return <div className="route-loading" role="status">返回首頁…</div>;
  const match = route.pathname.match(/^\/slides\/([a-z0-9-]+)$/);
  const entry = match && deckEntries.find(entry => entry.id === match[1]);
  return entry ? <DeckPage entry={entry} fresh={route.fresh}/> : <Status title="找不到頁面" description="這份簡報不存在，或網址已變更。"/>;
}
