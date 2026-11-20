(() => {
  'use strict';
  const VARIANTS = [{"id":"tree-sage","kind":"tree","frames":[{"anchor":[191,491],"size":[384,512],"bytes":2798},{"anchor":[196,490],"size":[384,512],"bytes":4866},{"anchor":[192,490],"size":[384,512],"bytes":9850},{"anchor":[187,490],"size":[384,512],"bytes":14412},{"anchor":[191,468],"size":[384,512],"bytes":27560},{"anchor":[186,472],"size":[384,512],"bytes":58090},{"anchor":[182,474],"size":[384,512],"bytes":60736},{"anchor":[184,473],"size":[384,512],"bytes":39484}]},{"id":"flower-cosmos","kind":"flower","frames":[{"anchor":[192,459],"size":[384,512],"bytes":11622},{"anchor":[191,459],"size":[384,512],"bytes":16396},{"anchor":[192,459],"size":[384,512],"bytes":23938},{"anchor":[191,460],"size":[384,512],"bytes":31822},{"anchor":[192,459],"size":[384,512],"bytes":44446},{"anchor":[192,460],"size":[384,512],"bytes":56724},{"anchor":[192,459],"size":[384,512],"bytes":59556},{"anchor":[190,460],"size":[384,512],"bytes":50620}]},{"id":"tree-willow","kind":"tree","frames":[{"anchor":[190,496],"size":[384,512],"bytes":1890},{"anchor":[193,495],"size":[384,512],"bytes":3670},{"anchor":[192,495],"size":[384,512],"bytes":8034},{"anchor":[195,495],"size":[384,512],"bytes":13964},{"anchor":[190,465],"size":[384,512],"bytes":30902},{"anchor":[190,466],"size":[384,512],"bytes":73566},{"anchor":[188,465],"size":[384,512],"bytes":82336},{"anchor":[188,466],"size":[384,512],"bytes":42826}]},{"id":"flower-ivory","kind":"flower","frames":[{"anchor":[191,477],"size":[384,512],"bytes":3122},{"anchor":[193,475],"size":[384,512],"bytes":6532},{"anchor":[192,476],"size":[384,512],"bytes":9426},{"anchor":[191,475],"size":[384,512],"bytes":14160},{"anchor":[194,477],"size":[384,512],"bytes":26364},{"anchor":[193,476],"size":[384,512],"bytes":39232},{"anchor":[194,477],"size":[384,512],"bytes":41480},{"anchor":[191,473],"size":[384,512],"bytes":30180}]}];
  const connection = () => navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const ease = t => t*t*(3-2*t);
  function policy(preference,info,motion,data,online=true) {
    if(motion)return {enabled:false,blocked:true,reason:'Reduced motion is enabled'};
    if(data || info?.saveData)return {enabled:false,blocked:true,reason:'Data saving is enabled'};
    if(!online)return {enabled:false,blocked:true,reason:'Offline: using the light garden'};
    const slow=info && (/^(slow-2g|2g|3g)$/.test(info.effectiveType||'') ||
      (Number.isFinite(info.downlink)&&info.downlink<3) || (Number.isFinite(info.rtt)&&info.rtt>350));
    if(slow)return {enabled:false,blocked:true,reason:'Using the light garden on this connection'};
    if(preference==='off')return {enabled:false,blocked:false,reason:'Watercolor garden is off'};
    const fast=info?.effectiveType==='4g' && info.downlink>=5 && (!info.rtt || info.rtt<=200);
    return {enabled:preference==='on'||!!fast,blocked:false,
      reason:fast?'Fast connection': 'Connection quality is unknown; enable watercolor to load the artwork'};
  }
  function create({canvas,ctx,reduced,assetBase}) {
    const data=matchMedia('(prefers-reduced-data: reduce)');
    let preference='auto';try{preference=localStorage.getItem('watercolor-garden')||'auto';}catch{}
    let status,clock=0,peak=null,nextRenewal=Infinity,active=!document.hidden;
    const states=new WeakMap(),cache=new Map(),queue=[];
    let running=0,failed=false;
    const button=document.createElement('button');button.type='button';button.className='garden-preference';
    Object.assign(button.style,{position:'fixed',right:'14px',bottom:'10px',zIndex:'12',
      font:'12px Georgia,serif',color:'#888',background:'rgba(255,255,255,.86)',border:'0',
      padding:'5px 7px',textDecoration:'underline',textUnderlineOffset:'3px',cursor:'pointer'});
    button.hidden=true;
    document.body.append(button);
    function refresh(){
      const previous=status?.enabled;
      status=policy(preference,connection(),reduced.matches,data.matches,navigator.onLine!==false);
      if(failed){status={enabled:false,blocked:false,reason:'Artwork unavailable; using the light garden'};}
      button.textContent='Watercolor garden: '+(status.enabled?'on':'off');
      button.setAttribute('aria-pressed',String(status.enabled));button.title=status.reason;
      button.disabled=status.blocked;button.style.cursor=status.blocked?'default':'pointer';
      canvas.dataset.gardenMode=status.enabled?'watercolor':'light';canvas.dataset.gardenReason=status.reason;
      if(previous&&!status.enabled){
        queue.splice(0);for(const [key,item] of cache)if(item.status!=='ready'){item.controller?.abort();cache.delete(key);}
      }
      if(status.enabled)pump();
    }
    button.addEventListener('click',()=>{
      if(status.blocked)return;
      preference=status.enabled?'off':'on';failed=false;
      try{localStorage.setItem('watercolor-garden',preference);}catch{}refresh();
    });
    connection()?.addEventListener?.('change',refresh);data.addEventListener?.('change',refresh);
    reduced.addEventListener?.('change',refresh);addEventListener('online',refresh);addEventListener('offline',refresh);
    document.addEventListener('visibilitychange',()=>{active=!document.hidden;if(active)pump();});
    function decode(blob){
      if(typeof createImageBitmap==='function')return createImageBitmap(blob);
      return new Promise((resolve,reject)=>{
        const image=new Image(),url=URL.createObjectURL(blob);
        image.onload=()=>{URL.revokeObjectURL(url);resolve(image);};
        image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Image decode failed'));};image.src=url;
      });
    }
    function pump(){
      if(!status?.enabled||!active)return;
      while(running<2&&queue.length){
        const key=queue.shift(),item=cache.get(key);if(!item||item.status!=='queued')continue;
        item.status='loading';item.controller=new AbortController();running++;
        fetch(new URL(key+'.webp',assetBase),{cache:'force-cache',signal:item.controller.signal})
          .then(r=>{if(!r.ok)throw new Error('Missing garden frame');return r.blob();})
          .then(decode).then(image=>{
            if(cache.get(key)!==item){image.close?.();return;}
            item.image=image;item.status='ready';item.used=clock;
          }).catch(error=>{
            if(error.name!=='AbortError'){item.status='error';failed=true;refresh();}
          }).finally(()=>{running--;pump();});
      }
    }
    function frame(variant,index){
      const key=variant.id+'/'+index;let item=cache.get(key);
      if(!item){
        if(cache.size>=16){
          const evict=[...cache].filter(([,entry])=>entry.status==='ready'&&clock-entry.used>0.15)
            .sort((a,b)=>a[1].used-b[1].used)[0];
          if(!evict)return null;evict[1].image.close?.();cache.delete(evict[0]);
        }
        item={status:'queued',used:clock};cache.set(key,item);queue.push(key);pump();
      }
      item.used=clock;return item.status==='ready'?item.image:null;
    }
    function select(patch,space,rootY=0){
      const tree=(patch.lane<0.18||patch.lane>0.82)&&space>120&&
        (patch.biome==='grove'||Math.random()<0.28);
      const choices=VARIANTS.filter(v=>v.kind===(tree?'tree':'flower'));
      const variant=choices[Math.floor(Math.random()*choices.length)];
      const state={variant,position:0,target:clamp(patch.seedCount,1,3),blend:0,
        duration:8+Math.random()*6,flip:Math.random()<0.35?-1:1,born:clock,
        retiring:false,empty:false,queuedSeeds:0,fade:1,rootY};
      states.set(patch,state);return state;
    }
    function nourish(patch){
      if(!status.enabled)return;
      const s=states.get(patch);if(!s)return;
      if(s.retiring){s.queuedSeeds=Math.min(3,s.queuedSeeds+1);return;}
      if(s.empty){const next=select(patch,s.space,s.rootY);next.target=1;next.suppressFallback=true;return;}
      s.target=Math.min(6,s.target+1+(Math.random()<0.35?1:0));
    }
    function tick(dt,patches,capacity,now){
      clock=now;
      if(!status.enabled)return;
      for(const p of patches){
        const s=states.get(p);if(!s||s.empty)continue;
        const i=Math.floor(s.position),next=Math.min(s.target,i+1);
        const current=frame(s.variant,i),following=next===i?current:frame(s.variant,next);
        if(current&&following){
          s.blend=Math.min(1,s.blend+dt/5);
          s.position=Math.min(s.target,i+1,s.position+dt/s.duration);
          // Only one adjacent transition is requested; later target stages stay queued.
        }
        if(s.retiring&&s.position>=7){
          if(s.finished===undefined)s.finished=clock;
          s.fade=1-clamp((clock-s.finished-8)/14,0,1);
          if(s.fade===0){
            s.empty=true;s.retiring=false;
            if(s.queuedSeeds){const n=select(p,s.space,s.rootY);n.target=clamp(s.queuedSeeds,1,3);n.suppressFallback=true;}
          }
        }
      }
      const entries=patches.map(p=>({p,s:states.get(p)}));
      if(peak===null&&capacity&&entries.every(({s})=>s&&!s.empty&&s.position>=6)){
        peak=clock;nextRenewal=clock+45+Math.random()*35;
      }
      const living=entries.filter(({s})=>s&&!s.empty),dying=living.some(({s})=>s.retiring);
      const growing=living.filter(({s})=>s.position<6&&!s.retiring).length;
      if(peak!==null&&!dying&&clock>=nextRenewal&&growing<=1){
        const older=living.filter(({s})=>s.position>=6&&!s.retiring).sort((a,b)=>a.s.born-b.s.born)[0];
        if(older&&living.length>1){older.s.retiring=true;older.s.target=7;nextRenewal=clock+60+Math.random()*45;}
      }
      canvas.dataset.worldPhase=peak===null?'building':dying||growing||entries.some(({s})=>s?.empty)?'renewing':'settled';
      canvas.dataset.renewing=entries.filter(({s})=>s?.retiring).length;
      canvas.dataset.sequencePlants=entries.map(({s})=>s?s.variant.id+':'+s.position.toFixed(2)+(s.empty?':empty':''):'waiting').join(',');
      canvas.dataset.frameCache=cache.size;
      // Keep the working set bounded. Recently drawn/current frames are retained.
      if(cache.size>16){
        for(const [key,item]of [...cache].sort((a,b)=>a[1].used-b[1].used)){
          if(cache.size<=16)break;
          if(item.status==='ready'&&clock-item.used>2){item.image.close?.();cache.delete(key);}
        }
      }
    }
    function draw(patch,{height,groundY,opacity}){
      if(!status.enabled)return 0;
      const s=states.get(patch)||select(patch,height,groundY);s.space=height;
      if(s.empty)return 1;
      const i=Math.floor(s.position),j=Math.min(7,i+1),t=ease(s.position-i);
      const a=frame(s.variant,i),b=t>0?frame(s.variant,j):null;
      if(!a||(t>0&&!b))return 0;
      const H=s.variant.kind==='tree'?height:Math.min(height,115);
      const scale=H/470;
      ctx.save();ctx.scale(s.flip,1);
      for(const [image,index,weight]of [[a,i,1-t],[b,j,t]])if(image&&weight>0){
        const info=s.variant.frames[index];ctx.globalAlpha=opacity*0.58*s.blend*s.fade*weight;
        ctx.drawImage(image,-info.anchor[0]*scale,s.rootY-info.anchor[1]*scale,384*scale,512*scale);
      }
      ctx.restore();return s.suppressFallback?1:s.blend;
    }
    refresh();
    return {get enabled(){return status.enabled;},draw,tick,nourish,
      handlesMaturity:()=>status.enabled,policy:()=>({...status})};
  }
  globalThis.WatercolorSequences={create,policy,variants:VARIANTS};
})();
