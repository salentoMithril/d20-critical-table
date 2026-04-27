// Generates the front and back textures of a Yu-Gi-Oh! style Spell card
// ("Carta Magia") via Canvas 2D. The layout aims to match the real YGO TCG
// spell-card frame: tan outer bevel, teal-green inner field, black serif
// name on the frame, "SPELL CARD" attribute disc, gold-bordered artwork,
// type line printed on the frame, cream effect-text panel, holofoil seal.

const W = 750;
const H = 1050;

// Real YGO spell green is a saturated teal-green; the printed border has a
// warm tan bevel around it.
const SPELL_GREEN = '#1a9a72';
const SPELL_GREEN_HI = '#34b48a';
const SPELL_GREEN_LO = '#0e6d50';
const BEVEL_HI = '#5a5a5e';
const BEVEL_LO = '#2a2a2c';
const CREAM = '#fbeac3';
const CREAM_LO = '#e7cf94';
const GOLD = '#d8b257';

export function buildCardTextures() {
  return {
    front: makeCanvas(drawFront),
    back: makeCanvas(drawBack),
  };
}

function makeCanvas(drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  drawFn(canvas.getContext('2d'));
  return canvas;
}

/* ---------- FRONT ---------- */

function drawFront(ctx) {
  drawCardBevel(ctx);
  drawSpellField(ctx);
  drawNameLine(ctx);
  drawSpellAttributeDisc(ctx);
  drawArtWindow(ctx);
  drawEffectBox(ctx);
  drawBottomInfo(ctx);
}

function drawCardBevel(ctx) {
  // Outer dark edge.
  ctx.fillStyle = '#0a0a0a';
  roundRect(ctx, 0, 0, W, H, 30);
  ctx.fill();

  // Dark grey beveled border (the visible "card stock" rim).
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, BEVEL_HI);
  g.addColorStop(0.5, '#3d3d40');
  g.addColorStop(1, BEVEL_LO);
  ctx.fillStyle = g;
  roundRect(ctx, 6, 6, W - 12, H - 12, 26);
  ctx.fill();

  // Thin dark line that separates bevel from the green field.
  ctx.strokeStyle = '#0d0d0e';
  ctx.lineWidth = 1.2;
  roundRect(ctx, 22.5, 22.5, W - 45, H - 45, 18);
  ctx.stroke();
}

function drawSpellField(ctx) {
  // The main green panel.
  const x = 24, y = 24, w = W - 48, h = H - 48;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, SPELL_GREEN_HI);
  g.addColorStop(0.5, SPELL_GREEN);
  g.addColorStop(1, SPELL_GREEN_LO);
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
}

function drawNameLine(ctx) {
  // Card name printed in black serif directly on the green frame.
  // Real YGO uses Stone Serif / ITC Stone Serif Bold; we fall back gracefully.
  const x = 56;
  const baseline = 92;

  ctx.save();
  ctx.fillStyle = '#0a0a0a';
  ctx.font =
    'bold 44px "ITC Stone Serif", "Stone Serif Std", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  // Slight letter-spacing feel by drawing once; modern canvases support
  // letterSpacing but it's not universal — keep simple.
  ctx.fillText('CriticalTable', x, baseline);
  ctx.restore();
}

function drawSpellAttributeDisc(ctx) {
  // Top-right attribute disc, ocean-blue with the kanji 魔 centered.
  const cx = W - 80;
  const cy = 68;
  const r = 36;

  // Dark thin outline.
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Ocean-blue sphere body.
  const g = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.45, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#5fb8e8');
  g.addColorStop(0.5, '#1f6fb0');
  g.addColorStop(1, '#0a3a66');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Thin gold inner ring.
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
  ctx.stroke();

  // Specular highlight.
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.32, cy - r * 0.5, r * 0.32, r * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Kanji for "magic" — perfectly centered.
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Noto Sans CJK JP", "Yu Mincho", "Hiragino Mincho ProN", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const m = ctx.measureText('魔');
  // Optical-correct vertical centering using actual glyph bounding box.
  const ascent = m.actualBoundingBoxAscent || 0;
  const descent = m.actualBoundingBoxDescent || 0;
  const offsetY = (descent - ascent) / 2;
  ctx.fillText('魔', cx, cy + offsetY);
  ctx.restore();
}

