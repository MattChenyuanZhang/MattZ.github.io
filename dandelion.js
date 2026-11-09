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
  let width = 0, height = 0, pointer = null, last = 0, frame;
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
  let gardenClock = 0, nextLanding = 0;
  const smooth = (a, b, value) => {
    const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  function land(seed) {
    const x = seed.x;
    // Keep growth in the outer margins, away from the reading column.
    const inMargin = x > 24 && x < width - 24 &&
      (x < Math.min(width * 0.16, 180) || x > width - Math.min(width * 0.16, 180));
    const nearby = plants.filter(plant => Math.abs(plant.lane * width - x) < 42)
      .sort((a, b) => Math.abs(a.lane * width - x) - Math.abs(b.lane * width - x))[0];
    if (nearby) {
      // Late arrivals enrich the existing clump, never reset its age or fading.
      if (nearby.seedCount < 5 && nearby.age * nearby.rate < nearby.fadeAt) {
        nearby.seedCount++;
      }
      return;
    }
    const limit = width < 600 ? 3 : 5;
    if (!inMargin || plants.length >= limit || gardenClock < nextLanding ||
        plants.some(plant => Math.abs(plant.lane * width - x) < 38)) return;
    plants.push({
      lane: x / width, age: 0, seedCount: 1, fullness: 1, scale: random(0.65, 1.15),
      rate: random(0.7, 1.25), height: random(24, 47), bend: random(-7, 7),
      leafCount: Math.floor(random(4, 9)), leafLength: random(0.75, 1.2),
      swayPhase: random(0, Math.PI * 2), swaySpeed: random(0.12, 0.3),
      crown: random(6.5, 10), tint: Math.floor(random(0, 3)),
      sproutAt: random(3, 8), leavesAt: random(14, 22), stalkAt: random(28, 39),
      bloomAt: random(44, 56), puffAt: random(63, 77),
      releaseAt: random(82, 96), fadeAt: random(100, 114), life: 134
    });
    nextLanding = gardenClock + random(6, 14);
  }
  function leaf(x, y, direction, length) {
    ctx.beginPath(); ctx.moveTo(x, y);
    // Broad, softly lobed leaves match the selected silhouette proposal.
    ctx.bezierCurveTo(x + direction * length * 0.1, y - length * 0.35,
      x + direction * length * 0.28, y - length * 0.65,
      x + direction * length * 0.42, y - length * 0.42);
    ctx.bezierCurveTo(x + direction * length * 0.52, y - length * 0.75,
      x + direction * length * 0.85, y - length * 0.72,
      x + direction * length, y - length * 0.45);
    ctx.bezierCurveTo(x + direction * length * 0.9, y - length * 0.25,
      x + direction * length * 0.7, y - length * 0.16,
      x + direction * length * 0.6, y - length * 0.22);
    ctx.bezierCurveTo(x + direction * length * 0.45, y + 1,
      x + direction * length * 0.2, y + 2, x, y);
    ctx.fill();
  }
  function drawPlant(plant) {
    const age = plant.age * plant.rate;
    const sprout = smooth(plant.sproutAt, plant.sproutAt + 12, age), leaves = smooth(plant.leavesAt, plant.leavesAt + 19, age);
    const stalk = smooth(plant.stalkAt, plant.stalkAt + 20, age), bloom = smooth(plant.bloomAt, plant.bloomAt + 11, age);
    const puff = smooth(plant.puffAt, plant.puffAt + 10, age), release = smooth(plant.releaseAt, plant.releaseAt + 11, age);
    const fade = smooth(0, 2, age) * (1 - smooth(plant.fadeAt, plant.life, age));
    ctx.save(); ctx.translate(plant.lane * width, height - 9); const clumpScale = plant.scale * (1 + (plant.fullness - 1) * 0.10);
    ctx.scale(clumpScale, clumpScale);
    ctx.globalAlpha = fade * 0.36; ctx.lineWidth = 0.8;
    ctx.strokeStyle = ['#b8c4a9', '#b5c7bc', '#c4c8ae'][plant.tint];
    ctx.fillStyle = ['#c8d1bc', '#c4d2c9', '#d0d3bf'][plant.tint];
    if (sprout > 0) {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-2, -5, 0, -12 * sprout); ctx.stroke();
      leaf(0, -9 * sprout, -1, 8 * sprout); leaf(0, -10 * sprout, 1, 8 * sprout);
    }
    for (let i = 0; i < plant.leafCount + Math.ceil((plant.fullness - 1) * 2); i++) {
      const opening = i < plant.leafCount ? 1 : Math.min(1, Math.max(0, (plant.fullness - 1) * 2 - (i - plant.leafCount)));
      leaf(0, -1, i % 2 ? 1 : -1, opening * leaves * (12 + (i % 7) * 2) * plant.leafLength);
    }
    for (let stem = 0; stem < Math.ceil(plant.fullness); stem++) {
      const opening = Math.min(1, Math.max(0, plant.fullness - stem));
      if (stalk <= 0 || opening <= 0) continue;
      const stemAge = age - stem * 5;
      const bloom = smooth(plant.bloomAt, plant.bloomAt + 11, stemAge);
      const puff = smooth(plant.puffAt, plant.puffAt + 10, stemAge);
      const release = smooth(plant.releaseAt, plant.releaseAt + 11, stemAge);
      const stemFade = fade * opening;
      ctx.globalAlpha = stemFade * 0.36;
      ctx.strokeStyle = ['#b8c4a9', '#b5c7bc', '#c4c8ae'][plant.tint];
      const top = -12 - stalk * plant.height * opening * (1 - stem * 0.075);
      const bend = plant.bend + (stem % 2 ? -1 : 1) * stem * 7 + Math.sin(plant.age * plant.swaySpeed + plant.swayPhase) * 1.2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(2, -16, bend + 2, top + 13, bend, top); ctx.stroke();
      ctx.save(); ctx.translate(bend, top);
      ctx.globalAlpha = stemFade * 0.38 * bloom * (1 - puff);
      ctx.strokeStyle = '#d5cda4';
      for (let i = 0; i < 18; i++) {
        const angle = i * Math.PI * 2 / 18;
        ctx.beginPath(); ctx.moveTo(Math.cos(angle) * 2, Math.sin(angle) * 2);
        ctx.lineTo(Math.cos(angle) * 7, Math.sin(angle) * 5); ctx.stroke();
      }
      ctx.globalAlpha = stemFade * 0.38 * puff;
      ctx.strokeStyle = '#bccbd0';
      for (let i = 0; i < 22; i++) {
        // Leave a few hairs as seeds release; no sudden empty flower head.
        if (release > 0 && i % 3 === 0) continue;
        const angle = i * Math.PI * 2 / 22;
        const x = Math.cos(angle) * plant.crown, y = Math.sin(angle) * plant.crown;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, y);
        ctx.moveTo(x - 1.2, y - 1); ctx.lineTo(x + 1.2, y - 1); ctx.stroke();
      }
      // Three transient seeds lift away, then fade. They never add to the pool.
      if (stem === 0 && age >= plant.releaseAt && age < plant.releaseAt + 14) {
        for (let i = 0; i < 3; i++) {
          const t = Math.max(0, age - plant.releaseAt - i * 1.2);
          ctx.save(); ctx.translate(t * (i - 0.7) * 2.2, -t * 3);
          ctx.globalAlpha = stemFade * 0.35 * Math.min(1, t) * Math.max(0, 1 - t / 11);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 5);
          for (let j = 0; j < 5; j++) {
            const angle = Math.PI + j * Math.PI / 4;
            ctx.moveTo(0, 0); ctx.lineTo(Math.cos(angle) * 3, Math.sin(angle) * 3);
          }
          ctx.stroke(); ctx.restore();
        }
      }
      ctx.restore();
    }
    // The landed seed quietly disappears as the sprout takes over.
    ctx.globalAlpha = fade * 0.4 * (1 - smooth(5, 17, age));
    ctx.fillStyle = '#b6a17d'; ctx.beginPath(); ctx.ellipse(0, -2, 2.3, 1, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c2d0d5'; ctx.beginPath(); ctx.moveTo(1, -2); ctx.lineTo(9, -4); ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const angle = Math.PI * 0.6 + i * Math.PI / 8;
      ctx.beginPath(); ctx.moveTo(9, -4); ctx.lineTo(9 + Math.cos(angle) * 6, -4 + Math.sin(angle) * 6); ctx.stroke();
    }
    ctx.restore();
  }
  function resize() {
    width = innerWidth; height = innerHeight;
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
  function render(now) {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now; ctx.clearRect(0, 0, width, height);
    gardenClock += dt;
    for (let i = plants.length - 1; i >= 0; i--) {
      plants[i].age += dt;
      // Each added seed takes eight seconds to visibly fill out the clump.
      plants[i].fullness = Math.min(plants[i].seedCount, plants[i].fullness + dt / 8);
      if (plants[i].age * plants[i].rate >= plants[i].life) plants.splice(i, 1);
    }
    if (width < 600 && plants.length > 3) plants.splice(3);
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
    plants.forEach(drawPlant);
    canvas.dataset.plants = plants.length;
    canvas.dataset.plantSeeds = plants.map(p => p.seedCount).join(',');
    canvas.dataset.plantStages = plants.map(p => p.age * p.rate < p.sproutAt ? 'land' : p.age * p.rate < p.leavesAt ? 'sprout' : p.age * p.rate < p.bloomAt ? 'leaves' : p.age * p.rate < p.puffAt ? 'bloom' : p.age * p.rate < p.releaseAt ? 'puff' : p.age * p.rate < p.fadeAt ? 'release' : 'fade').join(',');
    canvas.dataset.pausedSeeds = frozen;
    frame = requestAnimationFrame(render);
  }
  addEventListener('pointermove', event => {
    pointer = event.pointerType === 'touch' ? null : { x: event.clientX, y: event.clientY };
  }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer = null; });
  addEventListener('blur', () => { pointer = null; });
  addEventListener('resize', resize);
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
