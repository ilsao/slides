import type { TransitionDefinition } from '../../src/presentation';
import { drawArtwork } from './diagramDraw';

type Box = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
type Label = { key: string; element: HTMLElement; box: Box };
type MorphSource = { box: Box; opacity: string; labels: { key: string; box: Box }[] };
type BuildPose = { opacity: string; transform: string; state: string };
type MotionVelocity = { box:Box; matrix:number[] };
type MotionPose = { key:string; transform:string; index:number; box?:Box; opacity?:number; velocity?:MotionVelocity };
type ExitPaint=Pick<CSSStyleDeclaration,'opacity'|'transform'|'stroke'|'strokeWidth'|'strokeOpacity'|'strokeDasharray'|'strokeDashoffset'|'fillOpacity'|'clipPath'>;
type MorphSnapshot = Map<string, MorphSource> & { builds?: Map<string, BuildPose>; motions?:Map<string,MotionPose>; slide?:string; step?:number; title?:string; background?:string; color?:string; exitPaint?:ExitPaint[] };
const sectionEnds:Record<string,string>={'request-title':'stage','system-title':'generation','gpu-title':'system-title','batch-title':'hierarchy','flash-title':'continuous','paged-title':'flash-result','systems-title':'sharing'};
// Only authored nodes: diagnostic attributes and temporary backing surfaces
// are absent from React's frozen source render and cannot identify its nodes.
const exitNodes='[data-motion],[data-build],[data-morph],[data-reveal],svg path,svg line,svg polyline,svg polygon,svg rect,svg circle,svg ellipse,svg text,h1,.sia-scene,.sia-heading,.sia-stack-layer,.sia-system-word,.sia-bm-request-progress';
const easing = 'cubic-bezier(.22,0,.2,1)';
const entranceEasing = easing;
const pageTiming = { title: 0, diagram: 70, detail: 190, detailStagger: 45 };
const surfaces = new WeakMap<HTMLElement, HTMLElement>();
const cleanups = new WeakMap<HTMLElement, () => void>();
const copyBox = (box: Box): Box => ({ left: box.left, top: box.top, width: box.width, height: box.height });
const safeScale = (scale: number) => Number.isFinite(scale) && scale > 0 ? scale : 1;
const center = (box: Box) => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });

/** Damped physical response in seconds. A larger mass gives the main visual a
 * deliberate launch and long braking tail, with less than 1% overshoot. */
export function springValue(from:number,to:number,velocity:number,time:number,mass=1.8):number {
  const stiffness=320,damping=40,a=damping/(2*mass),d=stiffness/mass-a*a,delta=from-to;
  if(Math.abs(d)<.001)return to+Math.exp(-a*time)*(delta+(velocity+a*delta)*time);
  const w=Math.sqrt(Math.abs(d));
  return to+Math.exp(-a*time)*(d>0?delta*Math.cos(w*time)+(velocity+a*delta)/w*Math.sin(w*time):delta*Math.cosh(w*time)+(velocity+a*delta)/w*Math.sinh(w*time));
}
const matrixValues=(value:string)=>{const m=new DOMMatrix(value==='none'?undefined:value);return [m.a,m.b,m.c,m.d,m.e,m.f]};
function springMatrix(from:string,to:string,velocity:number[]|undefined,duration:number,mass=1.8):Keyframe[]{
  const start=matrixValues(from),end=matrixValues(to);
  return Array.from({length:61},(_,i)=>({offset:i/60,transform:`matrix(${start.map((v,j)=>i===60?end[j]:springValue(v,end[j],velocity?.[j]??0,i/60*duration/1000,mass)).join(',')})`}));
}
function entryFrames(x:number,y:number,duration:number,direction:number,base='',mass=1.8,depth=false):Keyframe[]{
  return Array.from({length:61},(_,i)=>{const remaining=i===60?0:springValue(1,0,0,i/60*duration/1000,mass);return{offset:i/60,transform:`translate(${direction*x*remaining}px,${y*remaining}px)${depth?` scale(${1-.012*remaining})`:''} ${base}`.trim()}});
}

/** Measure velocity only at navigation, before cancellation. Temporarily sample
 * transform timelines 8ms earlier in the same JS task; no intermediate paint. */
function motionVelocities(current:HTMLElement,nodes:HTMLElement[]):Map<HTMLElement,MotionVelocity>{
  const result=new Map<HTMLElement,MotionVelocity>();
  if(!nodes.length||typeof current.getAnimations!=='function')return result;
  const moving=current.getAnimations({subtree:true}).filter(a=>typeof a.currentTime==='number'&&a.currentTime>8&&a.effect instanceof KeyframeEffect&&a.effect.getKeyframes().some(f=>f.transform));
  if(!moving.length)return result;
  const pose=(e:HTMLElement)=>({box:copyBox((e.querySelector('[data-motion-surface]')??e).getBoundingClientRect()),matrix:matrixValues(getComputedStyle(e).transform)});
  const now=nodes.map(pose),times=moving.map(a=>a.currentTime as number);
  moving.forEach((a,i)=>{a.currentTime=times[i]-8});const before=nodes.map(pose);moving.forEach((a,i)=>{a.currentTime=times[i]});
  nodes.forEach((e,i)=>result.set(e,{box:{left:(now[i].box.left-before[i].box.left)/.008,top:(now[i].box.top-before[i].box.top)/.008,width:(now[i].box.width-before[i].box.width)/.008,height:(now[i].box.height-before[i].box.height)/.008},matrix:now[i].matrix.map((v,j)=>(v-before[i].matrix[j])/.008)}));
  return result;
}

