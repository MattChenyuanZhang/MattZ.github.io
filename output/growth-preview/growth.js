(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'dandelion-background';
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '1'
  });
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }
  // Watercolor leaves and bark load once; all growth geometry stays procedural.
  const watercolor = {};
  const atlasBounds = {"trunks": [[54, 17, 458, 495], [512, 25, 512, 450], [1024, 37, 484, 475], [40, 512, 472, 489], [512, 530, 481, 447], [1061, 512, 456, 484]], "twigs": [[65, 21, 447, 486], [512, 127, 496, 385], [1056, 19, 465, 472], [37, 597, 475, 378], [512, 512, 438, 483], [1045, 570, 454, 394]], "leaves": [[86, 15, 293, 326], [418, 19, 344, 321], [815, 39, 308, 302], [1214, 38, 292, 288], [85, 341, 183, 277], [400, 376, 297, 292], [812, 341, 297, 326], [1208, 383, 261, 283], [41, 743, 328, 218], [440, 707, 270, 284], [822, 687, 297, 303], [1205, 719, 289, 278]]};
  // The light garden deliberately does not fetch watercolor image atlases.
  const sequenceGarden=typeof WatercolorSequences==='object'?WatercolorSequences.create({
    canvas,ctx,reduced,assetBase:new URL(
      document.currentScript.src.includes('/output/')?'../../assets/garden-sequences/':'assets/garden-sequences/',
      document.currentScript.src)
  }):null;
  const barkTextures = new Map();
  function curvePoint(curve,t) {
    const u=1-t;
    return {x:u*u*u*curve[0].x+3*u*u*t*curve[1].x+3*u*t*t*curve[2].x+t*t*t*curve[3].x,
      y:u*u*u*curve[0].y+3*u*u*t*curve[1].y+3*u*t*t*curve[2].y+t*t*t*curve[3].y};
  }
  function treeBlueprint(e) {
    if(e.treeBlueprint)return e.treeBlueprint;
    const form=e.trunkShape;
    const trunk=[{x:0,y:0},{x:form.lowerX,y:-form.lowerY},
      {x:form.upperX,y:-form.upperY},{x:form.tipX,y:-0.92}];
    const branches=e.branches.map((b,j)=>{
      const root=curvePoint(trunk,b.at),tip={x:root.x+b.direction*b.spread*1.3,y:root.y-b.lift};
      const curve=[root,{x:root.x+b.direction*0.07,y:root.y-0.1},
        {x:tip.x-b.direction*0.1,y:tip.y+0.025},tip];
      return {curve,at:b.at,start:0.24+b.at*0.27+(j%3)*0.025,
        unlock:j<Math.ceil(e.branches.length*0.7)?1:2+j%3,
        twigs:b.twigs.map((twig,k)=>{
          const origin=curvePoint(curve,twig.along);
          const end={x:origin.x+b.direction*twig.reach,y:origin.y-twig.reach*(k%2?0.35:1.3)};
          return {at:twig.along,curve:[origin,{x:origin.x+b.direction*twig.reach*0.2,y:origin.y-twig.reach*0.7},
            {x:end.x-b.direction*0.007,y:end.y+0.007},end],
            leaves:Array.from({length:4},(_,i)=>({at:(i+1)/4,
              angle:(b.direction>0?-0.7:-2.5)+(i%2?-0.6:0.5)+twig.angle*0.4,
              size:0.025+twig.size*0.02,atlas:(j*7+k*3+i+e.artVariant)%12}))};
        })};
    });
    const extent=Math.max(1,...branches.flatMap(b=>b.twigs.map(t=>-t.curve[3].y+0.09)));
    return e.treeBlueprint={trunk,branches,extent,
      bark:Array.from({length:18},(_,i)=>({at:0.04+i*0.047,offset:Math.sin(i*8.31+e.phase),length:0.012+(i%4)*0.004})),
      knots:[0.24+(e.phase%1)*0.15,0.52+(e.size%0.2)]};
  }
  function barkTexture(variant) {
    if(barkTextures.has(variant))return barkTextures.get(variant);
    const image=watercolor.trunks;
    if(!image?.complete||!image.naturalWidth)return null;
    const tile=document.createElement('canvas');tile.width=64;tile.height=128;
    const brush=tile.getContext('2d');if(!brush)return null;
    const roots=[[185,465],[700,470],[1210,450],[180,995],[680,970],[1160,990]],root=roots[variant];
    brush.drawImage(image,root[0]-12,root[1]-85,24,65,0,0,64,128);
    barkTextures.set(variant,tile);return tile;
  }
  function treeLeaf(position,angle,size,unfold,atlas,opacity) {
    if(unfold<=0)return;
    ctx.save();ctx.globalAlpha=opacity*unfold;
    const image=watercolor.leaves;
    if(image?.complete&&image.naturalWidth) {
      const box=atlasBounds.leaves[atlas];
      ctx.translate(position.x,position.y);ctx.rotate(angle+Math.PI/4+(1-unfold)*0.35);
      ctx.scale(0.15+unfold*0.85,unfold);
      ctx.drawImage(image,...box,-size*0.06,-size*0.94,size,size*box[3]/box[2]);
    } else {ctx.fillStyle='#c4d5b9';leaf(position.x,position.y,angle,size*unfold);}
    ctx.restore();
  }
  function drawGrowingTree(e,patch,availableHeight,opacity) {
    const plan=treeBlueprint(e),age=Math.max(0,patch.age-e.birth),q=age/e.duration;
    const H=availableHeight/plan.extent;
    const woody=smooth(0.18,0.62,q),aged=smooth(0.76,1,q);
    const trunkEnd=0.035*smooth(0,0.065,q)+0.965*smooth(0.055,0.64,q);
    const girth=0.3+H*e.trunkShape.width*smooth(0.17,1,q);
    const texture=aged>0.01?barkTexture(e.artVariant):null;
    ctx.save();ctx.scale(patch.lane<0.5?1:-1,1);
    // Only the reached prefix is drawn. Existing geometry never rescales as it ages.
    function wood(curve,end,baseWidth,tipWidth,woodiness) {
      if(end<=0)return;
      const sides=[[],[]];let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
      for(let i=0;i<=20;i++) {
        const t=end*i/20,p=curvePoint(curve,t),a=curvePoint(curve,Math.max(0,t-0.002)),b=curvePoint(curve,Math.min(1,t+0.002));
        const dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy)||1,w=tipWidth+(baseWidth-tipWidth)*Math.pow(1-t,1.3);
        for(let side=0;side<2;side++) {
          const sign=side?1:-1,x=p.x*H+sign*dy/n*w,y=p.y*H-sign*dx/n*w;
          sides[side].push({x,y});minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
        }
      }
      ctx.beginPath();ctx.moveTo(sides[0][0].x,sides[0][0].y);
      for(const p of [...sides[0].slice(1),...sides[1].reverse()])ctx.lineTo(p.x,p.y);
      ctx.closePath();ctx.globalAlpha=opacity*0.48;
      ctx.fillStyle=`rgb(${Math.round(183+woodiness*3)},${Math.round(203-woodiness*21)},${Math.round(176-woodiness*22)})`;ctx.fill();
      if(texture&&aged>0) {
        ctx.save();ctx.clip();ctx.globalAlpha=opacity*aged*0.3;
        ctx.drawImage(texture,minX,minY,Math.max(1,maxX-minX),Math.max(1,maxY-minY));ctx.restore();
      }
      ctx.globalAlpha=opacity*woodiness*0.16;ctx.strokeStyle='#aaa58a';ctx.lineWidth=0.4;
      ctx.beginPath();const root=curvePoint(curve,0);ctx.moveTo(root.x*H,root.y*H);
      for(let i=1;i<=14;i++){const p=curvePoint(curve,end*i/14);ctx.lineTo(p.x*H+0.35,p.y*H);}ctx.stroke();
    }
    wood(plan.trunk,trunkEnd,girth,0.22,woody);
    const cotyledonFade=1-smooth(0.3,0.65,q),cotyledonAt=Math.min(trunkEnd,0.035);
    const cotyledon=curvePoint(plan.trunk,cotyledonAt);
    for(let i=0;i<2;i++)treeLeaf({x:cotyledon.x*H,y:cotyledon.y*H},i?-2.7:-0.5,
      Math.min(9,H*0.045),smooth(0.025+i*0.012,0.09+i*0.015,q),i+e.artVariant,
      opacity*0.55*cotyledonFade);
    // Small leaves open along the seedling before woody branches emerge.
    for(let i=0;i<4;i++) {
      const at=0.09+i*0.055,p=curvePoint(plan.trunk,at);
      treeLeaf({x:p.x*H,y:p.y*H},i%2?-2.6:-0.7,H*0.045,
        smooth(at+0.045,at+0.12,q)*smooth(at,at+0.035,trunkEnd),
        (e.artVariant+i+3)%12,opacity*0.52*(1-smooth(0.6,0.9,q)));
    }
    for(const branch of plan.branches) {
      const arrival=branch.unlock===1?{at:e.birth}:e.treeArrivals.find(a=>a.count>=branch.unlock);
      if(!arrival)continue;
      const start=Math.max(branch.start,(arrival.at-e.birth)/e.duration+(branch.unlock===1?0:0.04));
      const bg=smooth(start,start+0.22,q)*smooth(branch.at,branch.at+0.025,trunkEnd);
      wood(branch.curve,bg,Math.max(0.3,girth*0.46),0.13,woody);
      for(const twig of branch.twigs) {
        const tg=smooth(start+0.07+twig.at*0.1,start+0.23+twig.at*0.1,q)*smooth(twig.at,twig.at+0.035,bg);
        wood(twig.curve,tg,Math.max(0.22,girth*0.14),0.08,woody*0.7);
        for(const l of twig.leaves) {
          const unfold=smooth(start+0.12+twig.at*0.1+l.at*0.09,start+0.26+twig.at*0.1+l.at*0.09,q)*smooth(l.at-0.06,l.at,tg);
          const p=curvePoint(twig.curve,l.at);
          treeLeaf({x:p.x*H,y:p.y*H},l.angle,l.size*H,unfold,l.atlas,opacity*0.6);
        }
      }
    }
    if(aged>0) {
      ctx.globalAlpha=opacity*aged*0.22;ctx.strokeStyle='#a9a58b';ctx.lineWidth=0.45;
      for(const mark of plan.bark) {
        const a=curvePoint(plan.trunk,mark.at),b=curvePoint(plan.trunk,mark.at+mark.length);
        ctx.beginPath();ctx.moveTo(a.x*H+mark.offset*girth*0.45,a.y*H);
        ctx.quadraticCurveTo((a.x+b.x)*H/2+mark.offset*girth*0.6,(a.y+b.y)*H/2,b.x*H+mark.offset*girth*0.4,b.y*H);ctx.stroke();
      }
      for(const at of plan.knots) {
        const p=curvePoint(plan.trunk,at);ctx.beginPath();ctx.ellipse(p.x*H,p.y*H,girth*0.22,girth*0.42,-0.2,0,Math.PI*2);ctx.stroke();
      }
      for(let i=0;i<3;i++) {
        ctx.lineWidth=0.4+girth*0.25;ctx.beginPath();ctx.moveTo(0,0);
        ctx.quadraticCurveTo((i-1)*girth*1.1,-2,(i-1)*girth*2.4,2);ctx.stroke();
      }
    }
    ctx.restore();
  }
  function elementMature(p,e) {return p.age>=Math.max(e.birth+e.duration*(e.kind==='tree'?1.25:1)+13,e.treeReadyAt||0);}
  let width = 0, height = 0, pointer = null, last = 0, frame;
  let readingBounds = [];
  function measureReading() {
    readingBounds = [...document.querySelectorAll(
      ".intro p, .text p, main p, main h1, main h2, main li, .navigation"
    )].map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.top < innerHeight && r.bottom > 0);
  }
  const random = (min, max) => min + Math.random() * (max - min);
  function restart(seed, initial = false) {
    Object.assign(seed, {
      lane: Math.random(), phase: initial ? Math.random() : 0,
      clock: random(0, Math.PI * 2), speed: random(0.010, 0.027),
      size: random(0.65, 1.2), sway: random(12, 58),
      frequency: random(0.16, 0.48), offset: random(0, Math.PI * 2),
      wind: random(-110, 110), tilt: random(-0.3, 0.3),
      delay: initial ? 0 : random(0.5, 8), frozen: false
    });
  }
  const seeds = Array.from({ length: innerWidth < 600 ? 7 : 13 }, () => {
    const seed = {}; restart(seed, true); return seed;
  });
  const plants = [];
  const gardenCapacity = Math.floor(random(innerWidth < 600 ? 2 : 4, innerWidth < 600 ? 5 : 8));
  let gardenClock = 0, nextLanding = 0, peakAt = null, nextRenewal = 0;
  const smooth = (a, b, value) => {
    const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  function openPosition(patch) {
    let best = 0, clearance = -1;
    for (let i = 0; i < 8; i++) {
      const x = random(-patch.radius * 0.75, patch.radius * 0.75);
      const gap = Math.min(...patch.elements.map(e => Math.abs(e.x - x)), patch.radius);
      if (gap > clearance) { best = x; clearance = gap; }
    }
    return best;
  }
  function addElements(patch, count = 1) {
    const slot = patch.seedCount - 1;
    const edge = patch.lane < 0.18 || patch.lane > 0.82;
    const choices = patch.biome === 'pond' ? ['reed', 'lily', 'grass', 'reed', 'lily'] : patch.biome === 'fern' ? ['grass', 'fern', 'fern', 'shrub', 'flower'] :
      patch.biome === 'flowers' ? ['grass', 'flower', 'flower', 'shrub', 'puff'] : ['grass', 'fern', 'shrub', 'flower', 'puff'];
    for (let i = 0; i < count; i++) {
      let kind = choices[Math.floor(random(0, choices.length))];
      if (patch.biome === 'pond') kind = slot % 3 === 1 ? 'reed' : 'lily';
      if (edge && patch.biome !== 'pond' && !patch.elements.some(e => e.kind === 'tree') &&
          (patch.biome === 'grove' || (slot > 0 && Math.random() < 0.18))) kind = 'tree';
      patch.elements.push({
        kind, x: kind === 'tree' ? random(-8, 8) : openPosition(patch),
        height: kind === 'tree' ? random(160, 330) : random(30, 112),
        bend: random(-9, 9), lean: random(-0.4, 0.4),
        birth: patch.age + random(1, 7), duration: kind === 'tree' ? random(150,240) : random(15,32),
        treeArrivals: [{at:patch.age,count:patch.seedCount}],treeReadyAt:0,
        phase: random(0, Math.PI * 2), size: random(0.7, 1.1),
        shape: Math.floor(random(0, 4)),
        artVariant: Math.floor(random(0,6)),
        trunkShape: {
          lowerX: random(-0.24, 0.1), lowerY: random(0.2, 0.4),
          upperX: random(0.04, 0.35), upperY: random(0.5, 0.78),
          tipX: random(0.08, 0.42), width: random(0.012, 0.022)
        },
        branches: Array.from({length: Math.floor(random(5, 9))}, (_, j) => ({
          at: random(0.42, 0.9), direction: j % 2 ? -1 : 1,
          spread: random(0.18, 0.4), lift: random(0.12, 0.3),
          leafSize: random(10, 17), droop: random(9, 22),
          twigs: Array.from({length: Math.floor(random(5, 8))}, () => ({
            along: random(0.35, 1), reach: random(0.035, 0.12),
            angle: random(-0.9, 0.5), size: random(0.65, 1.25)
          }))
        }))
      });
    }
  }
  function land(seed) {
    const x = seed.x;
    if (x < 16 || x > width - 16) return;
    const nearby = plants.filter(p => Math.abs(p.lane * width - x) < p.radius + 13)
      .sort((a, b) => Math.abs(a.lane * width - x) - Math.abs(b.lane * width - x))[0];
    if (nearby) {
      sequenceGarden?.nourish(nearby);
      if (nearby.seedCount < 5) {
        nearby.seedCount++;
        for(const e of nearby.elements)if(e.kind==='tree') {
          e.treeArrivals.push({at:nearby.age,count:nearby.seedCount});
          e.treeReadyAt=Math.max(e.treeReadyAt,nearby.age+e.duration*0.65);
        }
        // Arrivals enrich the patch probabilistically, not one plant per seed.
        if (nearby.elements.length < 7 && Math.random() < 0.58) {
          addElements(nearby, Math.min(7 - nearby.elements.length, Math.random() < 0.15 ? 2 : 1));
        }
      }
      return;
    }
    const limit = Math.min(gardenCapacity, width < 600 ? 4 : 7);
    if (plants.length >= limit || gardenClock < nextLanding) return;
    const edge = x / width < 0.18 || x / width > 0.82;
    const choice = Math.random();
    const biome = edge && choice < 0.72 ? 'grove' :
      ['fern', 'flowers', 'mixed'][Math.floor(random(0, 3))];
    const patch = {
      lane: x / width, age: 0, seedCount: 1, fullness: 1, rate: 1,
      heightLimit: random(210, 370), lowHeightLimit: random(45, 95),
      radius: biome === 'pond' ? random(36, width < 600 ? 43 : 56) : random(width < 600 ? 32 : 48, width < 600 ? 52 : biome === 'grove' ? 115 : 90),
      biome,
      tint: Math.floor(random(0, 3)), elements: [],
      soilDepth: Math.random() < 0.22 ? random(5, 8) : random(1.2, 3.5), soilLift: random(0, Math.PI * 2),
      grains: Array.from({length: 22}, () => ({x: random(-1, 1), y: Math.random(), radius: random(0.25, 0.65)})),
      pebbles: Array.from({length: 2}, () => ({x: random(-0.8, 0.8), size: random(0.6, 1.4)})),
      sproutAt: 4, leavesAt: 18, bloomAt: 42, puffAt: 65, releaseAt: 90,
      fadeAt: random(170, 215), life: 245
    };
    addElements(patch); plants.push(patch);
    nextLanding = gardenClock + random(5, 13);
  }
  function strokeCurve(x, y, bend) {
    ctx.beginPath(); ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x, y * 0.3, x + bend, y * 0.7, x + bend, y); ctx.stroke();
  }
  function leaf(x, y, angle, length) {
    if (length <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.beginPath();ctx.moveTo(0, 0);
    ctx.bezierCurveTo(length * 0.28, -length * 0.38, length * 0.76, -length * 0.32, length, -length * 0.08);
    ctx.bezierCurveTo(length * 0.7, length * 0.34, length * 0.2, length * 0.26, 0, 0);ctx.fill();
    ctx.globalAlpha *= 0.42;
    ctx.beginPath();ctx.moveTo(length * 0.12, 0);
    ctx.quadraticCurveTo(length * 0.55, length * 0.12, length * 0.94, -length * 0.07);
    ctx.lineWidth = 0.35;ctx.stroke();ctx.restore();
  }
  function drawPlant(patch) {
    const x = patch.lane * width;
    const edge = patch.lane < 0.18 || patch.lane > 0.82;
    // Taller silhouettes belong to the margins; varied lower growth stays below text.
    let maxHeight = edge ? Math.min(patch.heightLimit, height * 0.53) : patch.lowHeightLimit;
    const reach = Math.max(patch.radius * 1.3 + 12, edge ? patch.heightLimit * 1.2 : 0);
    for (const rect of readingBounds) {
      if (rect.right > x - reach && rect.left < x + reach && rect.bottom > height - maxHeight - 12) {
        maxHeight = Math.max(4, Math.min(maxHeight, height - rect.bottom - 17));
      }
    }
    const fade = smooth(0, 4, patch.age);
    const radius = patch.radius * (1 + (patch.fullness - 1) * 0.06);
    ctx.save(); ctx.translate(x, height - 14);
    ctx.beginPath(); ctx.rect(-reach, -maxHeight, reach * 2, maxHeight + 14); ctx.clip();
    const forming = smooth(0, 18, patch.age);
    const depth = Math.min((patch.biome === 'pond' ? 1.2 : patch.soilDepth) * (1 + (patch.fullness - 1) * 0.03), edge ? 9 : 5) * forming;
    const surfaceAt = xx => {
      const u = Math.max(-1, Math.min(1, xx / radius));
      return -Math.pow(Math.max(0, 1 - u * u), 1.15) * depth *
        (0.88 + Math.sin(u * 3.5 + patch.soilLift) * 0.12);
    };
    // The soil grows above the viewport floor, so deep banks remain visible.
    ctx.globalAlpha = fade * forming * 0.19; ctx.fillStyle = '#d7cbb8';
    ctx.beginPath();ctx.moveTo(-radius, 4);
    for (let xx = -radius; xx <= radius; xx += 2) ctx.lineTo(xx, surfaceAt(xx));
    ctx.lineTo(radius, 4);ctx.closePath();ctx.fill();
    // Overlapping translucent washes soften the bank without adding visual weight.
    for (let i = 0; i < 5; i++) {
      const xx = (i / 4 - 0.5) * radius * 1.45;
      ctx.globalAlpha = fade * forming * 0.12;
      ctx.fillStyle = i % 2 ? '#bacdbb' : '#d5ddbd';
      ctx.beginPath(); ctx.ellipse(xx, surfaceAt(xx) + 1, radius * 0.38,
        5 + depth * 0.65, Math.sin(i + patch.soilLift) * 0.06, 0, Math.PI * 2); ctx.fill();
    }
    // Thin, irregular strata give deeper patches a gentle sense of earth.
    ctx.strokeStyle = '#bfae96';ctx.lineWidth = 0.55;ctx.globalAlpha = fade * forming * 0.17;
    for (const layer of depth > 4 ? [0.65] : []) {
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const xx = -radius * 0.86 + i / 24 * radius * 1.72;
        const top = surfaceAt(xx), yy = top + (4 - top) * layer + Math.sin(i * 0.5 + patch.soilLift) * 0.5;
        i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = fade * forming * 0.13;ctx.fillStyle = '#b7a58c';
    for (const grain of patch.grains) {
      const xx = grain.x * radius * 0.94, top = surfaceAt(xx);
      ctx.beginPath();ctx.arc(xx, top + 1 + grain.y * Math.max(0, 3 - top), grain.radius, 0, Math.PI * 2);ctx.fill();
    }
    // A broken moss edge follows the contour instead of a flat green stripe.
    ctx.strokeStyle = '#c6d3b6';ctx.lineWidth = 0.9;ctx.globalAlpha = fade * forming * 0.19;
    for (let i = 0; i < 11; i++) {
      const xx = (i / 11 * 1.8 - 0.9) * radius;
      ctx.beginPath();ctx.moveTo(xx, surfaceAt(xx));
      ctx.quadraticCurveTo(xx + radius * 0.04, surfaceAt(xx + radius * 0.04) - 0.7,
        xx + radius * 0.08, surfaceAt(xx + radius * 0.08));ctx.stroke();
    }
    ctx.fillStyle = '#c5c2b7';ctx.globalAlpha = fade * forming * 0.20;
    for (const stone of patch.pebbles) {
      const xx = stone.x * radius;
      ctx.beginPath();ctx.ellipse(xx, surfaceAt(xx) - stone.size * 0.25,
        stone.size * 1.5, stone.size * 0.6, stone.x * 0.4, 0, Math.PI * 2);ctx.fill();
    }
    ctx.strokeStyle = '#bcccb2';ctx.globalAlpha = fade * forming * 0.28;ctx.lineWidth = 0.55;
    for (let i = 0; i < 19; i++) {
      const noise = Math.sin(i * 19.73 + patch.soilLift * 4);
      const xx = noise * radius * 0.97, yy = surfaceAt(xx);
      const hh = (3 + (Math.sin(i * 7.3) + 1) * 5) * forming;
      ctx.beginPath();ctx.moveTo(xx, yy);
      ctx.quadraticCurveTo(xx + noise * 2, yy - hh * 0.7, xx + noise * 5, yy - hh);ctx.stroke();
    }
    if (patch.biome === 'pond') {
      const waterY = surfaceAt(0) - 1.5;
      ctx.fillStyle = '#d5e5e9';ctx.globalAlpha = fade * forming * 0.44;
      ctx.beginPath();ctx.ellipse(0, waterY, radius * 0.86, 5.2, -0.025, 0, Math.PI * 2);ctx.fill();
      ctx.strokeStyle = '#c3d9df';ctx.lineWidth = 0.55;ctx.globalAlpha = fade * forming * 0.34;
      ctx.beginPath();ctx.ellipse(0, waterY, radius * 0.86, 5.2, -0.025, 0.1, Math.PI * 1.8);ctx.stroke();
    }
    const sequenceBlend=sequenceGarden?.draw(patch,{height:Math.max(3,maxHeight-7),groundY:surfaceAt(0),opacity:fade})||0;
    if(sequenceBlend>=1){ctx.restore();return;}
    for (const e of patch.elements) {
      const g = smooth(e.birth, e.birth + e.duration, patch.age);
      if (!g) continue;
      const groundY = surfaceAt(e.x);
      const h = Math.max(3, Math.min(e.height, maxHeight + groundY - 7)) * g;
      const bend = e.bend * g + Math.sin(patch.age * 0.13 + e.phase) * 0.6;
      const retiring = e.retireAt === undefined ? 1 : 1 - smooth(e.retireAt, e.retireAt + 24, patch.age);
      ctx.globalAlpha = fade * 0.46 * g * retiring * (1-sequenceBlend);
      ctx.strokeStyle = ['#bac9b4', '#bbcfc4', '#c3c9b0'][patch.tint];
      ctx.fillStyle = ['#cdd9c4', '#cbded3', '#d6dcc6'][patch.tint];
      ctx.lineWidth = 0.7; ctx.save(); ctx.translate(e.x, groundY);
      if (e.kind === 'lily') {
        ctx.translate(0, surfaceAt(0) - groundY - 1.5);
        ctx.fillStyle = '#cddfc9';ctx.globalAlpha = fade * 0.29 * g * retiring;
        ctx.beginPath();ctx.ellipse(0, 0, 4.5 * g * e.size, 1.7 * g, e.lean, 0.3, Math.PI * 2);ctx.lineTo(0, 0);ctx.fill();
        if (e.size > 0.95) {
          ctx.fillStyle = '#e7dfc7';
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();ctx.ellipse((i - 1) * 1.1 * g, -1.8 * g, 0.9 * g, 2 * g, (i - 1) * 0.5, 0, Math.PI * 2);ctx.fill();
          }
        }
      } else if (e.kind === 'reed') {
        // Reeds sit on a bank; lily pads occupy the quiet water surface.
        ctx.translate((e.x < 0 ? -1 : 1) * radius * 0.35, 0);
        for (let i = 0; i < 2; i++) strokeCurve(i * 2, -h * (0.75 + i * 0.12), bend * 0.4);
        leaf(bend * 0.3, -h * 0.3, -1, h * 0.28);
      } else if (e.kind === 'grass') {
        for (let i = 0; i < 3; i++) strokeCurve(i * 2 - 2, -h * (0.65 + i * 0.12), bend + (i - 1) * 4);
      } else if (e.kind === 'fern') {
        for (let frond = 0; frond < 3; frond++) {
          const fh = h * (frond === 1 ? 1 : 0.65 + e.size * 0.1);
          const lean = bend + (frond - 1) * fh * 0.5;
          strokeCurve(0, -fh, lean);
          for (let i = 1; i <= 10; i++) {
            const f = i / 11, y = -fh * f, xx = lean * f * f;
            leaf(xx, y, -0.65, (1-f)*fh*0.27);
            leaf(xx, y, Math.PI+0.65, (1-f)*fh*0.27);
          }
        }
      } else if (e.kind === 'shrub') {
        for (let i = 0; i < 4; i++) {
          const hh = h * (0.45 + i * 0.12), lean = (i - 1.5) * 4 + bend * 0.3;
          strokeCurve(0, -hh, lean);
          for (let j = 1; j < 4; j++) {
            const f = j / 4;
            leaf(lean * f, -hh * f, j % 2 ? -0.7 : 3.8, 5 * e.size * g);
          }
        }
      } else if (e.kind === 'tree') {
        const fullHeight=Math.max(3,Math.min(e.height,maxHeight+groundY-7));
        drawGrowingTree(e,patch,fullHeight,fade*smooth(e.birth,e.birth+3,patch.age)*retiring*(1-sequenceBlend));
      } else {
        strokeCurve(0, -h, bend);
        leaf(0, -h * 0.22, -0.6, h * 0.21); leaf(0, -h * 0.32, 3.7, h * 0.18);
        const opening = smooth(e.birth + e.duration * 0.7, e.birth + e.duration + 13, patch.age);
        ctx.save(); ctx.translate(bend, -h);
        if (e.kind === 'flower') {
          ctx.fillStyle = '#e8ddba';
          for (let i = 0; i < 5; i++) {
            ctx.rotate(Math.PI * 2 / 5); ctx.beginPath();
            ctx.ellipse(0, -3 * opening, 4 * opening * e.size, 7 * opening * e.size, 0, 0, Math.PI * 2); ctx.fill();
          }
        ctx.fillStyle = '#d4c38e';ctx.beginPath();ctx.ellipse(0, 0, 1.8 * opening, 1.2 * opening, 0, 0, Math.PI * 2);ctx.fill();
        } else {
          ctx.strokeStyle = '#c6d4db';
          for (let i = 0; i < 16; i++) {
            const a = i * Math.PI * 2 / 16, r = 9 * opening;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke();
          }
        }
        ctx.restore();
      }
      ctx.restore();
    }
    ctx.restore();
  }
  function resize() {
    width = innerWidth; height = innerHeight;
    measureReading();
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * scale; canvas.height = height * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    seeds.forEach(seed => { seed.frozen = false; position(seed); });
  }
  function position(seed) {
    seed.x = seed.lane * width + Math.sin(seed.clock * seed.frequency + seed.offset) * seed.sway + seed.phase * seed.wind;
    seed.y = seed.phase * (height + 40) - 20;
    seed.angle = seed.tilt + Math.sin(seed.clock * seed.frequency * 0.7 + seed.offset) * 0.4;
  }
  function draw(seed) {
    const edge = Math.min(1, Math.abs(seed.x - width / 2) / (width * 0.32));
    const fade = Math.max(0, Math.min(1, seed.phase * 15, (1 - seed.phase) * 12));
    ctx.save(); ctx.translate(seed.x, seed.y); ctx.rotate(seed.angle);
    ctx.scale(seed.size, seed.size);
    ctx.globalAlpha = fade * (0.25 + edge * 0.65);
    ctx.lineWidth = 0.65; ctx.strokeStyle = '#b1c2c9';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1, 11); ctx.stroke();
    for (let j = 0; j < 17; j++) {
      const angle = Math.PI * 0.82 + j * Math.PI * 1.36 / 16;
      const x = Math.cos(angle) * 8, y = Math.sin(angle) * 8;
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(x / 2 + 0.55, y / 2, x, y);
      for (const offset of [-0.55, 0, 0.55]) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle + offset) * 1.4, y + Math.sin(angle + offset) * 1.4);
      }
      ctx.stroke();
    }
    ctx.fillStyle = '#b6a17d'; ctx.beginPath();
    ctx.ellipse(1, 12, 1.1, 2.4, -0.1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function updateGarden(dt=0) {
    const mature = p => p.seedCount === 5 && p.fullness >= 5 &&
      p.elements.every(e => elementMature(p,e));
    let capacity = plants.length >= Math.min(gardenCapacity, width < 600 ? 4 : 7);
    if (!capacity && plants.length) {
      capacity = true;
      for (let x = 16; x <= width - 16; x += 8) {
        if (!plants.some(p => Math.abs(p.lane * width - x) < p.radius + 13)) { capacity = false; break; }
      }
    }
    if(sequenceGarden?.enabled){sequenceGarden.tick(dt,plants,capacity,gardenClock);return;}
    if (peakAt === null && capacity && plants.every(mature)) {
      peakAt = gardenClock;
      nextRenewal = gardenClock + 25;
    }
    // The ground never resets. Only one old component renews at a time.
    let renewing = false;
    for (const patch of plants) {
      for (let i = patch.elements.length - 1; i >= 0; i--) {
        const e = patch.elements[i];
        if (e.retireAt === undefined) continue;
        renewing = true;
        if (!e.replaced && patch.age >= e.retireAt + 12) {
          addElements(patch, 1);
          e.replaced = true;
        }
        if (patch.age >= e.retireAt + 24) patch.elements.splice(i, 1);
      }
    }
    if (peakAt !== null && !renewing && gardenClock >= nextRenewal && plants.every(p =>
        p.elements.every(e => elementMature(p,e)))) {
      let oldest = null, owner = null;
      for (const patch of plants) for (const e of patch.elements) {
        const age = patch.age - e.birth;
        if (!oldest || age > owner.age - oldest.birth) { oldest = e; owner = patch; }
      }
      if (oldest) { oldest.retireAt = owner.age; nextRenewal = gardenClock + random(35, 60); }
    }
    canvas.dataset.worldPhase = peakAt === null ? 'building' : renewing ? 'renewing' : 'settled';
    canvas.dataset.renewing = plants.reduce((n, p) => n + p.elements.filter(e => e.retireAt !== undefined).length, 0);
  }
  function render(now) {
    const dt = last ? Math.min((now - last) / 1000, 0.05) * 25 : 0;
    last = now; ctx.clearRect(0, 0, width, height);
    gardenClock += dt;
    for (let i = plants.length - 1; i >= 0; i--) {
      plants[i].age += dt;
      // Each added seed takes eight seconds to visibly fill out the clump.
      plants[i].fullness = Math.min(plants[i].seedCount, plants[i].fullness + dt / 8);

    }
    if (width < 600 && plants.length > 4) plants.splice(4);
    let frozen = 0;
    for (const seed of seeds) {
      if (seed.delay > 0) {
        seed.delay = Math.max(0, seed.delay - dt);
        continue;
      }
      // Hit-test the current position before advancing: the hovered seed stays
      // exactly still, including its sway and rotation, until the pointer leaves.
      seed.frozen = !!pointer && Math.hypot(pointer.x - seed.x, pointer.y - (seed.y + 3)) < 19 * seed.size;
      if (seed.frozen) frozen++;
      else {
        seed.clock += dt;
        seed.phase += dt * seed.speed;
        const groundPhase = (height - 1) / (height + 40);
        if (seed.phase >= groundPhase) {
          position(seed);
          land(seed);
          restart(seed);
        }
        position(seed);
      }
      draw(seed);
    }
    updateGarden(dt);
    if (plants.length > 1) {
      const ordered = [...plants].sort((a,b) => a.lane-b.lane);
      ctx.save();ctx.globalAlpha = 0.22;ctx.strokeStyle = '#c4d0b5';ctx.lineWidth = 0.65;
      ctx.beginPath();
      ordered.forEach((p,i) => {
        const x = p.lane*width, y = height-15-Math.min(3,p.soilDepth)*smooth(0,18,p.age);
        if (!i) ctx.moveTo(x,y);
        else {
          const previous = ordered[i-1], px = previous.lane*width;
          ctx.bezierCurveTo(px+(x-px)*0.35,height-5,px+(x-px)*0.7,height-3,x,y);
        }
      });ctx.stroke();ctx.restore();
    }
    plants.forEach(drawPlant);
    canvas.dataset.plants = plants.length;
    canvas.dataset.treeCount = plants.reduce((n, p) => n + p.elements.filter(e => e.kind === 'tree').length, 0);
    canvas.dataset.pondCount = plants.filter(p => p.biome === 'pond').length;
    canvas.dataset.patchBiomes = plants.map(p => p.biome).join(',');
    canvas.dataset.patchLocations = plants.map(p => p.lane.toFixed(3)).join(',');
    canvas.dataset.plantSeeds = plants.map(p => p.seedCount).join(',');
    canvas.dataset.plantStages = plants.map(p => p.elements.some(e => e.retireAt !== undefined) ? 'renewing' : p.elements.every(e => elementMature(p,e)) ? 'mature' : 'growing').join(',');
    canvas.dataset.treeStages=plants.flatMap(p=>p.elements.filter(e=>e.kind==='tree').map(e=>{const q=(p.age-e.birth)/e.duration;return q<0.09?'sprout':q<0.26?'seedling':q<0.55?'young':q<0.85?'mature':'aged';})).join(',');
    canvas.dataset.pausedSeeds = frozen;
    frame = requestAnimationFrame(render);
  }
  addEventListener('pointermove', event => {
    pointer = event.pointerType === 'touch' ? null : { x: event.clientX, y: event.clientY };
  }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer = null; });
  addEventListener('blur', () => { pointer = null; });
  addEventListener('resize', resize);
  addEventListener('scroll', measureReading, { passive: true });
  addEventListener('load', measureReading);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame); last = 0;
    if (!document.hidden && !reduced.matches) frame = requestAnimationFrame(render);
  });
  reduced.addEventListener('change', () => {
    cancelAnimationFrame(frame); last = 0;
    canvas.hidden = reduced.matches;
    if (!reduced.matches) frame = requestAnimationFrame(render);
  });
  resize(); frame = requestAnimationFrame(render);
})();
