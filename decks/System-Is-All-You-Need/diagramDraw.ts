/** WWDC25 337, 2:19: Draw On / Whole Symbol. Keep geometry anchored;
 * trace existing contours together, then resolve ink and readable labels.
 * This is an SVG/HTML adaptation, not the native SF Symbols renderer. */
export function drawArtwork(root:HTMLElement,delay=70,protectedObjects={motions:new Set<string>(),morphs:new Set<string>()}):Animation[]{
  const animations:Animation[]=[];
  if(!root.querySelectorAll)return animations;
  root.dataset.artworkMotion='draw-on';
  const managed=(element:Element)=>{
    for(let p:Element|null=element;p&&p!==root;p=p.parentElement){
      const d=(p as HTMLElement).dataset;
      if(d.build!==undefined)return true;
      if(d.morph&&protectedObjects.morphs.has(d.morph))return true;
      if(d.motion){
        if(protectedObjects.motions.has(d.motionId??d.motion))return true;
        if(['token','route','settle','roofline'].includes(d.motion)||d.from)return true;
      }
    }
    return false;
  };
  for(const element of root.querySelectorAll<HTMLElement>('path,line,polyline,polygon,rect,circle,ellipse,text,[data-morph],.sia-stack-layer,.sia-focus-foundations>div,.sia-reference-list>a,.sia-credit-grid>a')){
    if(managed(element))continue;
    const paint=getComputedStyle(element);
    if(Number(paint.opacity)===0||paint.display==='none'||paint.visibility==='hidden')continue;
    const run=(kind:string,frames:Keyframe[],duration:number,wait:number)=>{
      element.dataset.entryInk=kind;
      animations.push(element.animate(frames,{duration,delay:delay+wait,easing:'cubic-bezier(.22,0,.2,1)',fill:'both'}));
    };
    if(element.tagName.toLowerCase()==='text'){
      run('label',[{opacity:0},{opacity:paint.opacity}],160,180);
    }else if(typeof SVGGeometryElement!=='undefined'&&element instanceof SVGGeometryElement){
      const stroked=paint.stroke!=='none'&&Number(paint.strokeOpacity)>0;
      const box=element.getBBox();
      // A filled matrix cell has no authored contour. Trace it in its own ink
      // before resolving the fill; omit this treatment on tiny chip textures.
      const traceFill=!stroked&&element.tagName.toLowerCase()==='rect'&&paint.fill!=='none'&&box.width>=30&&box.height>=24;
      if((stroked||traceFill)&&paint.strokeDasharray==='none'){
        const length=element.getTotalLength()+1;
        if(Number.isFinite(length)&&length>1){
          const ink=traceFill?{stroke:paint.fill,strokeWidth:'1.2px',strokeOpacity:1}:{};
          const frames:Keyframe[]=[{...ink,strokeDasharray:`${length} ${length}`,strokeDashoffset:length}];
          if(traceFill)frames.push({...ink,strokeDasharray:`${length} ${length}`,strokeDashoffset:0,offset:.7});
          frames.push({...ink,...(traceFill?{strokeOpacity:0}:{}),strokeDasharray:`${length} ${length}`,strokeDashoffset:0});
          run('stroke',frames,420,0);
        }
      }
      if(paint.fill!=='none'&&Number(paint.fillOpacity)>0){
        run(stroked||traceFill?'stroke-fill':'fill',stroked||traceFill?[{fillOpacity:0},{fillOpacity:paint.fillOpacity}]:[{opacity:0},{opacity:paint.opacity}],200,110);
      }
    }else if(element instanceof HTMLElement){
      // Timelines have HTML planes. Trace their extent without translating or
      // scaling the bar, and without stretching its labels.
      run('plane',[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],360,20);
    }
  }
  return animations;
}
