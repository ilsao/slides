import type { CSSProperties, ReactNode } from 'react';
import './attention-morph.css';

type Props = { step: number };
type Pose = { left: number; top: number; width: number; height: number; opacity?: number; backgroundColor?: string; borderColor?: string; borderRadius?: number };

const cobalt = 'var(--sia-blue)';
const ink = 'var(--sia-ink)';
const paper = 'var(--sia-paper)';
const line = 'var(--sia-line)';
const tint = 'color-mix(in srgb, var(--sia-blue) 13%, var(--sia-paper))';
const lightBlue = 'color-mix(in srgb, var(--sia-blue) 48%, var(--sia-paper))';
const tiles = Array.from({ length: 64 }, (_, index) => {
  const row = Math.floor(index / 8), col = index % 8;
  return { row, col, group: Math.floor(row / 4) * 2 + Math.floor(col / 4), localRow: row % 4, localCol: col % 4 };
});

function Piece({ name, pose, className = '', children }: { name: string; pose: Pose; className?: string; children?: ReactNode }) {
  return <div data-morph={`attn-${name}`} className={`sia-attn-piece ${className}`} style={pose}>{children}</div>;
}

function Scene({ children, flash, step }: { children: ReactNode; flash: boolean; step: number }) {
  return <div className={`sia-attn-scene ${flash ? 'sia-attn-flash' : 'sia-attn-standard'}`} data-attn-step={step} role="img" aria-label={flash
    ? `FlashAttention 分塊計算。${step === 3 ? '最後一塊完成，將累積輸出寫回 HBM，不保留完整分數矩陣。' : `正在計算第 ${step + 1} 個 tile；其他方塊代表待處理的計算，而非已配置的記憶體。`}`
    : '傳統 Attention 產生 N 乘 N 的分數矩陣，將中間結果寫入 HBM，再讀回執行後續運算。'}>{children}</div>;
}

function ScoreCells({ flash, step }: { flash: boolean; step: number }) {
  return <>{tiles.map(({ row, col, group, localRow, localCol }) => {
    const active = flash && group === step;
    const completed = flash && group < step;
    // Each tile is one 4×4 portion of the same conceptual 8×8 score matrix.
    // Pending cells are outlined work, not materialized score storage.
    const pendingX = [1112, 1240, 1112, 1240][group];
    const pendingY = [106, 106, 245, 245][group];
    const pose: Pose = !flash ? {
      left: 455 + col * 39, top: 117 + row * 39, width: 35, height: 35,
      opacity:step===0?.14:1, backgroundColor: row >= col ? cobalt : lightBlue,
      borderColor: 'transparent', borderRadius: 0,
    } : completed ? {
      left: 928, top: 225, width: 1, height: 1, opacity: 0,
      backgroundColor: cobalt, borderColor: 'transparent', borderRadius: 0,
    } : active ? {
      left: 441 + localCol * 35, top: 151 + localRow * 35, width: 29, height: 29,
      opacity: 1, backgroundColor: row >= col ? cobalt : lightBlue, borderColor: 'transparent', borderRadius: 0,
    } : {
      left: pendingX + localCol * 23, top: pendingY + localRow * 23, width: 19, height: 19,
      backgroundColor: paper, borderColor: line, borderRadius: 0,
    };
    return <div key={`${row}-${col}`} data-morph={`attn-cell-${row}-${col}`} data-tile={group} data-morph-delay={!flash?row*24+col*9:group*24}
      className={`sia-attn-piece sia-attn-score ${active ? 'sia-attn-active-score' : ''} ${flash&&!active&&!completed?'sia-attn-pending-score':''}`}
      style={{ ...pose, '--cell': localRow * 4 + localCol } as CSSProperties}><i className="sia-attn-cell-cross"/></div>;
  })}</>;
}