/** Empty tiles use compositor FLIP; layout is measured once, never tweened. */
export function morphGeometry(from: Box, to: Box, scale: number): Keyframe[] {
  const s = safeScale(scale);
  return [
    { transform: `translate(${(from.left - to.left) / s}px, ${(from.top - to.top) / s}px) scale(${from.width / to.width}, ${from.height / to.height})` },
    { transform: 'translate(0px, 0px) scale(1, 1)' },
  ];
}

function labels(element: HTMLElement): Label[] {
  // Direct children own the readable label layout. Decorative children (grids,
  // progress fills, texture) stay on the surface and never need text correction.
  return Array.from(element.children).flatMap((child, index) => {
    if (!(child instanceof HTMLElement) || child.hasAttribute('data-morph-surface') || !child.textContent?.trim()) return [];
    return [{ key: `${index}:${child.tagName}:${child.className}`, element: child, box: copyBox(child.getBoundingClientRect()) }];
  });
}

/** Snapshot the visible surface, not the label wrapper's settled layout box.
 * This runs before React mutations and before cancellation, including on steps. */
function captureMorph(current: HTMLElement): MorphSnapshot {
  const layerOpacity = Number(getComputedStyle(current).opacity || 1);
  const snapshot: MorphSnapshot = new Map(Array.from(current.querySelectorAll<HTMLElement>('[data-morph]')).map(element => {
    const visible = surfaces.get(element) ?? element;
    // A new scene can still be fading in when the presenter advances again.
    // Its children report opacity:1 even while their visible opacity is lower.
    let opacity = Number(getComputedStyle(element).opacity || 1) * layerOpacity;
    for (let parent = element.parentElement; parent && parent !== current; parent = parent.parentElement) {
      opacity *= Number(getComputedStyle(parent).opacity || 1);
    }
    return [element.dataset.morph!, {
      box: copyBox(visible.getBoundingClientRect()),
      opacity: String(opacity),
      labels: labels(element).map(({ key, box }) => ({ key, box })),
    }];
  }));
  snapshot.builds = new Map(Array.from(current.querySelectorAll<HTMLElement>('[data-build]')).map(element => {
    const paint = getComputedStyle(element);
    return [element.dataset.build!, { opacity: paint.opacity, transform: paint.transform, state: element.dataset.state ?? element.dataset.visible ?? '' }];
  }));
  snapshot.slide = current.querySelector<HTMLElement>('.sia-slide')?.dataset.slideId;
  const slidePaint=current.querySelector('.sia-slide');
  if(slidePaint){const paint=getComputedStyle(slidePaint);snapshot.background=paint.backgroundColor;snapshot.color=paint.color;}
  snapshot.step = Number(current.querySelector<HTMLElement>('.sia-slide')?.dataset.step ?? 0);
  snapshot.title=current.querySelector('.sia-heading h1')?.textContent??'';
  if(Object.values(sectionEnds).includes(snapshot.slide??''))snapshot.exitPaint=Array.from(current.querySelectorAll<HTMLElement>(exitNodes)).map(element=>{
    const p=getComputedStyle(element);return{opacity:p.opacity,transform:p.transform,stroke:p.stroke,strokeWidth:p.strokeWidth,strokeOpacity:p.strokeOpacity,strokeDasharray:p.strokeDasharray,strokeDashoffset:p.strokeDashoffset,fillOpacity:p.fillOpacity,clipPath:p.clipPath};
  });
  const motionNodes=Array.from(current.querySelectorAll<HTMLElement>('[data-motion]')),velocities=motionVelocities(current,motionNodes);
  snapshot.motions = new Map(motionNodes.map(element => {
    let opacity=1;
    for(let node:Element|null=element;node&&node!==current;node=node.parentElement)opacity*=Number(getComputedStyle(node).opacity);
    const surface=element.querySelector<HTMLElement>('[data-motion-surface]')??element;
    return [element.dataset.motionId ?? element.dataset.motion!, {key:element.dataset.motionKey ?? '',transform:getComputedStyle(element).transform,index:Number(element.dataset.motionIndex ?? 0),box:copyBox(surface.getBoundingClientRect()),opacity,velocity:velocities.get(element)}];
  }));
  return snapshot;
}

/** Geometry and paint are split only for a resizing text-bearing box. The
 * backing plane scales; labels move at their real font size. No clones of text,
 * width/height animation, per-frame style writes, or persistent promoted layers. */
