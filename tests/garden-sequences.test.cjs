const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../garden-sequences.js'),'utf8');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function setup({info,preference='auto',motion=false,data=false,fail=false,decodeFail=false}={}){
 const events={},requests=[],draws=[],buttons=[];let stored=preference,randomState=31;
 const math=Object.create(Math);math.random=()=>((randomState=(randomState*1664525+1013904223)>>>0)/4294967296);
 const doc={hidden:false,body:{append:b=>buttons.push(b)},addEventListener:(name,f)=>events[name]=f,
  createElement:()=>({style:{},setAttribute(){},addEventListener(name,f){this[name]=f;}})};
 const ctx={save(){},restore(){},scale(){},drawImage(...a){draws.push(a);}};
 const canvas={dataset:{}};
 const env={Math:math,URL,AbortController,Map,WeakMap,Promise,navigator:{connection:info,onLine:true},
  localStorage:{getItem:()=>stored,setItem:(_,value)=>stored=value},document:doc,
  matchMedia:()=>({matches:data,addEventListener(){}}),addEventListener:(name,f)=>events[name]=f,
  fetch:async(url)=>{requests.push(String(url));if(fail)throw Error('broken asset');return {ok:true,blob:async()=>({id:String(url)})};},
  createImageBitmap:async(blob)=>{if(decodeFail)throw Error('Unsupported image format');return {id:blob.id,close(){}};}};
 vm.createContext(env);vm.runInContext(source,env);
 const api=env.WatercolorSequences,renderer=api.create({canvas,ctx,reduced:{matches:motion,addEventListener(){}},assetBase:new URL('https://example.test/assets/garden-sequences/')});
 return {api,renderer,canvas,requests,draws,buttons,events,doc};
}
const fast={effectiveType:'4g',downlink:10,rtt:50,addEventListener(){}};
const patch=(lane=0.1)=>({lane,biome:lane===0.5?'flowers':'grove',seedCount:1});
const paint=(app,p)=>app.renderer.draw(p,{height:300,groundY:-3,opacity:1});
test('unknown connection makes no asset requests; opt-in loads only adjacent frames',async()=>{
 const app=setup(),p=patch();paint(app,p);app.renderer.tick(1,[p],true,1);assert.equal(app.requests.length,0);
 app.buttons[0].click();assert(app.renderer.enabled);paint(app,p);app.renderer.tick(1,[p],true,2);await flush();await flush();
 assert.equal(app.requests.length,2);assert(app.requests.every(url=>/\/[01]\.webp$/.test(url)));
 for(let i=3;i<40;i++){app.renderer.tick(1,[p],true,i);paint(app,p);await flush();}
 assert.equal(app.requests.length,2,'a single seed stops at the shoot');assert.match(app.canvas.dataset.sequencePlants,/:1\.00/);
 app.renderer.draw(p,{height:300,groundY:-20,opacity:1});
 for(const [image,x,y,w,h]of app.draws){
  const m=image.id.match(/([^/]+)\/(\d)\.webp$/),variant=app.api.variants.find(v=>v.id===m[1]),frame=variant.frames[+m[2]];
  assert(Math.abs(x+frame.anchor[0]*w/384)<1e-8);assert(Math.abs(y+frame.anchor[1]*h/512+3)<1e-8,'root remains fixed');
 }
});
test('slow, saving-data, offline-style policy and reduced motion override explicit opt-in',()=>{
 for(const options of [{info:{effectiveType:'3g',downlink:1},preference:'on'},{info:{...fast,saveData:true},preference:'on'},
  {info:fast,motion:true,preference:'on'},{info:fast,data:true,preference:'on'}]){
  const app=setup(options);paint(app,patch());assert(!app.renderer.enabled);assert.equal(app.requests.length,0);assert(app.buttons[0].disabled);
 }
 const app=setup({info:fast,preference:'off'});assert(!app.renderer.enabled);assert.equal(app.requests.length,0);
 assert(!app.api.policy('on',fast,false,false,false).enabled);
});
test('seeds advance a bounded target; a mature world selectively declines and renews',async()=>{
 const app=setup({info:fast}),patches=[patch(),patch(0.5)];patches.forEach(p=>paint(app,p));
 for(let i=0;i<12;i++)patches.forEach(p=>app.renderer.nourish(p));
 let decline=false,renewal=false,peak=false;
 for(let time=1;time<=1400;time++){
  if(time%22===0)patches.forEach(p=>app.renderer.nourish(p));
  app.renderer.tick(1,patches,true,time);patches.forEach(p=>paint(app,p));await flush();
  assert(+app.canvas.dataset.renewing<=1);assert(+app.canvas.dataset.frameCache<=16);
  const positions=[...app.canvas.dataset.sequencePlants.matchAll(/:([\d.]+)/g)].map(m=>+m[1]);assert(positions.every(n=>n<=7));
  if(positions.some(n=>n>6))decline=true;if(app.canvas.dataset.worldPhase==='settled')peak=true;
  if(decline&&positions.some(n=>n<1))renewal=true;
 }
 assert(decline);assert(peak);assert(renewal);assert.equal(patches.length,2);
});
test('request or image-decode failure falls back without an uncaught rejection',async()=>{
 for(const failure of [{fail:true},{decodeFail:true}]){const app=setup({info:fast,...failure});paint(app,patch());await flush();await flush();
 assert(!app.renderer.enabled);assert.match(app.canvas.dataset.gardenReason,/unavailable/);}
});
test('off and hidden states stop starting queued requests',async()=>{
 const app=setup({info:fast}),p=patch();app.doc.hidden=true;app.events.visibilitychange();paint(app,p);assert.equal(app.requests.length,0);
 app.buttons[0].click();assert(!app.renderer.enabled);app.doc.hidden=false;app.events.visibilitychange();await flush();assert.equal(app.requests.length,0);
});

test('a connection becoming data-saving disables further artwork requests',async()=>{
 let changed;const info={effectiveType:'4g',downlink:10,rtt:50,addEventListener(name,fn){changed=fn;}};
 const app=setup({info}),p=patch();paint(app,p);await flush();info.saveData=true;changed();
 const before=app.requests.length;app.renderer.nourish(p);app.renderer.tick(100,[p],true,100);paint(app,p);await flush();
 assert(!app.renderer.enabled);assert.equal(app.requests.length,before);assert(app.buttons[0].disabled);
});
