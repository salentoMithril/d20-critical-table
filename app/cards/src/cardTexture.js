// Generates the front and back textures of the Magic: The Gathering style
// "CriticalTable" artifact card via Canvas 2D. Layout follows the classic
// artifact-frame structure: title bar, art window, type line, text box,
// and bottom info strip.

const W = 750;
const H = 1050;

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
  drawOuterBorder(ctx);
  drawArtifactFrame(ctx);
  drawTitleBar(ctx);
  drawArtWindow(ctx);
  drawTypeBar(ctx);
  drawTextBox(ctx);
  drawBottomInfo(ctx);
}

function drawOuterBorder(ctx) {
  ctx.fillStyle = '#0a0a0a';
  roundRect(ctx, 0, 0, W, H, 38);
  ctx.fill();
}

function drawArtifactFrame(ctx) {
  // Inner silver/gunmetal artifact frame.
  const inset = 22;
  const grad = ctx.createLinearGradient(0, inset, 0, H - inset);
  grad.addColorStop(0.0, '#b9b8b3');
  grad.addColorStop(0.25, '#8a8a86');
  grad.addColorStop(0.55, '#6e6e6a');
  grad.addColorStop(1.0, '#3c3d3b');
  ctx.fillStyle = grad;
  roundRect(ctx, inset, inset, W - inset * 2, H - inset * 2, 22);
  ctx.fill();

  // Subtle brushed metal sheen.
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let y = inset; y < H - inset; y += 3) {
    ctx.fillStyle = y % 6 === 0 ? '#ffffff' : '#000000';
    ctx.fillRect(inset, y, W - inset * 2, 1);
  }
  ctx.restore();
}

function drawTitleBar(ctx) {
  const x = 44, y = 50, w = W - 88, h = 70;
  drawPlate(ctx, x, y, w, h, 10);

  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 36px "Trajan Pro", "Cinzel", "Times New Roman", serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('CriticalTable', x + 22, y + h / 2 + 1);

  // Generic mana cost on the right side of the title plate: gray pip with "3".
  const r = 22;
  const cx = x + w - r - 14;
  const cy = y + h / 2;

  // Drop shadow.
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  // Gray pip with subtle radial gradient.
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.15, cx, cy, r);
  g.addColorStop(0, '#e8e8e6');
  g.addColorStop(0.55, '#9a9a96');
  g.addColorStop(1, '#5c5c58');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Thin dark outline.
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Number "3" centered in bold serif.
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 28px "Trajan Pro", "Cinzel", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('3', cx, cy + 1);
}

function drawArtWindow(ctx) {
  // Empty art window — no image, just a deep recessed plate.
  const x = 60, y = 138, w = W - 120, h = 410;
  ctx.save();
  ctx.fillStyle = '#1a1a1a';
  roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 6);
  ctx.fill();

  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#3a3d42');
  g.addColorStop(0.5, '#23262b');
  g.addColorStop(1, '#15171a');
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();

  const v = ctx.createRadialGradient(x + w / 2, y + h / 2, 50, x + w / 2, y + h / 2, w * 0.7);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.restore();
}

function drawTypeBar(ctx) {
  const x = 44, y = 562, w = W - 88, h = 56;
  drawPlate(ctx, x, y, w, h, 8);

  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 26px "Trajan Pro", "Cinzel", "Times New Roman", serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('Artefatto Leggendario', x + 22, y + h / 2 + 1);

  // Set-symbol disc on the right.
  const cx = x + w - 28, cy = y + h / 2;
  const grad = ctx.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, 14);
  grad.addColorStop(0, '#fff7c2');
  grad.addColorStop(0.6, '#c9a227');
  grad.addColorStop(1, '#5a4310');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawTextBox(ctx) {
  const x = 44, y = 638, w = W - 88, h = 320;

  ctx.save();
  ctx.fillStyle = '#161616';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();

  const inner = 6;
  const ix = x + inner, iy = y + inner, iw = w - inner * 2, ih = h - inner * 2;
  const g = ctx.createLinearGradient(0, iy, 0, iy + ih);
  g.addColorStop(0, '#ece4cf');
  g.addColorStop(1, '#c8bd9f');
  ctx.fillStyle = g;
  roundRect(ctx, ix, iy, iw, ih, 6);
  ctx.fill();

  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
    ctx.fillRect(ix + Math.random() * iw, iy + Math.random() * ih, 1, 1);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Tap symbol + effect text on a single line block.
  const padX = 26;
  const lineY = y + 56;
  const symbolSize = 38;

  drawTapSymbol(ctx, x + padX + symbolSize / 2, lineY, symbolSize / 2);

  ctx.fillStyle = '#1c1c1c';
  ctx.font = '24px "Garamond", "Georgia", serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(':', x + padX + symbolSize + 6, lineY + 1);

  const effect = 'Passa una bella serata con i tuoi nuovi amici!';
  const textX = x + padX + symbolSize + 24;
  const textW = w - (textX - x) - padX;
  wrapText(ctx, effect, textX, lineY - 8, textW, 30, {
    font: 'italic 24px "Garamond", "Georgia", serif',
    color: '#1c1c1c',
  });

  // Flavor separator.
  const sepY = y + 200;
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 30, sepY);
  ctx.lineTo(x + w - 30, sepY);
  ctx.stroke();

  wrapText(
    ctx,
    '« Il tavolo era apparecchiato. Mancavano solo i dadi. »',
    x + padX,
    sepY + 20,
    w - padX * 2,
    26,
    { font: 'italic 20px "Garamond", "Georgia", serif', color: '#2a2a2a' }
  );
}