function makeSurface(element: HTMLElement, box: Box, style: CSSStyleDeclaration, scale: number) {
  const surface = element.ownerDocument.createElement('div');
  surface.dataset.morphSurface = '';
  surface.setAttribute('aria-hidden', 'true');
  Object.assign(surface.style, {
    position: 'absolute', pointerEvents: 'none', boxSizing: 'border-box',
    left: `${-parseFloat(style.borderLeftWidth || '0')}px`, top: `${-parseFloat(style.borderTopWidth || '0')}px`,
    width: `${box.width / scale}px`, height: `${box.height / scale}px`,
    margin: '0', padding: '0', zIndex: '-1', transformOrigin: '0 0',
    background: style.background, borderRadius: style.borderRadius, boxShadow: style.boxShadow,
    borderTop: style.borderTop, borderRight: style.borderRight,
    borderBottom: style.borderBottom, borderLeft: style.borderLeft,
  });
  const temporary: Record<string, string> = {
    'background-color': 'transparent', 'background-image': 'none',
    'border-color': 'transparent', 'box-shadow': 'none',
    isolation: 'isolate', overflow: 'visible',
  };
  const saved = Object.keys(temporary).map(property => ({
    property, value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property),
  }));
  for (const [property, value] of Object.entries(temporary)) element.style.setProperty(property, value, 'important');
  element.appendChild(surface);
  surfaces.set(element, surface);
  return { surface, dispose() {
    if (surfaces.get(element) !== surface) return;
    surfaces.delete(element);
    surface.remove();
    for (const { property, value, priority } of saved) {
      // A step may have just changed React's inline paint. Preserve that new
      // value instead of restoring the previous step's authored declaration.
      if (element.style.getPropertyValue(property) !== temporary[property]) continue;
      if (value) element.style.setProperty(property, value, priority);
      else element.style.removeProperty(property);
    }
  } };
}

function changed(a: Box, b: Box) {
  return Math.abs(a.left - b.left) > .1 || Math.abs(a.top - b.top) > .1 || Math.abs(a.width - b.width) > .1 || Math.abs(a.height - b.height) > .1;
}

