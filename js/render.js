// render.js
// Genera markup SVG per pezzi (sfere + colli di collegamento) e per i pioli
// del campo. Le coordinate sono sempre in "celle unitarie": una sfera nella
// cella (x, y) ha centro in (x + 0.5, y + 0.5). Il viewBox del contenitore
// SVG traduce queste unita' in pixel reali.
// Script classico (vedi nota in geometry.js sul perche' niente import/export).
(function () {

const { adjacentPairs, shapeWidth, shapeHeight } = window.Sfere.Geometry;

const CIRCLE_R = 0.40;
const NECK_WIDTH = 0.70;
const PIECE_STROKE = 0.032;

/** Scurisce (percent negativa) o schiarisce (percent positiva) un colore hex. */
function shade(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${(1 << 24 | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/**
 * Rileva i blocchi 2x2 di celle tutte appartenenti alla stessa forma: nel
 * punto d'incrocio tra 4 sfere adiacenti in quadrato resta altrimenti un
 * piccolo spazio scoperto (nessun cerchio ne' collo lo raggiunge). Restituisce
 * il centro (x, y) di ogni incrocio da tappare con un piccolo riempimento.
 */
function innerJunctions(cells) {
  const set = new Set(cells.map(([x, y]) => `${x},${y}`));
  const junctions = [];
  for (const [x, y] of cells) {
    if (set.has(`${x + 1},${y}`) && set.has(`${x},${y + 1}`) && set.has(`${x + 1},${y + 1}`)) {
      junctions.push([x + 1, y + 1]);
    }
  }
  return junctions;
}

/**
 * Markup interno (senza <svg> wrapper) per una forma: colli sotto, sfere
 * sopra, con un riflesso lucido per dare l'effetto plastica del set fisico.
 */
function pieceGroupMarkup(cells, color) {
  const strokeColor = shade(color, -22);
  let s = '';

  for (const [[ax, ay], [bx, by]] of adjacentPairs(cells)) {
    s += `<line x1="${ax + 0.5}" y1="${ay + 0.5}" x2="${bx + 0.5}" y2="${by + 0.5}" ` +
      `stroke="${color}" stroke-width="${NECK_WIDTH}" stroke-linecap="round" />`;
  }

  for (const [jx, jy] of innerJunctions(cells)) {
    s += `<circle cx="${jx}" cy="${jy}" r="${NECK_WIDTH / 2}" fill="${color}" />`;
  }

  for (const [x, y] of cells) {
    const cx = x + 0.5;
    const cy = y + 0.5;
    s += `<circle cx="${cx}" cy="${cy}" r="${CIRCLE_R}" fill="${color}" ` +
      `stroke="${strokeColor}" stroke-width="${PIECE_STROKE}" />`;
    s += `<circle cx="${cx}" cy="${cy}" r="${CIRCLE_R}" fill="url(#glossHighlight)" />`;
  }

  return s;
}

/**
 * Un pezzo come elemento <svg> autonomo, dimensionato in pixel — usato nel
 * vassoio e nel "fantasma" che segue il puntatore durante il trascinamento.
 */
function pieceStandaloneSVG(cells, color, cellPx, pieceId) {
  const w = shapeWidth(cells);
  const h = shapeHeight(cells);
  return `<svg class="piece-svg" viewBox="0 0 ${w} ${h}" ` +
    `width="${w * cellPx}" height="${h * cellPx}" data-piece-id="${pieceId}">` +
    `${pieceGroupMarkup(cells, color)}</svg>`;
}

/** Pezzo come gruppo <g> traslato, da inserire nel layer del campo. */
function pieceBoardGroup(cells, color, pieceId, anchorX, anchorY, selected) {
  const cls = selected ? 'piece-group selected' : 'piece-group';
  return `<g class="${cls}" data-piece-id="${pieceId}" transform="translate(${anchorX},${anchorY})">` +
    `${pieceGroupMarkup(cells, color)}</g>`;
}

/** Livello statico dei pioli (fori) del campo, uno per cella. */
function pegsLayerMarkup(cols, rows) {
  let s = '';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      s += `<circle class="peg" data-x="${x}" data-y="${y}" ` +
        `cx="${x + 0.5}" cy="${y + 0.5}" r="0.30" />`;
    }
  }
  return s;
}

  window.Sfere = window.Sfere || {};
  window.Sfere.Render = {
    pieceGroupMarkup, pieceStandaloneSVG, pieceBoardGroup, pegsLayerMarkup,
  };
})();
