import milkyWay from './assets/cosmos-milky-way.jpg';
import southernRing from './assets/cosmos-southern-ring.jpg';
import deepField from './assets/cosmos-deep-field.jpg';
import cartwheel from './assets/cosmos-cartwheel.jpg';
import pillars from './assets/cosmos-pillars.jpg';
import ngc604 from './assets/cosmos-ngc604.jpg';
import quintet from './assets/cosmos-quintet.jpg';

const nasaCredit = 'NASA, ESA, CSA, STScI';
export const chapterPhotography = {
  'system-title': {src:milkyWay,lines:['System Is','All You Need'],topic:'System Is All You Need',subtitle:'',title:'Milky Way · Great Observatories',credit:'NASA, ESA, SSC, CXC, STScI',instrument:'Hubble · Spitzer · Chandra',slug:'',url:'https://photojournal.jpl.nasa.gov/catalog/PIA12348'},
  'request-title': { src:southernRing, lines:['一次 LLM','請求'], topic:'一次 LLM 請求', subtitle:'從一段文字，到下一個 token', title:'Southern Ring Nebula', credit:nasaCredit, instrument:'Webb · NIRCam', slug:'southern-ring-nebula-nircam-image' },
  'gpu-title': { src:deepField, lines:['GPU','Architecture'], topic:'GPU Architecture', subtitle:'平行計算，與資料供給', title:"Webb’s First Deep Field", credit:nasaCredit, instrument:'Webb · NIRCam', slug:'webbs-first-deep-field-nircam-image' },
  'batch-title': { src:cartwheel, lines:['Continuous','Batching'], topic:'Continuous Batching', subtitle:'以 iteration 為邊界，讓工作持續接上', title:'Cartwheel Galaxy', credit:`${nasaCredit}, Webb ERO Production Team`, instrument:'Webb · NIRCam + MIRI', slug:'cartwheel-galaxy-nircam-and-miri-composite-image' },
  'flash-title': { src:pillars, lines:['Flash','Attention'], topic:'FlashAttention', subtitle:'讓資料留在片上，減少反覆搬移', title:'Pillars of Creation', credit:nasaCredit, instrument:'Webb · NIRCam', slug:'pillars-of-creation-nircam-image' },
  'paged-title': { src:ngc604, lines:['Paged','Attention'], topic:'PagedAttention', subtitle:'以 blocks 管理持續成長的 KV cache', title:'NGC 604', credit:nasaCredit, instrument:'Webb · MIRI', slug:'ngc-604-miri-image' },
  'systems-title': { src:quintet, lines:['A Systems','Perspective'], topic:'A Systems Perspective', subtitle:'把排程、運算與記憶體，接回同一次請求', title:'Stephan’s Quintet', credit:nasaCredit, instrument:'Webb · NIRCam + MIRI', slug:'stephans-quintet-nircam-and-miri-composite-image' },
} as const;
export type PhotoChapterId = keyof typeof chapterPhotography;
export const chapterPhotoCredits = Object.values(chapterPhotography).map(photo=>({
  ...photo, url:'url' in photo?photo.url:`https://science.nasa.gov/asset/webb/${photo.slug}/`,
}));

export function PhotoChapter({id,active}:{id:PhotoChapterId;active:boolean}) {
  const photo=chapterPhotography[id];
  return <div className="sia-chapter-layout sia-photo-chapter">
    <div className="sia-chapter-art">
      <img className="sia-chapter-photo" src={photo.src} alt="" decoding="sync"/>
      <div className="sia-chapter-photo-shade"/>
    </div>
    <header className="sia-chapter-heading" data-entry="title">{(id==='request-title'||id==='system-title')&&<div className="sia-section-number">Section {id==='request-title'?1:2}</div>}<h1 data-reveal="chapter-title">{photo.lines.map(text=><span key={text}>{text}</span>)}</h1></header>
    <div className="sia-chapter-photo-credit" data-entry="detail">{active?<a href={'url' in photo?photo.url:`https://science.nasa.gov/asset/webb/${photo.slug}/`} target="_blank" rel="noreferrer">{photo.title} · {photo.credit}</a>:<span>{photo.title} · {photo.credit}</span>}</div>
  </div>;
}