function animateObjects(current: HTMLElement, source: MorphSnapshot, duration: number, phaseDelay = 0): Animation[] {
  // The snapshot was taken before the old animation was cancelled. Remove its
  // backing planes synchronously before measuring new, authored destinations.
  cleanups.get(current)?.();
  const slide = current.querySelector<HTMLElement>('.sia-slide');
  if (!slide) return [];
  const scale = safeScale(slide.getBoundingClientRect().width / 1600);
  const pairs = Array.from(current.querySelectorAll<HTMLElement>('[data-morph]')).flatMap(element => {
    const from = source.get(element.dataset.morph!);
    const box = copyBox(element.getBoundingClientRect());
    if (!from || !from.box.width || !from.box.height || !box.width || !box.height) return [];
    const computed = getComputedStyle(element);
    // CSSStyleDeclaration is live: copy every value before any DOM/style writes.
    const style = Object.fromEntries(['background', 'borderRadius', 'boxShadow', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft', 'borderLeftWidth', 'borderTopWidth'].map(key => [key, computed[key as keyof CSSStyleDeclaration]])) as unknown as CSSStyleDeclaration;
    return [{ element, from, box, opacity: computed.opacity, style, labels: labels(element), hasText: Boolean(element.textContent?.trim()) }];
  });
  current.dataset.morphCount = String(pairs.length);
  const animations: Animation[] = [];
  const dispose: (() => void)[] = [];
  const run = (element: HTMLElement, frames: Keyframe[]) => {
    const delay = phaseDelay + Number(element.dataset.morphDelay ?? 0);
    const animation = element.animate(frames, { duration:Number(element.dataset.morphDuration??duration), delay, easing, fill: 'both' });
    animations.push(animation);
  };
  for (const pair of pairs) {
    const { element, from, box, opacity } = pair;
    if (!changed(from.box, box) && Number(from.opacity) === Number(opacity)) continue;
    if (Number(from.opacity) === 0 && Number(opacity) === 0) continue;
    if (!pair.hasText) {
      const original = element.style.transformOrigin;
      element.style.transformOrigin = '0 0';
      dispose.push(() => { element.style.transformOrigin = original; });
      const frames = morphGeometry(from.box, box, scale);
      Object.assign(frames[0], { opacity: from.opacity });
      Object.assign(frames[1], { opacity });
      run(element, frames);
      continue;
    }
    const a = center(from.box), b = center(box);
    const dx = (a.x - b.x) / scale, dy = (a.y - b.y) / scale;
    run(element, [
      { transform: `translate(${dx}px, ${dy}px)`, opacity: from.opacity },
      { transform: 'translate(0px, 0px)', opacity },
    ]);
    if (Math.abs(from.box.width - box.width) > .1 || Math.abs(from.box.height - box.height) > .1) {
      const backing = makeSurface(element, box, pair.style, scale);
      dispose.push(backing.dispose);
      const x = (from.box.left - box.left) / scale - dx;
      const y = (from.box.top - box.top) / scale - dy;
      run(backing.surface, [
        { transform: `translate(${x}px, ${y}px) scale(${from.box.width / box.width}, ${from.box.height / box.height})` },
        { transform: 'translate(0px, 0px) scale(1, 1)' },
      ]);
    }
    for (const label of pair.labels) {
      const old = from.labels.find(candidate => candidate.key === label.key);
      if (!old) continue;
      const oldCenter = center(old.box), newCenter = center(label.box);
      const x = (oldCenter.x - newCenter.x) / scale - dx;
      const y = (oldCenter.y - newCenter.y) / scale - dy;
      if (Math.abs(x) < .1 && Math.abs(y) < .1) continue;
      run(label.element, [{ transform: `translate(${x}px, ${y}px)` }, { transform: 'translate(0px, 0px)' }]);
    }
  }
  current.dataset.morphAnimated = String(animations.length);
  if (dispose.length) {
    const cleanup = () => {
      if (cleanups.get(current) !== cleanup) return;
      cleanups.delete(current);
      dispose.forEach(dispose => dispose());
    };
    cleanups.set(current, cleanup);
    void Promise.all(animations.map(animation => animation.finished)).then(cleanup, cleanup);
  }
  return animations;
}

/** Reveal one explanatory beat at a time; poses survive rapid reverse navigation. */
function animateBuilds(current: HTMLElement, source: MorphSnapshot, entranceDelay = 0): Animation[] {
  const animations: Animation[] = [];
  for (const element of current.querySelectorAll<HTMLElement>('[data-build]')) {
    const old = source.builds?.get(element.dataset.build!);
    const state = element.dataset.state ?? element.dataset.visible ?? '';
    const visible = element.dataset.visible !== 'false';
    const settledTransform = !old || old.transform === 'none' || old.transform === 'matrix(1, 0, 0, 1, 0, 0)';
    if (old?.state === state && (visible ? Number(old.opacity) >= .999 && settledTransform : Number(old.opacity) <= .001)) continue;
    // Hide inactive beats immediately; visible replacements retain their paint.
    if (!visible) {if(element.dataset.exitFade==='true'&&old&&Number(old.opacity)>.01)animations.push(element.animate([{opacity:old.opacity},{opacity:0}],{duration:240,fill:'both'}));continue;}
    const opacity = visible ? '1' : '0';
    const replacing=Boolean(old&&old.state!==state&&Number(old.opacity)>.99);
    const fromOpacity = replacing?'1':old?.opacity ?? '0';
    animations.push(element.animate([
      { opacity: replacing?'.65':fromOpacity },
      { opacity },
    ], { duration: replacing?180:160, delay: !replacing&&visible && old?.state !== state ? entranceDelay + Number(element.dataset.delay ?? 0) : 0, easing, fill: 'both' }));
    if(!old||Number(old.opacity)<.01)animations.push(...drawArtwork(element,entranceDelay+Number(element.dataset.delay??0)));
  }
  return animations;
}

const slideId = (layer: HTMLElement) => layer.querySelector<HTMLElement>('.sia-slide')?.dataset.slideId ?? '';
const objectDuration = (id: string, step = false) => ['static','continuous'].includes(id) ? (step ? 520 : 620) : (step ? 520 : 580);

/** Explanatory paths own their destination object: no flying text duplicates. */
function mechanisms(current:HTMLElement,source:MorphSnapshot,delay=0):Animation[] {
  const slide=current.querySelector<HTMLElement>('.sia-slide');
  const reverse=source.slide===slide?.dataset.slideId&&Number(slide?.dataset.step)<Number(source.step);
  if(slide)slide.dataset.motionDirection=reverse?'reverse':'forward';
  const animations:Animation[]=[];
  for(const element of current.querySelectorAll<HTMLElement>('[data-motion]')) {
    const kind=element.dataset.motion!,old=source.motions?.get(element.dataset.motionId??kind);
    if(kind!=='object'&&source.slide===slide?.dataset.slideId&&old?.key===element.dataset.motionKey||element.dataset.motionActive==='false')continue;
    if(element.dataset.drawArrival==='true'&&!old){animations.push(...drawArtwork(element,delay));continue;}
    let frames:Keyframe[]=[];
    let duration=760,wait=delay,velocity=old?.velocity?.matrix;
    const objectFlight=()=>{
      if(!old?.box||(old.opacity??1)<.01||!(element instanceof SVGGraphicsElement))return [];
      const surface=element.querySelector<SVGGraphicsElement>('[data-motion-surface]')??element;
      if(!changed(old.box,surface.getBoundingClientRect()))return [];
      const base=surface.getBBox(),parent=(element.parentElement as unknown as SVGGraphicsElement).getScreenCTM();
      if(!parent||!base.width||!base.height)return [];
      const sx=old.box.width/base.width/parent.a,sy=old.box.height/base.height/parent.d;
      const tx=(old.box.left-parent.e)/parent.a-base.x*sx,ty=(old.box.top-parent.f)/parent.d-base.y*sy;
      const target=getComputedStyle(element).transform;
      if(old.velocity){const v=old.velocity.box,sa=v.width/base.width/parent.a,sd=v.height/base.height/parent.d;velocity=[sa,0,0,sd,v.left/parent.a-base.x*sa,v.top/parent.d-base.y*sd];}
      return [{transform:`matrix(${sx},0,0,${sy},${tx},${ty})`},{transform:target}];
    };
    if(kind==='settle') {
      const target=getComputedStyle(element).transform;
      if(!old||old.transform===target)continue;
      frames=[{transform:old.transform},{transform:target}];duration=440;
    } else if(kind==='object') {
      frames=objectFlight();duration=820;
    } else if(kind==='camera') {
      if(reverse&&element.dataset.replayForward==='true')continue;
      const target=getComputedStyle(element).transform;
      const from=reverse&&element.dataset.fromReverse?element.dataset.fromReverse:old?.transform&&old.transform!==target?old.transform:element.dataset.from;
      if(!from)continue;
      frames=[{transform:from},{transform:target}];duration=840;
    } else if(kind==='batch-progress') {
      if(!old)continue;
      const bm=current.querySelector<HTMLElement>('.sia-bm'),head=source.get('batch-playhead');
      if(!bm||!head||!slide)continue;
      const scale=slide.getBoundingClientRect().width/1600;
      const from=((head.box.left-bm.getBoundingClientRect().left)/scale-94)/20,to=Number(element.dataset.time),start=Number(element.dataset.start),length=Number(element.dataset.duration);
      if(Math.abs(from-to)<.001)continue;
      const stops=[from,...[start,start+length].filter(t=>t>Math.min(from,to)&&t<Math.max(from,to)).sort((a,b)=>from<to?a-b:b-a),to];
      // Keep scaleX in every frame: a singular matrix(0,...) cannot be
      // decomposed against scaleX, which otherwise makes a zero-width fill jump.
      frames=stops.map((t,i)=>({offset:Math.abs((t-from)/(to-from)),transform:`scaleX(${i===0?matrixValues(old.transform)[0]:Math.max(0,Math.min(1,(t-start)/length))})`}));
      duration=source.slide===slide.dataset.slideId?520:620;
    } else if(kind==='probability') {
      const target=getComputedStyle(element).transform;frames=springMatrix(old?.transform??'matrix(0,0,0,1,550,0)',target,undefined,520,1.25);duration=520;
    } else if(kind==='token') {
      if(reverse)continue;
      const x=Number(element.dataset.x),y=Number(element.dataset.y),size=Number(element.dataset.size);
      const sourceX=Number(element.dataset.sourceX??977),sourceY=Number(element.dataset.sourceY??77),sourceSize=Number(element.dataset.sourceSize??23);
      if(element.dataset.sourceX) {
        // Route outside the candidate rows and above the existing sentence.
        // Smooth tangent joins prevent punctuation crossing already-written words.
        const segments=sourceX>1100?[
          [[sourceX,sourceY],[sourceX,210],[sourceX,330],[sourceX,340]],
          [[sourceX,340],[sourceX,400],[Math.min(sourceX,x+120),y],[x,y]],
        ]:[
          [[sourceX,sourceY],[100,sourceY],[20,sourceY],[20,145]],
          [[20,145],[20,300],[20,340],[140,340]],
          [[140,340],[140+(x-140)/3,340],[140+2*(x-140)/3,340],[x,340]],
          [[x,340],[x+60,340],[x+60,y],[x,y]],
        ];
        const poses=segments.flatMap((points,segment)=>Array.from({length:17},(_,i)=>{
          const t=i/16,u=1-t;
          const at=(axis:number)=>u*u*u*points[0][axis]+3*u*u*t*points[1][axis]+3*u*t*t*points[2][axis]+t*t*t*points[3][axis];
          return {x:at(0),y:at(1),scale:segment<segments.length-1?sourceSize/size:sourceSize/size+(1-sourceSize/size)*t};
        }));
        let length=0;const distances=poses.map((p,i)=>{if(i)length+=Math.hypot(p.x-poses[i-1].x,p.y-poses[i-1].y);return length});
        frames=[{transform:`translate(${sourceX}px,${sourceY}px) scale(${sourceSize/size})`,offset:0},...poses.map((p,i)=>({transform:`translate(${p.x}px,${p.y}px) scale(${p.scale})`,offset:.1+.9*distances[i]/length}))];
        duration=760;
      } else frames=[{transform:`translate(${sourceX}px,${sourceY}px) scale(${sourceSize/size})`,offset:0},{transform:`translate(${sourceX}px,${sourceY}px) scale(${sourceSize/size})`,offset:.12},{transform:`translate(${x}px,${y}px) scale(1)`,offset:1}];
      wait+=180;
    } else if(kind==='roofline') {
      const target=Number(element.dataset.x);
      const matrix=old?.transform.match(/matrix\(([^)]+)\)/)?.[1].split(',').map(Number);
      const start=matrix?.[4]??target;
      const y=(x:number)=>x<=520?362-(x-65)*279/455:83;
      const xs=(start<520&&target>520)||(target<520&&start>520)?[start,520,target]:[start,target];
      frames=xs.map(x=>({transform:`translate(${x}px,${y(x)}px)`,offset:start===target?undefined:Math.abs((x-start)/(target-start))}));
      duration=700;
    } else if(kind==='route') {
      if(reverse&&!old)continue;
      const points=JSON.parse(element.dataset.points!) as number[][],end=Number(element.dataset.motionIndex),start=old?.index??0;
      const route=start<=end?points.slice(start,end+1):points.slice(end,start+1).reverse();
      if(route.length<2)continue;
      const pose=old?.transform.match(/matrix\(([^)]+)\)/)?.[1].split(',').map(Number);
      if(pose)route[0]=[pose[4],pose[5]];
      frames=route.map(([x,y])=>({transform:`translate(${x}px,${y}px)`}));
      duration=Number(element.dataset.duration??800);
    } else if(kind==='sm-panel') {
      if(reverse)continue;
      frames=[{transform:'translate(194px,188px) scale(.080645,.121053)'},{transform:'translate(636px,48px) scale(1,1)'}];
      duration=560;wait+=340;
    } else if(kind==='tile-load') {
      if(reverse)continue;
      if(source.slide!==slide?.dataset.slideId&&old?.box){frames=objectFlight();duration=600;}
      else {
      // The HBM-to-SRAM corridor ends before the operators; no tile crosses text.
      frames=element.dataset.focusTile==='true'
        ?[{transform:'translate(180px,210px) scale(.25)',opacity:1},{transform:'translate(544px,102px) scale(1)',opacity:1}]
        :[{transform:'translate(104px,188px) scale(.51,.8)',opacity:0},{transform:'translate(104px,188px) scale(.51,.8)',opacity:1,offset:.12},{transform:'translate(310px,188px) scale(.75,.9)',opacity:1,offset:.65},{transform:'translate(430px,163px) scale(1,1)',opacity:1}];
      duration=660;wait+=40;
      }
    }
    if(frames.length){const physical=['object','camera','settle'].includes(kind);if(physical)frames=springMatrix(String(frames[0].transform),String(frames[frames.length-1].transform),velocity,duration,kind==='settle'?.8:1.8);animations.push(element.animate(frames,{duration,delay:wait+Number(element.dataset.motionDelay??0),easing:physical||kind==='probability'?'linear':easing,fill:'both'}));}
  }
  return animations;
}

