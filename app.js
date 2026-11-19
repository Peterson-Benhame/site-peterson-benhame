(() => {
  const media=window.PB_CINEMA || {};
  const poster=document.querySelector('#cinema-poster');
  const art=document.querySelector('.hero-art');
  const illustration=art?.querySelector('.structure');
  if(media.media?.['hero-poster'] && poster){
    poster.addEventListener('load',()=>{poster.hidden=false;illustration?.setAttribute('hidden','');});
    poster.src=media.media['hero-poster'];
  }
  const hero=document.querySelector('.hero');
  const canvas=document.querySelector('#cinema-canvas');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const desktop=matchMedia('(min-width: 901px)');
  const frames=media.frames;
  if(!hero || !canvas || !Array.isArray(frames) || !frames.length)return;
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  const beats=document.querySelector('.cinema-beats');
  const cache=new Map(),inflight=new Set();
  let enabled=false,target=0,raf=0,generation=0;
  function paint(image){
    const width=canvas.clientWidth,height=canvas.clientHeight;
    if(!width || !height)return;
    const dpr=Math.min(devicePixelRatio || 1,2);
    canvas.width=width*dpr;canvas.height=height*dpr;
    const scale=Math.max(canvas.width/image.naturalWidth,canvas.height/image.naturalHeight);
    const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,(canvas.width-w)*.8,(canvas.height-h)/2,w,h);
  }
  function load(index){
    if(!enabled || index<0 || index>=frames.length || cache.has(index) || inflight.has(index) || inflight.size>=4)return;
    const version=generation;
    inflight.add(index);
    const image=new Image();
    image.onload=()=>{
      if(version!==generation)return;
      inflight.delete(index);cache.set(index,image);
      while(cache.size>18){const farthest=[...cache.keys()].sort((a,b)=>Math.abs(b-target)-Math.abs(a-target))[0];cache.delete(farthest);}
      if(index===target){canvas.hidden=false;paint(image);}
      if(!cache.has(target))load(target);
    };
    image.onerror=()=>{if(version===generation){inflight.delete(index);if(index===target)canvas.hidden=true;}};
    image.src=frames[index];
  }
  function update(){
    raf=0;if(!enabled)return;
    const rect=hero.getBoundingClientRect();
    if(rect.bottom<0 || rect.top>innerHeight)return;
    const progress=Math.max(0,Math.min(1,-rect.top/(hero.offsetHeight-innerHeight)));
    target=Math.round(progress*(frames.length-1));
    if(cache.has(target)){canvas.hidden=false;paint(cache.get(target));}else load(target);
    load(target+1);load(target-1);
    [...beats.children].forEach((el,i)=>el.classList.toggle('active',i===Math.min(2,Math.floor(progress*3))));
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(update);}
  function mode(){
    enabled=desktop.matches&&!reduced.matches&&!navigator.connection?.saveData;
    generation++;cache.clear();inflight.clear();canvas.hidden=true;
    hero.classList.toggle('cinema-enabled',enabled);beats.hidden=!enabled;
    if(enabled)schedule();
  }
  reduced.addEventListener('change',mode);desktop.addEventListener('change',mode);
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});mode();
})();
