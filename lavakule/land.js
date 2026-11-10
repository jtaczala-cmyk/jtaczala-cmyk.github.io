/* Scrolling backdrop for Lavakule. Drawn on a 2D canvas behind the track.
   Strips are painted once and blitted, so a phone can keep this at 60fps. */
export function createLand(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Wstrip = 960;
  let W = 2, H = 2, dpr = 1;
  const fog = new Float32Array([0.62, 0.78, 0.9]);

  function rng(n) { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }
  function wrapRidge(u, a, b, c) {
    return Math.sin(u * Math.PI * 2 * a) * 0.55 + Math.sin(u * Math.PI * 2 * b + 1.7) * 0.3 + Math.sin(u * Math.PI * 2 * c + 0.4) * 0.15;
  }
  function paintRidge(g, w, h, y0, amp, color, freq) {
    g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) {
      const u = x / w;
      g.lineTo(x, y0 + wrapRidge(u, freq[0], freq[1], freq[2]) * amp);
    }
    g.lineTo(w, h); g.closePath(); g.fillStyle = color; g.fill();
  }
  function makeStrip(h, draw) {
    const c = document.createElement('canvas'); c.width = Wstrip; c.height = h;
    draw(c.getContext('2d'), Wstrip, h); return c;
  }

  const mountains = makeStrip(220, (g, w, h) => {
    paintRidge(g, w, h, h * 0.72, h * 0.28, '#a9b9c6', [2, 5, 9]);
    paintRidge(g, w, h, h * 0.84, h * 0.2, '#8ea4b4', [3, 6, 11]);
    g.globalAlpha = 0.55; paintRidge(g, w, h, h * 0.62, h * 0.16, '#d5dde4', [2, 4, 8]); g.globalAlpha = 1;
  });
  const hills = makeStrip(200, (g, w, h) => {
    paintRidge(g, w, h, h * 0.55, h * 0.22, '#7d9474', [2, 4, 7]);
    paintRidge(g, w, h, h * 0.72, h * 0.16, '#698a62', [3, 5, 9]);
  });
  const highland = makeStrip(340, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#9bb892'); grd.addColorStop(1, '#d2c09a');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    paintRidge(g, w, h, h * 0.22, h * 0.12, '#6d8a66', [2, 5, 8]);
    g.fillStyle = '#e6d7b8'; g.fillRect(0, h * 0.34, w, 14);
    for (let i = 0; i < 7; i++) tree(g, 40 + i * 140, h * 0.2, 30 + rng(i + 11) * 14);
  });
  const clouds = makeStrip(140, (g, w, h) => {
    for (let i = 0; i < 7; i++) {
      const x = (i + 0.35) * (w / 7), y = 30 + rng(i + 3) * 60, s = 26 + rng(i + 9) * 22;
      g.fillStyle = 'rgba(255,255,255,.82)';
      g.beginPath(); g.ellipse(x, y, s, s * 0.62, 0, 0, 7); g.ellipse(x + s * 0.7, y + 6, s * 0.8, s * 0.5, 0, 0, 7); g.ellipse(x - s * 0.55, y + 8, s * 0.65, s * 0.45, 0, 0, 7); g.fill();
    }
  });

  function tree(g, x, y, s) {
    g.fillStyle = '#6b4a2e'; g.fillRect(x - s * 0.08, y, s * 0.16, s * 0.38);
    g.fillStyle = '#2f6b3c'; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.46, y + s * 0.08); g.lineTo(x - s * 0.46, y + s * 0.08); g.fill();
    g.fillStyle = '#3e8648'; g.beginPath(); g.moveTo(x, y - s * 0.62); g.lineTo(x + s * 0.36, y + s * 0.22); g.lineTo(x - s * 0.36, y + s * 0.22); g.fill();
  }
  const forest = makeStrip(340, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#8fbf6a'); grd.addColorStop(0.45, '#6ea354'); grd.addColorStop(1, '#c6a56a');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = '#d9c39a'; g.fillRect(0, h * 0.34, w, 16);
    for (let i = 0; i < 16; i++) tree(g, 16 + i * 60, h * 0.2 + rng(i + 4) * 18, 34 + rng(i + 2) * 26);
    tree(g, 8, h * 0.22, 40); tree(g, w - 8, h * 0.22, 40);
  });

  const chimneys = [];
  const villagers = [];
  const village = makeStrip(340, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#9dc56e'); grd.addColorStop(0.4, '#7eaa58'); grd.addColorStop(1, '#cbb48a');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b7a48a'; g.fillRect(0, h * 0.34, w, 16);
    const roofs = ['#c4533a', '#d9783a', '#8c4a3a', '#b8443c'];
    const walls = ['#f6e6c8', '#f3d7b0', '#efe2cf', '#f8edd8'];
    for (let i = 0; i < 6; i++) {
      const x = 70 + i * 150, hw = 78, hh = 48, y = h * 0.16;
      g.fillStyle = walls[i % walls.length]; g.fillRect(x, y, hw, hh);
      g.fillStyle = roofs[i % roofs.length]; g.beginPath(); g.moveTo(x - 8, y); g.lineTo(x + hw / 2, y - 36); g.lineTo(x + hw + 8, y); g.fill();
      g.fillStyle = '#6ec3e0'; g.fillRect(x + 14, y + 14, 16, 14); g.fillRect(x + hw - 30, y + 14, 16, 14);
      g.fillStyle = '#6b4028'; g.fillRect(x + hw / 2 - 8, y + 26, 16, 28);
      g.fillStyle = '#efe6d6'; g.fillRect(x + hw - 22, y - 48, 10, 16);
      chimneys.push(x + hw - 17);
      villagers.push(x + hw + 18);
    }
  });

  let skyCache = null, skyKey = '';
  function sky(eve) {
    const key = eve + ':' + (W | 0) + 'x' + (H | 0);
    if (key === skyKey && skyCache) return skyCache;
    skyKey = key;
    skyCache = document.createElement('canvas');
    skyCache.width = Math.max(2, W | 0); skyCache.height = Math.max(2, H | 0);
    const g = skyCache.getContext('2d');
    const day = [[126, 196, 232], [198, 228, 246], [255, 236, 214]];
    const dusk = [[64, 52, 112], [232, 126, 86], [255, 196, 122]];
    const mix = (a, b) => a.map((v, i) => (v + (b[i] - v) * eve) | 0);
    const c0 = mix(day[0], dusk[0]), c1 = mix(day[1], dusk[1]), c2 = mix(day[2], dusk[2]);
    const grd = g.createLinearGradient(0, 0, 0, skyCache.height);
    grd.addColorStop(0, `rgb(${c0.join(',')})`);
    grd.addColorStop(0.55, `rgb(${c1.join(',')})`);
    grd.addColorStop(1, `rgb(${c2.join(',')})`);
    g.fillStyle = grd; g.fillRect(0, 0, skyCache.width, skyCache.height);
    fog[0] = c2[0] / 255; fog[1] = c2[1] / 255; fog[2] = c2[2] / 255;
    return skyCache;
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(2, r.width || innerWidth);
    H = Math.max(2, r.height || innerHeight);
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    skyKey = '';
  }

  function blit(img, scroll, y, h, alpha) {
    if (!img || !img.height) return;
    const scale = h / img.height, dw = img.width * scale;
    let x = -((scroll % dw) + dw) % dw;
    ctx.globalAlpha = alpha;
    for (; x < W; x += dw) ctx.drawImage(img, x, y, dw, h);
    ctx.globalAlpha = 1;
  }
  function featureX(localX, scroll, y, h) {
    const scale = h / village.height, dw = village.width * scale;
    const start = -((scroll % dw) + dw) % dw;
    const out = [];
    for (let base = start; base < W; base += dw) out.push(base + localX * scale);
    return out;
  }

  const birds = Array.from({ length: 5 }, (_, i) => ({ x: rng(i + 20), y: 0.08 + rng(i + 30) * 0.12, v: 0.03 + rng(i + 40) * 0.04, f: rng(i) * 6 }));
  let cat = null, catGate = -1, clock = 0;

  function drawCat(x, y, step) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1.7, 1.7);
    const leg = Math.sin(step) * 3;
    ctx.strokeStyle = '#c46a28'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(-8 + leg, 14); ctx.moveTo(6, 8); ctx.lineTo(6 - leg, 14); ctx.stroke();
    ctx.fillStyle = '#e8893a';
    ctx.beginPath(); ctx.ellipse(0, 4, 14, 8, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -2, 7, 6.5, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(8, -7); ctx.lineTo(10, -13); ctx.lineTo(13, -6); ctx.moveTo(14, -6); ctx.lineTo(17, -12); ctx.lineTo(18, -5); ctx.fill();
    ctx.fillStyle = '#fff6ea'; ctx.beginPath(); ctx.ellipse(-2, 6, 7, 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#2a241c'; ctx.fillRect(15, -4, 1.6, 2); ctx.fillRect(11, -4, 1.6, 2);
    ctx.strokeStyle = '#e8893a'; ctx.beginPath(); ctx.moveTo(-12, 2); ctx.quadraticCurveTo(-22, -8 - leg, -16, 6); ctx.stroke();
    ctx.restore();
  }
  function drawPerson(x, y, wave, coat) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1.45, 1.45);
    ctx.strokeStyle = '#3a2e28'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(-4, 16); ctx.moveTo(0, 6); ctx.lineTo(4, 16); ctx.stroke();
    ctx.fillStyle = coat; ctx.fillRect(-5, -2, 10, 12);
    ctx.strokeStyle = coat;
    ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-12, 6 + wave * 7); ctx.moveTo(5, 0); ctx.lineTo(8, 8); ctx.stroke();
    ctx.fillStyle = '#f1c3a0'; ctx.beginPath(); ctx.arc(0, -7, 4.2, 0, 7); ctx.fill();
    ctx.restore();
  }
  function bird(x, y, flap) {
    ctx.strokeStyle = 'rgba(50,60,70,.75)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.quadraticCurveTo(x - 3, y - 5 * flap, x, y); ctx.quadraticCurveTo(x + 3, y - 5 * flap, x + 7, y); ctx.stroke();
  }

  function draw(dist, lateral, dt) {
    if (Math.abs((canvas.getBoundingClientRect().width || 0) - W) > 1) resize();
    clock += dt || 0;
    const phase = ((dist / 1260) % 1 + 1) % 1;
    const eve = phase < 0.62 ? 0 : (phase < 0.82 ? (phase - 0.62) / 0.2 : 1 - (phase - 0.82) / 0.18);
    const e = Math.max(0, Math.min(1, eve));
    ctx.drawImage(sky(Math.round(e * 16) / 16), 0, 0, W, H);
    const t = reduced ? 0 : clock;
    const sunX = W * (0.15 + phase * 0.7), sunY = H * (0.1 + e * 0.08);
    ctx.fillStyle = e > 0.45 ? 'rgba(255,244,210,.9)' : 'rgba(255,236,170,.95)';
    ctx.beginPath(); ctx.arc(sunX, sunY, e > 0.45 ? 11 : 16, 0, 7); ctx.fill();

    blit(clouds, dist * 0.45 + t * 8, H * 0.06, H * 0.16, 0.9);
    blit(mountains, dist * 1.1 - lateral * 10, H * 0.2, H * 0.26, 0.72);
    blit(hills, dist * 2.1 - lateral * 18, H * 0.3, H * 0.22, 0.88);

    const sceneM = 420, slot = dist / sceneM, idx = Math.floor(slot) % 3, frac = slot - Math.floor(slot);
    const scenes = [forest, highland, village];
    const gy = H * 0.4, gh = H * 0.62;
    const groundScroll = dist * 5.2 - lateral * 28;
    blit(scenes[idx], groundScroll, gy, gh, 1);
    if (frac > 0.82) blit(scenes[(idx + 1) % 3], groundScroll, gy, gh, (frac - 0.82) / 0.18);

    const villageOn = idx === 2 || (idx === 1 && frac > 0.82);
    if (villageOn) {
      const wave = reduced ? 0.4 : Math.sin(t * 6);
      const coats = ['#e25b4a', '#3d7ea6', '#e6b143', '#7a5b3a', '#d46a8a', '#3f8f62'];
      villagers.forEach((lx, i) => {
        featureX(lx, groundScroll, gy, gh).forEach(x => { if (x > -20 && x < W + 20) drawPerson(x, gy + gh * 0.18, wave, coats[i % coats.length]); });
      });
      chimneys.forEach(lx => {
        featureX(lx, groundScroll, gy, gh).forEach(x => {
          if (x < -10 || x > W + 10) return;
          const base = gy + gh * 0.16 - 8;
          for (let p = 0; p < 3; p++) {
            const k = ((t * 0.35 + p * 0.33) % 1);
            ctx.fillStyle = `rgba(255,255,255,${(1 - k) * 0.45})`;
            ctx.beginPath(); ctx.arc(x + k * 10, base - k * 28, 3 + k * 5, 0, 7); ctx.fill();
          }
        });
      });
    }

    birds.forEach(b => {
      if (!reduced) b.x += dt * b.v; if (b.x > 1.15) b.x = -0.15;
      bird(b.x * W, H * b.y + Math.sin(t * 2 + b.f) * 4, 0.4 + Math.sin(t * 8 + b.f) * 0.6);
    });

    const gate = Math.floor(dist / 520);
    if (!cat && clock > 2.2 && catGate < 0) { catGate = gate; cat = { t: 0 }; }
    else if (gate !== catGate && gate > 0 && rng(gate) > 0.25) { catGate = gate; cat = { t: 0 }; }
    else if (gate !== catGate && !cat) catGate = gate;
    if (cat) {
      cat.t += dt;
      const p = cat.t / 3.1;
      if (p >= 1) cat = null;
      else drawCat(-40 + p * (W + 80), H * 0.4, cat.t * 14);
    }

    if (e > 0.08) { ctx.fillStyle = `rgba(48,24,64,${e * 0.22})`; ctx.fillRect(0, 0, W, H); }
  }

  resize();
  return { draw, resize, fog };
}
