import type { ComponentType, ReactNode } from 'react';
import { motion } from 'motion/react';
import type { SlideDefinition, SlideRenderProps } from '../../src/presentation';
import { templateConfig, themes, type TemplateStyle } from './config';

export type TemplatePage = SlideDefinition & {
  Render: ComponentType<SlideRenderProps>;
  theme?: keyof typeof themes;
  style?: TemplateStyle;
};

function Reveal({ children, visible, runtime }: { children: ReactNode; visible: boolean; runtime: SlideRenderProps }) {
  const instant = runtime.still || runtime.reducedMotion || runtime.mode === 'preview' || !runtime.active;
  return <motion.div className="template-reveal" aria-hidden={!visible}
    initial={instant ? false : { opacity: 0, y: 24 }}
    animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24 }}
    transition={{ ...templateConfig.motion, duration: instant ? 0 : templateConfig.motion.duration }}>{children}</motion.div>;
}

function Cover(runtime: SlideRenderProps) {
  return <div className="template-cover">
    <div className="template-cover-copy"><span className="template-kicker">YOUR NEXT PRESENTATION</span>
      <h1>Make it<br/><em>your own.</em></h1>
      <Reveal visible={runtime.step >= 1} runtime={runtime}><p>從一個想法，開始你的下一份簡報。</p></Reveal>
    </div>
    <svg className="template-cover-art" viewBox="0 0 600 600" aria-hidden="true">
      <rect x="110" y="60" width="350" height="480" rx="36" fill="currentColor" transform="rotate(16 300 300)"/>
      <rect x="60" y="110" width="350" height="440" rx="36" fill="#ff967b" transform="rotate(-12 300 300)"/>
      <circle cx="280" cy="290" r="115" fill="#f6f4ee"/>
      <path d="M250 230L350 290L250 350Z" fill="#25213f"/>
    </svg>
  </div>;
}

function Story(runtime: SlideRenderProps) {
  return <div className="template-story"><span className="template-kicker">01 / TYPOGRAPHY</span>
    <h1>讓一個想法，<br/><em>佔滿整個畫面。</em></h1>
    <Reveal visible={runtime.step >= 1} runtime={runtime}><p>大標、留白與一句清楚的訊息。<br/>選擇自己的字體，也選擇自己的節奏。</p></Reveal>
  </div>;
}

function Split(runtime: SlideRenderProps) {
  return <div className="template-split"><div><span className="template-kicker">02 / COMPOSITION</span>
    <h1>內容與視覺，<br/>各有空間。</h1><p>文字、圖片、影片、SVG 或自訂元件，<br/>都能成為畫面的一部分。</p>
    <Reveal visible={runtime.step >= 1} runtime={runtime}><div className="template-note">版型由你決定，播放器負責播放。</div></Reveal>
  </div><div className="template-composition" aria-hidden="true"><div className="template-composition-circle"/><div className="template-composition-bar"/><div className="template-composition-square"/></div></div>;
}

function Comparison(runtime: SlideRenderProps) {
  return <div className="template-layout"><span className="template-kicker">03 / COMPARISON</span><h1>一個問題，兩種觀點。</h1>
    <div className="template-columns">{[{ title: '清楚表達', text: '精簡資訊，讓重點有空間。', label: 'Clarity' }, { title: '自由探索', text: '混合媒材，讓內容帶動形式。', label: 'Possibility' }].map((item, index) =>
      <Reveal key={item.label} visible={runtime.step >= index} runtime={runtime}><div className="template-comparison-card"><span>{item.label}</span><h2>{item.title}</h2><p>{item.text}</p></div></Reveal>)}</div>
  </div>;
}

const metrics = [{ label: '探索', value: 38 }, { label: '設計', value: 65 }, { label: '呈現', value: 92 }];

function Metrics(runtime: SlideRenderProps) {
  const instant = runtime.still || runtime.reducedMotion || runtime.mode === 'preview' || !runtime.active;
  return <div className="template-layout"><span className="template-kicker">04 / DATA · 示意資料</span><h1>讓數字，也能說故事。</h1>
    <div className="template-chart">{metrics.map((metric, index) => <div className="template-chart-row" key={metric.label}><span>{metric.label}</span><div className="template-chart-track">
      <motion.div className="template-chart-bar" initial={false} animate={{ width: `${runtime.step >= index ? metric.value : 0}%` }} transition={{ ...templateConfig.motion, duration: instant ? 0 : templateConfig.motion.duration }}/>
    </div><strong>{runtime.step >= index ? metric.value : '—'}</strong></div>)}</div>
    <p className="template-footnote">三組示意數值；逐步展示、退回或換成你的真實資料。</p>
  </div>;
}

function Movement(runtime: SlideRenderProps) {
  const instant = runtime.still || runtime.reducedMotion || runtime.mode === 'preview' || !runtime.active;
  return <div className="template-split"><div><span className="template-kicker">05 / MOTION</span><h1>讓動態，<br/>跟著內容走。</h1><p>按下一步，觀察形狀、位置與角度。<br/>退回上一步，也能還原每個狀態。</p>
    <div className="template-step-label">{['起點', '移動', '轉變'][runtime.step]}</div>
    {runtime.mode === 'playback' && runtime.active && <button className="template-button" onClick={runtime.actions.next}>下一步 →</button>}
  </div><div className="template-motion-stage"><div className="template-motion-guide"/>
    <motion.div className="template-motion-shape" initial={false}
      animate={{ x: runtime.step === 0 ? -100 : 100, rotate: runtime.step === 2 ? 135 : 0, borderRadius: runtime.step === 2 ? '50%' : '12%' }}
      transition={{ ...templateConfig.motion, duration: instant ? 0 : templateConfig.motion.duration }}/>
  </div></div>;
}

function Closing(runtime: SlideRenderProps) {
  return <div className="template-closing"><span className="template-kicker">NEXT / YOUR IDEAS</span><h1>下一份，<br/><em>就是你的簡報。</em></h1><p>從這份模板開始，建立自己的風格。</p>
    {runtime.mode === 'playback' && runtime.active && <button className="template-button" onClick={runtime.actions.restart}>重新體驗 →</button>}
  </div>;
}

export const templatePages: TemplatePage[] = [
  { id: 'cover', title: 'Make it your own', steps: 2, theme: 'lavender', Render: Cover },
  { id: 'story', title: '字體與留白', steps: 2, Render: Story, style: { '--template-font': 'Georgia, "Times New Roman", serif' } },
  { id: 'split', title: '自由構圖', steps: 2, theme: 'midnight', Render: Split },
  { id: 'comparison', title: '兩種觀點', steps: 2, Render: Comparison },
  { id: 'metrics', title: '資料呈現', steps: 3, theme: 'lavender', Render: Metrics },
  { id: 'motion', title: '步驟與動畫', steps: 3, theme: 'midnight', Render: Movement },
  { id: 'closing', title: '下一份簡報', steps: 1, Render: Closing },
];
