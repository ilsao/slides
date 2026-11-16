import southernRing from './assets/cosmos-southern-ring.jpg';
import deepField from './assets/cosmos-deep-field.jpg';
import cartwheel from './assets/cosmos-cartwheel.jpg';
import pillars from './assets/cosmos-pillars.jpg';
import ngc604 from './assets/cosmos-ngc604.jpg';
import quintet from './assets/cosmos-quintet.jpg';

const nasaCredit = 'NASA, ESA, CSA, STScI';
export const chapterPhotography = {
  'request-title': { src:southernRing, lines:['一次 LLM','請求'], topic:'一次 LLM 請求', subtitle:'從一段文字，到下一個 token', title:'Southern Ring Nebula', credit:nasaCredit, instrument:'Webb · NIRCam', slug:'southern-ring-nebula-nircam-image' },
  'gpu-title': { src:deepField, lines:['GPU','Architecture'], topic:'GPU Architecture', subtitle:'平行計算，與資料供給', title:"Webb’s First Deep Field", credit:nasaCredit, instrument:'Webb · NIRCam', slug:'webbs-first-deep-field-nircam-image' },
  'batch-title': { src:cartwheel, lines:['Continuous','Batching'], topic:'Continuous Batching', subtitle:'以 iteration 為邊界，讓工作持續接上', title:'Cartwheel Galaxy', credit:`${nasaCredit}, Webb ERO Production Team`, instrument:'Webb · NIRCam + MIRI', slug:'cartwheel-galaxy-nircam-and-miri-composite-image' },
  'flash-title': { src:pillars, lines:['Flash','Attention'], topic:'FlashAttention', subtitle:'讓資料留在片上，減少反覆搬移', title:'Pillars of Creation', credit:nasaCredit, instrument:'Webb · NIRCam', slug:'pillars-of-creation-nircam-image' },
  'paged-title': { src:ngc604, lines:['Paged','Attention'], topic:'PagedAttention', subtitle:'以 blocks 管理持續成長的 KV cache', title:'NGC 604', credit:nasaCredit, instrument:'Webb · MIRI', slug:'ngc-604-miri-image' },
  'systems-title': { src:quintet, lines:['A Systems','Perspective'], topic:'A Systems Perspective', subtitle:'把排程、運算與記憶體，接回同一次請求', title:'Stephan’s Quintet', credit:nasaCredit, instrument:'Webb · NIRCam + MIRI', slug:'stephans-quintet-nircam-and-miri-composite-image' },
} as const;
export type PhotoChapterId = keyof typeof chapterPhotography;
export const chapterPhotoCredits = Object.values(chapterPhotography).map(photo=>({
  ...photo, url:`https://science.nasa.gov/asset/webb/${photo.slug}/`,
}));

export function PhotoChapter({id,active}:{id:PhotoChapterId;active:boolean}) {
  const photo=chapterPhotography[id];
  return <div className="sia-chapter-layout sia-photo-chapter">
    <img className="sia-chapter-photo" src={photo.src} alt="" decoding="sync"/>
    <div className="sia-chapter-photo-shade"/>
    <div className="sia-chapter-topic" data-entry="detail">{photo.topic}</div>
    <header className="sia-chapter-heading" data-entry="title"><h1>{photo.lines[0]}<br/>{photo.lines[1]}</h1></header>
    <p className="sia-chapter-subtitle" data-entry="detail">{photo.subtitle}</p>
    <div className="sia-chapter-photo-credit" data-entry="detail">{active?<a href={`https://science.nasa.gov/asset/webb/${photo.slug}/`} target="_blank" rel="noreferrer">{photo.title} · {photo.credit}</a>:<span>{photo.title} · {photo.credit}</span>}</div>
  </div>;
}
