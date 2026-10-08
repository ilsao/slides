import type { SlideRenderProps } from '../../src/presentation';
import { Reveal, canInteract, type AuthoredPage } from '../shared/authoring';
import { editorialConfig as config } from './config';

function Cover(runtime: SlideRenderProps) {
  return <div className="ed-page ed-cover"><div><div className="ed-eyebrow">A STUDY IN SIMPLICITY</div><h1>The art<br/>of <em>less.</em></h1>
    <Reveal runtime={runtime} at={1} effect="clip" duration={config.motion.duration}><p>少一點喧鬧，多一點值得停留的空間。</p></Reveal></div>
    <div className="ed-sculpture" aria-hidden="true"><div/><div/><span>01</span></div>
  </div>;
}
function Quote(runtime: SlideRenderProps) {
  return <div className="ed-page ed-quote"><span className="ed-quote-mark" aria-hidden="true">“</span><h1>What you leave out<br/>makes room for<br/><em>what matters.</em></h1>
    <Reveal runtime={runtime} at={1} effect="clip" duration={config.motion.duration}><p>讓留白成為內容的一部分。<span className="ed-credit">— Editorial / Design note 01</span></p></Reveal>
  </div>;
}
function Story(runtime: SlideRenderProps) {
  return <div className="ed-page ed-story"><div className="ed-story-title"><span className="ed-eyebrow">THE PRACTICE</span><h1>Room<br/>to <em>think.</em></h1><div className="ed-rule"/></div>
    <div className="ed-story-copy"><p className="ed-lead">好設計，從一個清楚的選擇開始。</p><p>每一段文字都有節奏，每一處留白都有用意。給觀眾一點時間，讓想法自然地展開。</p>
      <Reveal runtime={runtime} at={1} effect="clip" duration={config.motion.duration}><div className="ed-note"><b>01 — Intent</b><p>只留下推進故事的內容。</p></div></Reveal>
      <Reveal runtime={runtime} at={2} effect="clip" duration={config.motion.duration}><div className="ed-note"><b>02 — Space</b><p>讓重要的訊息，呼吸。</p></div></Reveal>
    </div></div>;
}
function Compare(runtime: SlideRenderProps) {
  return <div className="ed-page ed-compare"><h1>A quieter <em>point of view.</em></h1><div className="ed-columns"><div><span className="ed-eyebrow">BEFORE / NOISE</span><div className="ed-texture" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} style={{ width: `${95 - index % 3 * 16}%` }}/>)}</div><p>每個元素，都想說話。</p></div>
    <Reveal runtime={runtime} at={1} effect="clip" duration={config.motion.duration}><div className="ed-focus"><span className="ed-eyebrow">AFTER / FOCUS</span><h2>One idea.<br/><em>Well told.</em></h2><p>一句清楚的話，就很有力量。</p></div></Reveal>
  </div></div>;
}
function Closing(runtime: SlideRenderProps) {
  return <div className="ed-page ed-closing"><span className="ed-eyebrow">THE NEXT CHAPTER</span><h1>Make<br/><em>space.</em></h1><p>把你的下一個想法，放進這裡。</p>{canInteract(runtime) && <button onClick={runtime.actions.restart}>再讀一次 ↗</button>}</div>;
}
export const editorialPages: AuthoredPage[] = [
  { id: 'cover', title: 'The art of less', steps: 2, Render: Cover },
  { id: 'quote', title: '讓重點呼吸', steps: 2, Render: Quote },
  { id: 'story', title: 'Room to think', steps: 3, Render: Story },
  { id: 'compare', title: 'Noise & focus', steps: 2, Render: Compare },
  { id: 'closing', title: 'Make space', steps: 1, Render: Closing },
];