/** Only destination content participates. The stage background stays fully
 * painted and the outgoing page is never retained, cloned, or faded back in. */
function pageDetails(incoming: HTMLElement): Animation[] {
  const details = Array.from(incoming.querySelectorAll<HTMLElement>('[data-entry-group],[data-entry="detail"],.sia-scene [data-morph-enter],.sia-bm-status,.sia-attn-bottom'))
    .filter(element => !element.closest('.sia-scene') && !element.matches('.sia-attn-sram') && !element.closest('[data-build],[data-morph],[data-motion]') && !element.parentElement?.closest('[data-entry-group],[data-entry="detail"]'));
  return details.flatMap((element,index) => {
    const paint = getComputedStyle(element);
    if (Number(paint.opacity) === 0) return [];
    const animation = element.animate([
      { opacity: 0 },
      { opacity: paint.opacity },
    ], {duration: 360, delay: pageTiming.detail + Math.min(index,3) * pageTiming.detailStagger, easing: entranceEasing, fill:'both'});
    return [animation];
  });
}

/** Apple WWDC23 snappy text builds. Chapter titles use one coherent vertical
 * settle, rather than clipping and staggering individual words or lines. */
function textReveals(root:HTMLElement,chapterDelay=0):Animation[]{
 const animations:Animation[]=[];
 const run=(element:Element,delay:number,duration:number,y:string,scale=1)=>animations.push(element.animate([{transform:`translateY(${y}) scale(${scale})`,opacity:0},{transform:'translateY(0) scale(1)',opacity:1}],{duration,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'}));
 root.querySelectorAll('[data-reveal="heading"]').forEach((e,i)=>run(e,i*55,420,'105%'));
 root.querySelectorAll('[data-reveal="bookend"]').forEach((e,i)=>run(e,40+i*100,560,'105%'));
 root.querySelectorAll('[data-reveal="chapter-title"]').forEach(e=>{
   const duration=560;
   const frames=entryFrames(0,18,duration,1,'',1.1).map((frame,i)=>({...frame,opacity:Math.min(1,i/60*duration/180)}));
   animations.push(e.animate(frames,{duration,delay:120+chapterDelay,easing:'linear',fill:'both'}));
 });
 root.querySelectorAll('[data-reveal="hero"]').forEach(e=>run(e,40,620,'105%',.97));
 root.querySelectorAll('[data-reveal="prompt"]').forEach((e,i)=>run(e,240+i*65,400,'105%'));
 root.querySelectorAll('[data-reveal="agent"]').forEach((e,i)=>run(e,200+i*110,460,'26px'));
 root.querySelectorAll('[data-reveal="question"]').forEach((e,i)=>run(e,60+i*150,600,'105%'));
 const year=root.querySelector('.sia-year');if(year&& !root.querySelector('.sia-agent-world'))run(year,root.querySelector('.sia-door')?480:0,400,'16px');
 const doors=root.querySelectorAll('.sia-door');doors.forEach((e,i)=>animations.push(e.animate([{transform:'translateX(0)'},{transform:`translateX(${i===0?-100:100}%)`}],{duration:700,delay:120,easing:'cubic-bezier(.76,0,.24,1)',fill:'both'})));

 const dot=root.querySelector('.sia-agent-task');if(dot)animations.push(dot.animate([{transform:'translate(10px,9px)'},{transform:'translate(600px,9px)',offset:.5},{transform:'translate(1190px,9px)'}],{duration:700,delay:260,easing:'cubic-bezier(.22,0,.2,1)',fill:'both'}));
 return animations;
}

/** Apple WWDC23 10157 keyframe tracks: arrival, one lap from the first join, coast.
 * Tangent entry matches position/velocity/acceleration; one shared angular
 * timeline preserves spacing and speed through the final slow-orbit handoff. */
function agentArrival(root:HTMLElement):Animation[]{
  const flights=Array.from(root.querySelectorAll<HTMLElement>('.sia-agent-flight'));
  if(!flights.length)return [];
  const clock=root.ownerDocument.timeline.currentTime;
  const firstDelay=120,duration=210,interval=240,deceleration=1100;
  const omega=2*Math.PI/(flights.length*interval);
  const ambientOmega=2*Math.PI/12000;
  const gate=35*Math.PI/180,base=18*Math.PI/180;
  const initialPhase=gate-base-omega*(firstDelay+duration);
  const lastJoin=firstDelay+(flights.length-1)*interval+duration;
  const cruiseEnd=firstDelay+duration+flights.length*interval,total=cruiseEnd+deceleration;
  const phase=(time:number)=>{
    if(time<=cruiseEnd)return initialPhase+omega*time;
    const x=Math.min(1,(time-cruiseEnd)/deceleration);
    // Integrate smoothstep velocity. Acceleration is zero at both joins.
    return initialPhase+omega*cruiseEnd+omega*deceleration*x+(ambientOmega-omega)*deceleration*(x**3-.5*x**4)+ambientOmega*Math.max(0,time-total);
  };
  const ambientOffset=phase(total)/ambientOmega-total;
  root.querySelectorAll('.sia-orbit').forEach(orbit=>orbit.getAnimations({subtree:true}).forEach(a=>{a.startTime=typeof clock==='number'?clock-ambientOffset:clock;}));
  const times=Array.from(new Set([...Array.from({length:361},(_,i)=>i/360*total),lastJoin,cruiseEnd,total])).sort((a,b)=>a-b);
  return flights.flatMap((flight,index)=>{
    const orbit=flight.querySelector<HTMLElement>('.sia-orbit')!,style=getComputedStyle(orbit);
    const angle=parseFloat(style.getPropertyValue('--angle'))*Math.PI/180,radius=parseFloat(style.getPropertyValue('--radius'));
    const ring=orbit.animate(times.map(t=>({offset:t/total,transform:`rotate(${angle+phase(t)}rad)`})),{duration:total,easing:'linear',fill:'backwards'});
    const counter=orbit.querySelector('div')!.animate(times.map(t=>({offset:t/total,transform:`translate(-50%,-50%) rotate(${-angle-phase(t)}rad)`})),{duration:total,easing:'linear',fill:'backwards'});
    ring.startTime=clock;counter.startTime=clock;
    const delay=firstDelay+index*interval;
    const end={x:radius*Math.cos(gate),y:radius*Math.sin(gate)},tangent={x:-Math.sin(gate),y:Math.cos(gate)};
    const frames=Array.from({length:121},(_,i)=>{
      const u=i/120,orbitAngle=angle+phase(delay+duration*u);
      const h00=1-10*u**3+15*u**4-6*u**5,h10=u-6*u**3+8*u**4-3*u**5;
      const h11=-4*u**3+7*u**4-3*u**5,h21=.5*u**3-u**4+.5*u**5;
      const travel=-1000*h00+1350*h10+omega*radius*duration*h11;
      const bend=omega**2*duration**2*h21;
      const x=end.x*(1-bend)+tangent.x*travel,y=end.y*(1-bend)+tangent.y*travel;
      return{offset:u,opacity:Math.min(1,u/.08),transform:`translate(${i===120?0:x-radius*Math.cos(orbitAngle)}px,${i===120?0:y-radius*Math.sin(orbitAngle)}px)`};
    });
    const animation=flight.animate(frames,{delay,duration,easing:'linear',fill:'both'});
    animation.startTime=clock;
    const label=orbit.querySelector('span')!.animate([{opacity:0},{opacity:1}],{delay:delay+duration-90,duration:90,easing,fill:'both'});
    label.startTime=clock;
    return [ring,counter,animation,label];
  });
}

function pageLayers(incoming: HTMLElement, direction: -1 | 1, source:MorphSnapshot, build=true,chapterDelay=0): Animation[] {
  const animations:Animation[]=[];
  const slide=incoming.querySelector<HTMLElement>('.sia-slide');
  if(slide&&source.slide==='chatgpt'&&slideId(incoming)==='agents'){
    const paint=getComputedStyle(slide);
    animations.push(slide.animate([{backgroundColor:source.background,color:source.color},{backgroundColor:paint.backgroundColor,color:paint.color}],{duration:680,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'}));
  }
  if(slideId(incoming)==='agents'){
    animations.push(...agentArrival(incoming));
    const title=incoming.querySelector('.sia-agent-center');
    if(title)animations.push(title.animate([{opacity:0},{opacity:1}],{duration:320,delay:170,easing,fill:'both'}));
  }
  const move=(selector:string,x:number,y:number,duration:number,delay:number,mass=1.8,depth=false)=>{
    const element=incoming.querySelector<HTMLElement>(selector);if(!element||element.querySelector?.('[data-reveal]'))return;
    const authored=getComputedStyle(element).transform,base=authored&&authored!=='none'?authored:'';
    animations.push(element.animate(entryFrames(x,y,duration,direction,base,mass,depth),{duration,delay,easing:'linear',fill:'both'}));
  };
  move('[data-entry="title"],.sia-heading,.sia-cover-layout,.sia-closing-layout,.sia-chapter-layout h1,.sia-epoch-copy,.sia-question-layout h1,.sia-stage-reveal h1,.sia-takeaway-layout h1,.sia-references h1',0,14,500,0,.95);

  const scene=incoming.querySelector<HTMLElement>('.sia-scene');
  if(scene&&slideId(incoming)!=='hierarchy')animations.push(...drawArtwork(scene,pageTiming.diagram,{morphs:new Set(source.keys()),motions:new Set(Array.from(source.motions??[]).filter(([,p])=>(p.opacity??1)>.01).map(([id])=>id))}));
  if(scene&&slideId(incoming)==='hierarchy'){const level=scene.querySelector('[data-memory-level="0"]');if(level)animations.push(level.animate([{fill:'#e7ebef'},{fill:'#c5d8ee'}],{duration:450,fill:'both'}));}
  const supporting=incoming.querySelector<HTMLElement>('.sia-system-stack,.sia-focus-foundations,.sia-reference-list,.sia-credit-grid');
  if(supporting)animations.push(...drawArtwork(supporting,pageTiming.diagram));
  move('.sia-topline',0,6,500,0,1.1);
  const art=incoming.querySelector<HTMLElement>('.sia-chapter-art');
  // WWDC24 10145, 1:34: expand the destination plane instead of sliding it
  // across the screen. No source snapshot, root fade, or whole-page mask.
  if(art)animations.push(art.animate(Array.from({length:61},(_,i)=>{
    const remaining=i===60?0:springValue(1,0,0,i/60*.72,1.25);
    return{offset:i/60,transform:`scale(${1-.045*remaining})`,borderRadius:`${28*remaining}px`};
  }),{duration:720,easing:'linear',fill:'both'}));
  const photo=incoming.querySelector<HTMLElement>('.sia-chapter-photo');
  if(photo)animations.push(photo.animate(Array.from({length:61},(_,i)=>({offset:i/60,transform:`scale(${i===60?1:1+.055*springValue(1,0,0,i/60*1.15,2.1)})`})),{duration:1150,easing:'linear',fill:'both'}));
  return [...animations,...textReveals(incoming,chapterDelay),...pageDetails(incoming),...(build?animateBuilds(incoming,new Map(),pageTiming.diagram+90):[])];
}

export const systemTransition: TransitionDefinition = {
  name: 'sia-layered-morph',
  capture: captureMorph,
  animateStep({ current, snapshot }) {
    if (!(snapshot instanceof Map)) return [];
    const source=snapshot as MorphSnapshot;
    current.dataset.morphMode = 'step-objects';
    const title=current.querySelector<HTMLElement>('.sia-heading');
    const heading=source.title&&title&&title.textContent!==source.title?[title.animate(entryFrames(0,12,480,1,'',.95),{duration:480,easing:'linear',fill:'both'})]:[];
    return [...animateObjects(current, source, objectDuration(slideId(current), true)), ...animateBuilds(current,source),...mechanisms(current,source),...heading];
  },
  animate({ incoming, outgoing, snapshot }, direction) {
    const id = slideId(incoming);
    const source = snapshot instanceof Map ? snapshot as MorphSnapshot : captureMorph(outgoing);
    const objects = Array.from(incoming.querySelectorAll<HTMLElement>('[data-morph]'));
    const shared = objects.some(element => source.has(element.dataset.morph!))||Array.from(incoming.querySelectorAll<HTMLElement>('[data-motion]')).some(element=>(source.motions?.get(element.dataset.motionId??element.dataset.motion!)?.opacity??0)>.01);
    outgoing.style.opacity = '0';
    const exit:Animation[]=[];
    // The sole source-paint exception: the six chapter-ending pages dissolve
    // continuously for 240ms. They are invisible thereafter, including during
    // the remaining destination animation. There is no static hold or clone.
    if(direction===1&&source.slide===sectionEnds[id]){
      outgoing.dataset.sectionExit='true';
      const nodes=Array.from(outgoing.querySelectorAll<HTMLElement>(exitNodes));
      source.exitPaint?.forEach((pose,i)=>{if(nodes[i])Object.assign(nodes[i].style,pose)});
      exit.push(outgoing.animate([{opacity:1,visibility:'visible'},{opacity:0,visibility:'hidden'}],{duration:240,easing:'cubic-bezier(.4,0,1,1)',fill:'both'}));
    }
    incoming.dataset.morphMode=shared?(['chatgpt','agents'].includes(id)?'epoch':'shared-objects'):['flash-title','paged-title'].includes(id)?'chapter':['cover','closing'].includes(id)?'bookend':['chatgpt','agents'].includes(id)?'epoch':'scene';
    // Technical artwork stays anchored. Shared objects use their actual pose;
    // newly introduced geometry uses Draw On instead of a parent translation.
    // Let the old title clear before the new chapter headline starts. The
    // destination photograph can already emerge underneath the dissolve.
    const entrance=[...exit,...pageLayers(incoming,direction,source,!shared,exit.length?120:0)];
    if(shared)return [...entrance,...animateObjects(incoming,source,objectDuration(id),0),...animateBuilds(incoming,source,pageTiming.diagram+70),...mechanisms(incoming,source,0)];
    return [...entrance,...mechanisms(incoming,source,pageTiming.diagram)];
  },
};