function drawBottomInfo(ctx) {
  const y = H - 52;
  ctx.fillStyle = '#e8e8e6';
  ctx.font = '12px "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'middle';

  ctx.textAlign = 'left';
  ctx.fillText('001/001  •  CT  •  IT', 50, y);

  ctx.textAlign = 'center';
  ctx.fillText('CriticalTable', W / 2, y);

  ctx.textAlign = 'right';
  ctx.fillText('™ & © CriticalTable', W - 50, y);
}

/* ---------- TAP SYMBOL ---------- */

function drawTapSymbol(ctx, cx, cy, r) {
  ctx.save();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();

  const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.6, '#e6e6e6');
  grad.addColorStop(1, '#9a9a9a');
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Curved arrow on the disc, clockwise from 10 o'clock to 3 o'clock.
  const arcR = r * 0.48;
  const startAngle = (7 * Math.PI) / 6; // 10 o'clock in canvas coords
  const endAngle = 2 * Math.PI; // 3 o'clock

  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = r * 0.26;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, arcR, startAngle, endAngle);
  ctx.stroke();

  // Arrowhead at the 3 o'clock end, pointing along the tangent (downward),
  // nudged a few pixels left so the head sits clear of the disc edge.
  const headShiftX = -r * 0.18;
  const ex = cx + Math.cos(endAngle) * arcR + headShiftX;
  const ey = cy + Math.sin(endAngle) * arcR;
  const tx = -Math.sin(endAngle); // tangent direction (forward-clockwise)
  const ty = Math.cos(endAngle);
  const nx = Math.cos(endAngle); // radial outward
  const ny = Math.sin(endAngle);

  const headLen = r * 0.7;
  const headW = r * 0.7;

  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.moveTo(ex - nx * headW * 0.5, ey - ny * headW * 0.5);
  ctx.lineTo(ex + nx * headW * 0.5, ey + ny * headW * 0.5);
  ctx.lineTo(ex + tx * headLen, ey + ty * headLen);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/* ---------- BACK ---------- */

function drawBack(ctx) {
  ctx.fillStyle = '#0a0a0a';
  roundRect(ctx, 0, 0, W, H, 38);
  ctx.fill();

  const g = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, W * 0.85);
  g.addColorStop(0, '#3a2a1a');
  g.addColorStop(0.6, '#1a120a');
  g.addColorStop(1, '#080604');
  ctx.fillStyle = g;
  roundRect(ctx, 22, 22, W - 44, H - 44, 22);
  ctx.fill();

  ctx.save();
  ctx.translate(W / 2, H / 2);

  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 220, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#5a4310';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 196, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#ecd28a';
  ctx.font = 'bold 56px "Trajan Pro", "Cinzel", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CRITICAL', 0, -34);
  ctx.fillText('TABLE', 0, 36);

  ctx.fillStyle = '#c9a227';
  ctx.font = 'bold 30px serif';
  ctx.fillText('⚄  ⚂', 0, 130);

  ctx.restore();

  ctx.fillStyle = '#9a7a30';
  ctx.font = 'italic 18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('— il tavolo critico —', W / 2, H - 80);
}

/* ---------- HELPERS ---------- */

function drawPlate(ctx, x, y, w, h, r) {
  ctx.fillStyle = '#1a1a1a';
  roundRect(ctx, x - 3, y - 3, w + 6, h + 6, r + 2);
  ctx.fill();

  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#d8d6cf');
  g.addColorStop(0.5, '#a9a7a0');
  g.addColorStop(1, '#7a7873');
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, x + 2, y + 2, w - 4, h * 0.35, r - 2);
  ctx.fill();
}

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
