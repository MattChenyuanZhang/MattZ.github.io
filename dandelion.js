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
        if (seed.phase >= 1) restart(seed);
        position(seed);
      }
      draw(seed);
    }
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
