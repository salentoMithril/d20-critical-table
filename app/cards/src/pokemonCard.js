// Generates the front and back textures of a Pokémon TCG style card via
// Canvas 2D. Layout follows the classic modern Pokémon frame: yellow outer
// border, stage label + name + HP header, large gold-bordered artwork,
// species info strip, attack section with energy cost / name / damage /
// description, weakness-resistance-retreat row, and a bottom credit strip.

const W = 750;
const H = 1050;

// Pokémon TCG palette (Colorless type — neutral silver/cream).
const POKE_YELLOW = '#f5cc2b';
const POKE_YELLOW_LO = '#caa311';
const FRAME_HI = '#ece7d3';
const FRAME_MID = '#cfc7ac';
const FRAME_LO = '#9a8f6b';
const HP_RED = '#c61e1e';
const ATTACK_DARK = '#0e0e0e';
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
  drawYellowBorder(ctx);
  drawInnerFrame(ctx);
  drawHeader(ctx);
  drawArtWindow(ctx);
  drawSpeciesStrip(ctx);
  drawAttack(ctx);
  drawStatsRow(ctx);
  drawBottomInfo(ctx);
}

function drawYellowBorder(ctx) {
  // Outer thin black bevel.
  ctx.fillStyle = '#0a0a0a';
  roundRect(ctx, 0, 0, W, H, 32);
  ctx.fill();

  // Yellow card stock — the iconic Pokémon TCG border.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#fbe26b');
  g.addColorStop(0.5, POKE_YELLOW);
  g.addColorStop(1, POKE_YELLOW_LO);
  ctx.fillStyle = g;
  roundRect(ctx, 5, 5, W - 10, H - 10, 28);
  ctx.fill();

  // Subtle inner shadow line on the yellow border.
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  roundRect(ctx, 24.5, 24.5, W - 49, H - 49, 16);
  ctx.stroke();
}

function drawInnerFrame(ctx) {
  // Cream/silver inner panel for a Colorless-type frame.
  const x = 25, y = 25, w = W - 50, h = H - 50;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, FRAME_HI);
  g.addColorStop(0.5, FRAME_MID);
  g.addColorStop(1, FRAME_LO);
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();

  // Faint diagonal sheen.
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < h; i += 4) {
    ctx.fillStyle = i % 8 === 0 ? '#ffffff' : '#000000';
    ctx.fillRect(x, y + i, w, 1);
  }
  ctx.restore();
}

function drawHeader(ctx) {
  // Stage badge ("Basic"), Pokémon name, HP value, type icon.
  const xL = 50;
  const yTop = 44;

  // Stage badge: small dark pill.
  const stageText = 'Basic';
  ctx.save();
  ctx.font = 'bold 16px "Helvetica Neue", Arial, sans-serif';
  const stageW = ctx.measureText(stageText).width + 26;
  const stageH = 26;
  ctx.fillStyle = '#1f1f1f';
  roundRect(ctx, xL, yTop, stageW, stageH, 13);
  ctx.fill();
  ctx.fillStyle = '#f4d33a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(stageText, xL + stageW / 2, yTop + stageH / 2 + 1);
  ctx.restore();

  // Pokémon name — large bold serif.
  const nameY = yTop + stageH + 50;
  ctx.save();
  ctx.fillStyle = '#0e0e0e';
  ctx.font =
    'bold 44px "Gill Sans", "Futura", "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillText('CriticalTable', xL, nameY);
  ctx.restore();

  // HP block on the right: small "HP" + big red number.
  // Sits a few pixels higher than the name baseline for optical balance.
  const hpRight = W - 110; // leaves room for type icon
  const hpBaseline = nameY - 8;
  ctx.save();
  ctx.fillStyle = HP_RED;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'right';

  const hpNum = '90';
  ctx.font =
    'bold 44px "Gill Sans", "Futura", "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(hpNum, hpRight, hpBaseline);
  const hpNumW = ctx.measureText(hpNum).width;

  // "HP" label sits to the left of the number, smaller and aligned to its baseline.
  ctx.font =
    'bold 22px "Gill Sans", "Futura", "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('HP', hpRight - hpNumW - 6, hpBaseline);
  ctx.restore();

  // Type icon — Colorless silver disc — far top-right, raised to match HP.
  drawColorlessEnergy(ctx, W - 70, hpBaseline - 14, 22, { ring: true });
}

