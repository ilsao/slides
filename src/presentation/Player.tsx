import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { ArrowLeft, ArrowRight, ChevronFirst, ChevronLast, ExternalLink, Grid2X2, Home, Maximize, Minimize, HelpCircle, X } from 'lucide-react';
import { PlaybackProvider, usePlayback } from './context';
import { PresentationStage } from './Stage';
import type { DeckDefinition } from './types';
import { sitePath } from '../paths';

export function IconButton({ label, children, onClick, disabled, secondary = false }: {
  label: string; children: ReactNode; onClick: () => void; disabled?: boolean; secondary?: boolean;
}) {
  return <button className="icon-button" data-secondary={secondary || undefined} aria-label={label} title={label} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function Player({ deck, fresh }: { deck: DeckDefinition; fresh: boolean }) {
  const Provider = deck.Provider;
  return <PlaybackProvider deck={deck} fresh={fresh}>
    {Provider ? <Provider fresh={fresh}><PlayerView/></Provider> : <PlayerView/>}
  </PlaybackProvider>;
}

function PlayerView() {
  const runtime = usePlayback();
  const { deck, state, slide, index, actions } = runtime;
  const [menu, setMenu] = useState(false);
  const [help, setHelp] = useState(false);
  const [tools, setTools] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [ready, setReady] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const helpButton = useRef<HTMLButtonElement>(null);
  const revealTools = () => {
    setTools(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setTools(false), 3000);
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { setFeedback('無法進入全螢幕，請使用瀏覽器的全螢幕功能。'); }
  };
  useEffect(() => { setReady(true); document.title = `${deck.title} · Slides`; }, [deck.title]);
  useEffect(() => {
    const changed = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', changed);
    revealTools();
    return () => { document.removeEventListener('fullscreenchange', changed); if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenu(false); setHelp(false); return; }
      if (menu || help || event.altKey || event.ctrlKey || event.metaKey || event.repeat || event.defaultPrevented) return;
      const target = event.target as HTMLElement;
      if (target.closest('input,textarea,select,[contenteditable="true"]') || (event.key === ' ' && target.closest('button,a'))) return;
      const action = event.key === 'ArrowRight' || event.key === ' ' ? actions.next
        : event.key === 'ArrowLeft' ? actions.previous
        : event.key === 'PageDown' ? actions.nextSlide : event.key === 'PageUp' ? actions.previousSlide : null;
      if (action) { event.preventDefault(); action(); }
      if (event.key.toLowerCase() === 'f') { event.preventDefault(); void toggleFullscreen(); }
      if (event.key.toLowerCase() === 'o') { event.preventDefault(); menuButton.current?.focus(); setMenu(true); }
      if (event.key === '?') { event.preventDefault(); helpButton.current?.focus(); setHelp(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions, menu, help]);
  const closeMenu = () => { setMenu(false); menuButton.current?.focus(); };
  const closeHelp = () => { setHelp(false); helpButton.current?.focus(); };

  return <MotionConfig reducedMotion="user"><div data-deck={deck.id}>
    <div className="presentation-player projection-app" data-ready={ready} onPointerMove={revealTools} onPointerDown={revealTools}>
      <PresentationStage/>
      <div className={`presentation-controls projection-controls ${tools || menu || help ? 'visible' : ''}`} onFocus={revealTools}>
        <a href={sitePath()} className="icon-button" aria-label="返回首頁" title="返回首頁"><Home size={20}/></a>
        <button className="icon-button" aria-label="章節與頁面（O）" title="章節與頁面（O）" ref={menuButton} onClick={() => setMenu(true)}><Grid2X2 size={20}/></button>
        <div className="control-divider"/>
        <IconButton label="上一頁（Page Up）" secondary onClick={actions.previousSlide} disabled={index === 0}><ChevronFirst size={20}/></IconButton>
        <IconButton label="上一步（←）" onClick={actions.previous} disabled={index === 0 && state.step === 0}><ArrowLeft size={22}/></IconButton>
        <div className="nav-position"><strong>{String(index + 1).padStart(2, '0')}</strong><span>/ {deck.slides.length}</span></div>
        <IconButton label="下一步（→ / Space）" onClick={actions.next} disabled={index === deck.slides.length - 1 && state.step === slide.steps - 1}><ArrowRight size={22}/></IconButton>
        <IconButton label="下一頁（Page Down）" secondary onClick={actions.nextSlide} disabled={index === deck.slides.length - 1}><ChevronLast size={20}/></IconButton>
        <div className="step-dots" aria-label={`步驟 ${state.step + 1} / ${slide.steps}`}>{Array.from({ length: slide.steps }, (_, i) => <span className={i <= state.step ? 'active' : ''} key={i}/>)}</div>
        <div className="control-divider"/>
        <IconButton label={fullscreen ? '離開全螢幕（F）' : '全螢幕（F）'} onClick={() => void toggleFullscreen()}>{fullscreen ? <Minimize size={20}/> : <Maximize size={20}/>}</IconButton>
        <button className="icon-button" aria-label="操作說明（?）" title="操作說明（?）" ref={helpButton} onClick={() => setHelp(true)}><HelpCircle size={20}/></button>
        {deck.Controls && <deck.Controls {...runtime}/>}
      </div>
      {feedback && <div role="status" className="player-feedback" onClick={() => setFeedback('')}>{feedback}</div>}
      {menu && <Modal title="章節與投影片" onClose={closeMenu}>
        {deck.chapters && <div className="chapter-jumps">{deck.chapters.map(chapter => <button key={chapter.id} onClick={() => { actions.jump(chapter.slideId); closeMenu(); }}>{chapter.title}</button>)}</div>}
        <div className="slide-list">{deck.slides.map((item, i) => <button data-target={item.id} className={item.id === slide.id ? 'selected' : ''} aria-current={item.id === slide.id ? 'page' : undefined} key={item.id} onClick={() => { actions.jump(item.id); closeMenu(); }}>
          <span>{String(i + 1).padStart(2, '0')}</span><strong>{item.title}</strong>
        </button>)}</div>
      </Modal>}
      {help && <Modal title="放映操作" onClose={closeHelp}>
        <div className="shortcut-list">{[['→ / Space', '下一個動畫步驟，完成後換頁'], ['←', '退回上一步'], ['Page Up / Page Down', '直接切換整頁'], ['O', '章節與投影片'], ['F', '目前視窗全螢幕'], ['Esc', '關閉選單'], ['?', '操作說明']].map(([key, label]) => <div key={key}><kbd>{key}</kbd><span>{label}</span></div>)}</div>
        <p className="help-copy">重新整理會接續這個分頁的播放進度。從首頁再次開啟會從封面開始。</p>
        {deck.Help && <deck.Help/>}
        {deck.handout && <a className="handout-link" href={deck.handout.href} target="_blank" rel="noreferrer">{deck.handout.title}<ExternalLink size={16}/></a>}
        <button className="restart-button" onClick={() => { actions.restart(); closeHelp(); }}>從頭開始</button>
      </Modal>}
    </div>
  </div></MotionConfig>;
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className="presentation-modal modal" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header><h2>{title}</h2><IconButton label="關閉" onClick={onClose}><X size={23}/></IconButton></header>{children}
  </dialog>;
}