function drawArtWindow(ctx) {
  // Artwork frame. Real cards have a thin black line, then a thin gold
  // line, around the picture.
  const x = 64, y = 118, w = W - 128, h = 540;

  // Outer black line.
  ctx.fillStyle = '#0a0a0a';
  roundRect(ctx, x - 5, y - 5, w + 10, h + 10, 2);
  ctx.fill();

  // Gold inner line.
  ctx.fillStyle = GOLD;
  roundRect(ctx, x - 2, y - 2, w + 4, h + 4, 1);
  ctx.fill();

  // Inner artwork "plate" — empty/recessed (no image).
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#2a3a36');
  g.addColorStop(0.5, '#162420');
  g.addColorStop(1, '#0b1411');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  // Vignette to make the empty art read as a depicted scene placeholder.
  const v = ctx.createRadialGradient(x + w / 2, y + h / 2, 60, x + w / 2, y + h / 2, w * 0.85);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = v;
  ctx.fillRect(x, y, w, h);
}

function drawEffectBox(ctx) {
  // Effect-text panel — cream/tan rectangle with a thin dark border.
  const x = 56, y = 700, w = W - 112, h = 268;

  // Dark border.
  ctx.fillStyle = '#0a0a0a';
  roundRect(ctx, x - 1.5, y - 1.5, w + 3, h + 3, 4);
  ctx.fill();

  // Cream interior.
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, CREAM);
  g.addColorStop(1, CREAM_LO);
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, 3);
  ctx.fill();

  // Faint paper grain.
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
    ctx.fillRect(x + Math.random() * w, y + Math.random() * h, 1, 1);
  }
  ctx.restore();

  // Type line, printed in bold black serif at the top of the cream panel.
  const padX = 20;
  ctx.save();
  ctx.fillStyle = '#0a0a0a';
  ctx.font =
    'bold 20px "ITC Stone Serif", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText('[ Spell Card / Continuous ]', x + padX, y + 14);
  ctx.restore();

  // Effect text — black, dense serif, below the type line.
  const effect = 'Hai portato le pizze e le birre, sei il top!';

  wrapText(ctx, effect, x + padX, y + 50, w - padX * 2, 25, {
    font:
      '18px "ITC Stone Serif", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif',
    color: '#0a0a0a',
  });
}

function drawBottomInfo(ctx) {
  // Tiny credits/serial line printed in white directly on the green frame
  // below the effect box.
  const y = H - 56;

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'middle';

  ctx.textAlign = 'left';
  ctx.fillText('CT-IT001', 56, y);

  ctx.textAlign = 'center';
  ctx.fillText('© CriticalTable', W / 2, y);

  ctx.textAlign = 'right';
  ctx.fillText('1ª Edizione', W - 56, y);
}

/* ---------- BACK ---------- */

function drawBack(ctx) {
  // Outer border.
  ctx.fillStyle = '#0a0a0a';
  roundRect(ctx, 0, 0, W, H, 30);
  ctx.fill();

  // Classic YGO back: warm orange-brown radial.
  const g = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, W * 0.85);
  g.addColorStop(0, '#c97a2a');
  g.addColorStop(0.55, '#7a3f10');
  g.addColorStop(1, '#2a1606');
  ctx.fillStyle = g;
  roundRect(ctx, 18, 18, W - 36, H - 36, 22);
  ctx.fill();

  // Center plate.
  ctx.save();
  ctx.translate(W / 2, H / 2);

  ctx.strokeStyle = '#f1d28b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 230, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#5a3f10';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 204, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#f6e3a8';
  ctx.font = 'bold 56px "ITC Stone Serif", "Cinzel", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('YU-GI-OH!', 0, -20);

  ctx.fillStyle = '#e8c46a';
  ctx.font = 'italic 22px "Palatino Linotype", serif';
  ctx.fillText('TRADING CARD GAME', 0, 30);

  ctx.translate(0, 110);
  ctx.strokeStyle = '#f1d28b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-44, 0);
  ctx.quadraticCurveTo(0, -36, 44, 0);
  ctx.quadraticCurveTo(0, 36, -44, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#f1d28b';
  ctx.fill();

  ctx.restore();
}

/* ---------- HELPERS ---------- */

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, opts = {}) {
  ctx.save();
  if (opts.font) ctx.font = opts.font;
  if (opts.color) ctx.fillStyle = opts.color;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  const words = text.split(' ');
  let line = '';
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = words[i];
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  ctx.restore();
}

export const CARD_ASPECT = W / H;