export function StandardAttentionMorph({ step }: Props) {
  return <Scene flash={false} step={step}>
    <Piece name="hbm" pose={{ left: 430, top: 20, width: 370, height: 423, backgroundColor: paper, borderColor: line, borderRadius: 0 }} className="sia-attn-memory">
      <span>HBM</span><small>Scores · N × N</small>
    </Piece>
    <Piece name="q" pose={{ left: 16, top: 168, width: 124, height: 120, backgroundColor: tint, borderColor: line, borderRadius: 0 }} className="sia-attn-input"><b>Q</b></Piece>
    <Piece name="k" pose={{ left: 181, top: 168, width: 124, height: 120, backgroundColor: tint, borderColor: line, borderRadius: 0 }} className="sia-attn-input"><b>Kᵀ</b></Piece>
    <span className="sia-attn-multiply" style={{ left: 150, top: 212 }}>×</span>
    <Piece name="v" pose={{ left: 1049, top: 169, width: 93, height: 120, backgroundColor: tint, borderColor: line, borderRadius: 0 }} className="sia-attn-input"><b>V</b></Piece>
    <Piece name="op-softmax" pose={{ left: 847, top: 191, width: 153, height: 75, opacity:step>=2?1:.12, backgroundColor: paper, borderColor: line, borderRadius: 0 }} className="sia-attn-op">Softmax</Piece>
    <Piece name="output" pose={{ left: 1222, top: 163, width: 155, height: 130, opacity:step>=2?1:.12, backgroundColor: ink, borderColor: ink, borderRadius: 0 }} className="sia-attn-output"><b>O</b><small>Output</small></Piece>
    <ScoreCells flash={false} step={step}/>
    <svg className="sia-attn-wires" viewBox="0 0 1408 510" aria-hidden="true">
      <path d="M305 228H414"/><path data-build="standard-read" data-visible={step>=2} data-delay="220" d="M800 228H831M1005 228H1033M1147 228H1206"/>
      <path d="M408 224L414 228L408 232M825 224L831 228L825 232M1200 224L1206 228L1200 232"/>
      <path className="sia-attn-io" data-show={step >= 2} d="M615 443V459H926V278"/>
    </svg>
    <span className="sia-attn-multiply" style={{ left: 1014, top: 212 }}>×</span>
    <div className="sia-attn-caption" style={{ left: 16, top: 321 }}>QKᵀ / √dₖ</div>
    <div className="sia-attn-io-caption" data-show={step >= 2}>中間矩陣反覆讀寫</div>
    <div className="sia-attn-standard-step" data-build="standard-caption" data-state={step}>{['Q 與 Kᵀ 相乘：為每一對 tokens 計算分數','N × N 的中間結果存入 HBM','讀回分數做 softmax，再與 V 相乘'][Math.min(step,2)]}</div>
    <div className="sia-attn-bottom"><span>分開執行的 attention kernels</span><strong>Intermediate memory · O(N²)</strong></div>
  </Scene>;
}

export function FlashAttentionMorph({ step }: Props) {
  const last = step === 3;
  return <Scene flash step={step}>
    <Piece name="hbm" pose={{ left: 0, top: 95, width: 290, height: 257, backgroundColor: paper, borderColor: line, borderRadius: 0 }} className="sia-attn-memory">
      <span>HBM</span><small>Q / K / V</small>
    </Piece>
    <div className="sia-attn-sram" data-morph-enter><span>On-chip SRAM</span><small>局部分數與統計量留在片上</small></div>
    {['q', 'k', 'v'].map((name, index) => <Piece key={name} name={name} pose={{ left: 26 + index * 84, top: 188, width: 68, height: 107, backgroundColor: tint, borderColor: line, borderRadius: 0 }} className="sia-attn-input"><b>{name.toUpperCase()}</b></Piece>)}
    <div className="sia-attn-matmul sia-attn-kernel" data-morph-enter>QᵢKⱼᵀ / √dₖ</div>
    <Piece name="op-softmax" pose={{ left: 650, top: 191, width: 181, height: 57, backgroundColor: paper, borderColor: line, borderRadius: 0 }} className="sia-attn-op">Online softmax</Piece>
    <div className="sia-attn-accumulate sia-attn-kernel" data-morph-enter>Accumulate</div>
    <Piece name="output" pose={{ left: last ? 1170 : 874, top: last ? 165 : 169, width: last ? 183 : 147, height: last ? 149 : 105, backgroundColor: last ? ink : tint, borderColor: last ? ink : line, borderRadius: 0 }} className="sia-attn-output"><b>O</b><small>{last ? 'Output' : 'Accumulator'}</small></Piece>
    <ScoreCells flash step={step}/>
    <svg className="sia-attn-wires" viewBox="0 0 1408 510" aria-hidden="true">
      <path d="M290 241H405M395 234L405 241L395 248"/>
      <path className="sia-attn-inner-wire" d={`M590 219H631M621 212L631 219L621 226M740 170V185M740 254V267${last?'M837 295H1020V240H1055':'M837 295H853V221H866'}`}/>
      <path className="sia-attn-writeback" data-show={last} d="M1055 240H1154M1144 233L1154 240L1144 247"/>
    </svg>
    <div className="sia-attn-tile-index" data-morph-enter>Tile 0{Math.min(step + 1, 4)} <span>/ 04</span></div>
    <div className="sia-attn-pending-label" data-morph-enter>{last ? 'HBM / output' : '待處理的 tiles'}</div>
    {!last&&<div className="sia-attn-pending-note">虛線代表計算工作<br/>尚未存成完整矩陣</div>}
    <div className="sia-attn-tile-label">當前 tile</div>
    <div className="sia-attn-load-label">讀取一塊</div>
    <div className="sia-attn-kernel-note" data-morph-enter>{last?'最後一塊完成，寫回 O':'同一個 kernel 內完成計算與累積'}</div>
    <div className="sia-attn-bottom"><span>分塊示意 · Q / K / V 仍需讀取</span><strong>不將完整 N × N 矩陣寫入 HBM</strong></div>
  </Scene>;
}