function drawArtWindow(ctx) {
  // Large art window with gold + black thin border.
  const x = 50, y = 130, w = W - 100, h = 500;

  // Black outer.
  ctx.fillStyle = '#0a0a0a';
  roundRect(ctx, x - 5, y - 5, w + 10, h + 10, 4);
  ctx.fill();

  // Gold band.
  const goldGrad = ctx.createLinearGradient(0, y - 4, 0, y + h + 4);
  goldGrad.addColorStop(0, '#f3da8a');
  goldGrad.addColorStop(0.5, GOLD);
  goldGrad.addColorStop(1, '#7a5a1c');
  ctx.fillStyle = goldGrad;
  roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 3);
  ctx.fill();

  // Inner thin black line.
  ctx.fillStyle = '#0a0a0a';
  roundRect(ctx, x - 1, y - 1, w + 2, h + 2, 2);
  ctx.fill();

  // Empty art plate.
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#3a4a4e');
  g.addColorStop(0.5, '#1f2c30');
  g.addColorStop(1, '#0d1518');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  // Vignette.
  const v = ctx.createRadialGradient(x + w / 2, y + h / 2, 60, x + w / 2, y + h / 2, w * 0.85);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = v;
  ctx.fillRect(x, y, w, h);
}

function drawSpeciesStrip(ctx) {
  // Thin info strip below the art: species + dex number + height + weight.
  const x = 50;
  const y = 654;
  const w = W - 100;

  // Faint divider lines top & bottom.
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + 28);
  ctx.lineTo(x + w, y + 28);
  ctx.stroke();

  ctx.save();
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'italic 14px "Times New Roman", Georgia, serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('Pokémon Conviviale.  NO. 001   HT: 1\'00"   WT: 22 lbs.', x + 6, y + 14);
  ctx.restore();
}

function drawAttack(ctx) {
  // Single attack. Energy cost (left) + name (center-left) + damage (right),
  // then a description block below.
  const xL = 50;
  const xR = W - 50;
  const rowY = 712;

  // Energy cost: 2 Colorless circles.
  const eR = 19;
  drawColorlessEnergy(ctx, xL + eR, rowY + eR, eR);
  drawColorlessEnergy(ctx, xL + eR + eR * 2 + 6, rowY + eR, eR);

  // Attack name.
  ctx.save();
  ctx.fillStyle = ATTACK_DARK;
  ctx.font =
    'bold 28px "Gill Sans", "Futura", "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('Vittoria turno 2', xL + eR * 4 + 30, rowY + eR);
  ctx.restore();

  // Damage value.
  ctx.save();
  ctx.fillStyle = ATTACK_DARK;
  ctx.font =
    'bold 36px "Gill Sans", "Futura", "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  ctx.fillText('250', xR, rowY + eR);
  ctx.restore();

  // Description.
  wrapText(
    ctx,
    'Mi sa che non sarai simpatico a tutti',
    xL + 6,
    rowY + eR * 2 + 18,
    xR - xL - 12,
    28,
    {
      font: 'bold 24px "Times New Roman", Georgia, serif',
      color: '#1a1a1a',
    }
  );
}

function drawStatsRow(ctx) {
  // Bottom thin row split in three: Weakness | Resistance | Retreat.
  const x = 50;
  const y = 920;
  const w = W - 100;
  const h = 56;

  // Top divider.
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  // Bottom divider.
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();

  // Column dividers.
  const c1 = x + w / 3;
  const c2 = x + (w * 2) / 3;
  ctx.beginPath();
  ctx.moveTo(c1, y);
  ctx.lineTo(c1, y + h);
  ctx.moveTo(c2, y);
  ctx.lineTo(c2, y + h);
  ctx.stroke();

  // Labels.
  ctx.save();
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '11px "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.fillText('weakness', x + (w / 3) / 2, y + 4);
  ctx.fillText('resistance', x + w / 2, y + 4);
  ctx.fillText('retreat cost', x + w - (w / 3) / 2, y + 4);
  ctx.restore();

  // Weakness: Lightning ×2.
  const wkCx = x + (w / 3) / 2;
  const wkCy = y + 36;
  drawLightningEnergy(ctx, wkCx - 18, wkCy, 14);
  ctx.save();
  ctx.fillStyle = '#1a1a1a';
  ctx.font =
    'bold 20px "Gill Sans", "Futura", "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('×2', wkCx + 2, wkCy);
  ctx.restore();

  // Resistance: empty/none — single dash.
  ctx.save();
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 22px "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText('—', x + w / 2, y + 36);
  ctx.restore();

  // Retreat: 1 Colorless energy ball.
  const rtCx = x + w - (w / 3) / 2;
  drawColorlessEnergy(ctx, rtCx, y + 36, 14);
}

