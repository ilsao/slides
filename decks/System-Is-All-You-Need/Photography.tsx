import { useEffect, useState, type ReactNode } from 'react';
import cosmicArt from './assets/cosmic-cliffs-webb.jpg';
import auroraArt from './assets/aurora-oskar.jpg';
import { chapterPhotoCredits } from './ChapterPhotography';

export { cosmicArt, auroraArt };

// Keep the decoded images alive through navigation. Gallery previews do not mount
// this provider; only the player prepares chapter imagery and the two photographic bookends.
let preparation: Promise<void> | undefined;
let prepared = false;
const photographs: HTMLImageElement[] = [];
function preparePhotography() {
  return preparation ??= Promise.all([cosmicArt, auroraArt, ...chapterPhotoCredits.map(photo=>photo.src)].map(src => {
    const photo = new Image();
    photographs.push(photo);
    photo.src = src;
    return photo.decode().catch(() => undefined);
  })).then(() => { prepared = true; });
}

export function PhotographyReady({ children }: { children: ReactNode; fresh: boolean }) {
  const [ready, setReady] = useState(prepared);
  useEffect(() => {
    let mounted = true;
    void preparePhotography().then(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);
  return ready ? children : <div className="sia-photography-loading" role="status">準備投影片影像…</div>;
}