function drawBottomInfo(ctx) {
  const y = H - 36;

  ctx.save();
  ctx.fillStyle = '#0e0e0e';
  ctx.font = 'bold 11px "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'middle';

  ctx.textAlign = 'left';
  ctx.fillText('Illus. canvas', 50, y);

  // Set code + collector number, center.
  ctx.textAlign = 'center';
  ctx.fillText('CT  001/100', W / 2, y);

  // Copyright on the right.
  ctx.textAlign = 'right';
  ctx.fillText('©2026 CriticalTable', W - 50, y);
  ctx.restore();
}

/* ---------- ENERGY ICONS ---------- */

function drawColorlessEnergy(ctx, cx, cy, r, opts = {}) {
  ctx.save();

  // Outer dark ring.
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Silver/white sphere.
  const g = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.55, '#dcdad2');
  g.addColorStop(1, '#8b8775');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  if (opts.ring) {
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Specular highlight.
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.32, cy - r * 0.45, r * 0.34, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4-point star glyph.
  ctx.fillStyle = '#3a3a36';
  const r2 = r * 0.6;
  const r1 = r * 0.18;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const rad = i % 2 === 0 ? r2 : r1;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawLightningEnergy(ctx, cx, cy, r) {
  ctx.save();

  // Outer dark ring.
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Yellow sphere.
  const g = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#fff79a');
  g.addColorStop(0.55, '#f3c91f');
  g.addColorStop(1, '#8e6a00');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight.
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.32, cy - r * 0.45, r * 0.34, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lightning bolt glyph.
  ctx.fillStyle = '#3a2400';
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.05, cy - r * 0.6);
  ctx.lineTo(cx - r * 0.5, cy + r * 0.1);
  ctx.lineTo(cx - r * 0.05, cy + r * 0.1);
  ctx.lineTo(cx - r * 0.25, cy + r * 0.6);
  ctx.lineTo(cx + r * 0.5, cy - r * 0.05);
  ctx.lineTo(cx + r * 0.05, cy - r * 0.05);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/* ---------- BACK ---------- */

function drawBack(ctx) {
  // Outer bevel.
  ctx.fillStyle = '#0a0a0a';
  roundRect(ctx, 0, 0, W, H, 32);
  ctx.fill();

  // Classic Pokémon-card-back navy/red field.
  const g = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, W * 0.85);
  g.addColorStop(0, '#2b3a8a');
  g.addColorStop(0.55, '#15224f');
  g.addColorStop(1, '#08102a');
  ctx.fillStyle = g;
  roundRect(ctx, 18, 18, W - 36, H - 36, 22);
  ctx.fill();

  // Center white plate with red disc — evocative of the classic back.
  ctx.save();
  ctx.translate(W / 2, H / 2);

  // Outer cream ring.
  ctx.fillStyle = '#f3ead0';
  ctx.beginPath();
  ctx.arc(0, 0, 230, 0, Math.PI * 2);
  ctx.fill();

  // Ball top half (red).
  ctx.fillStyle = '#c61e1e';
  ctx.beginPath();
  ctx.arc(0, 0, 200, Math.PI, 0, false);
  ctx.fill();

  // Ball bottom half (white).
  ctx.fillStyle = '#f8f6e8';
  ctx.beginPath();
  ctx.arc(0, 0, 200, 0, Math.PI, false);
  ctx.fill();

  // Center horizontal black band.
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(-200, -16, 400, 32);

  // Center small white circle with black outer ring.
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.arc(0, 0, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f8f6e8';
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Top + bottom legend lines.
  ctx.save();
  ctx.fillStyle = '#f3da8a';
  ctx.font = 'bold 30px "Gill Sans", "Futura", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CRITICAL · TABLE', W / 2, 110);
  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillStyle = '#cdb877';
  ctx.fillText('— trading card game —', W / 2, H - 90);
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
