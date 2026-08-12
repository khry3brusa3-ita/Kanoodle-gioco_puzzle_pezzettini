// main.js
// Punto di ingresso: tiene lo stato di gioco e collega gli eventi di
// interfaccia (click, trascinamento, tastiera) alla logica in board.js /
// geometry.js, delegando il disegno a render.js.
// Script classico (vedi nota in geometry.js sul perche' niente import/export);
// va caricato per ultimo, dopo geometry.js, pieces.js, board.js, render.js.
(function () {

const { PIECE_DEFINITIONS, BOARD_COLS, BOARD_ROWS, Board, Geometry, Render } = window.Sfere;
const { rotateCW, flipH, shapeWidth, shapeHeight } = Geometry;
const { pieceStandaloneSVG, pieceBoardGroup, pegsLayerMarkup } = Render;

const BOARD_CELL_PX = 48;
const TRAY_CELL_PX = 27;
const DRAG_THRESHOLD_PX = 4;

class PieceInstance {
  constructor(def) {
    this.id = def.id;
    this.name = def.name;
    this.color = def.color;
    this.baseCells = def.cells.map((c) => [...c]);
    this.cells = def.cells.map((c) => [...c]);
    this.location = 'tray'; // 'tray' | 'board'
    this.anchor = null; // { x, y } quando e' sul campo
    this.dragging = false;
  }
}

const board = new Board(BOARD_COLS, BOARD_ROWS);
const pieces = PIECE_DEFINITIONS.map((def) => new PieceInstance(def));

let selectedId = null;
let dragState = null;

const boardSvg = document.getElementById('boardSvg');
const piecesLayer = () => document.getElementById('piecesLayer');
const trayContainer = document.getElementById('trayContainer');
const fillCounter = document.getElementById('fillCounter');
const toolbar = document.getElementById('selectionToolbar');
const completeToast = document.getElementById('completeToast');

function findPiece(id) {
  return pieces.find((p) => p.id === id) || null;
}

// ---------------------------------------------------------------------
// Inizializzazione campo
// ---------------------------------------------------------------------

function initBoardSvg() {
  boardSvg.setAttribute('viewBox', `0 0 ${BOARD_COLS} ${BOARD_ROWS}`);
  boardSvg.style.width = `${BOARD_COLS * BOARD_CELL_PX}px`;
  boardSvg.style.height = `${BOARD_ROWS * BOARD_CELL_PX}px`;
  boardSvg.innerHTML =
    `<g class="pegs-layer">${pegsLayerMarkup(BOARD_COLS, BOARD_ROWS)}</g>` +
    `<g class="pieces-layer" id="piecesLayer"></g>`;
}

// ---------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------

function renderTray() {
  trayContainer.innerHTML = '';
  const trayPieces = pieces.filter((p) => p.location === 'tray' && !p.dragging);
  for (const piece of trayPieces) {
    const item = document.createElement('div');
    item.className = 'tray-item' + (piece.id === selectedId ? ' selected' : '');
    item.dataset.pieceId = String(piece.id);
    item.innerHTML =
      pieceStandaloneSVG(piece.cells, piece.color, TRAY_CELL_PX, piece.id) +
      `<span class="tray-item-badge">${piece.id}</span>`;
    trayContainer.appendChild(item);
  }
  document.getElementById('trayEmptyHint').classList.toggle('hidden', trayPieces.length > 0);
}

function renderPiecesLayer() {
  let html = '';
  for (const piece of pieces) {
    if (piece.location !== 'board' || piece.dragging) continue;
    html += pieceBoardGroup(
      piece.cells, piece.color, piece.id,
      piece.anchor.x, piece.anchor.y, piece.id === selectedId,
    );
  }
  piecesLayer().innerHTML = html;
}

function renderFillCounter() {
  const filled = board.filledCount();
  fillCounter.textContent = `${filled} / ${board.totalCells}`;
  fillCounter.classList.toggle('is-complete', filled === board.totalCells);
  if (filled === board.totalCells) {
    showCompleteToast();
  } else {
    completeToast.classList.remove('show');
  }
}

let toastTimer = null;
function showCompleteToast() {
  completeToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => completeToast.classList.remove('show'), 3200);
}

function renderAll() {
  renderTray();
  renderPiecesLayer();
  renderFillCounter();
  updateToolbar();
}

// ---------------------------------------------------------------------
// Selezione
// ---------------------------------------------------------------------

function deselect() {
  if (selectedId === null) return;
  selectedId = null;
  renderTray();
  renderPiecesLayer();
  updateToolbar();
}

function updateToolbar() {
  toolbar.classList.toggle('hidden', selectedId === null);
}

// ---------------------------------------------------------------------
// Rotazione / specchiatura / rimozione
// ---------------------------------------------------------------------

function applyTransform(piece, newCells) {
  if (piece.location === 'tray') {
    piece.cells = newCells;
    renderTray();
    return;
  }

  const maxX = Math.max(...newCells.map(([x]) => x));
  const maxY = Math.max(...newCells.map(([, y]) => y));
  let ax = Math.min(piece.anchor.x, board.cols - 1 - maxX);
  let ay = Math.min(piece.anchor.y, board.rows - 1 - maxY);
  ax = Math.max(ax, 0);
  ay = Math.max(ay, 0);

  if (board.canPlace({ id: piece.id, cells: newCells }, ax, ay)) {
    piece.cells = newCells;
    board.place(piece, ax, ay);
    renderPiecesLayer();
    renderFillCounter();
  } else {
    flashInvalid();
  }
}

function flashInvalid() {
  toolbar.classList.remove('shake');
  // forza il reflow cosi' l'animazione puo' ripartire da capo
  void toolbar.offsetWidth;
  toolbar.classList.add('shake');
}

function removeToTray(piece) {
  if (piece.location === 'board') {
    board.clear(piece.id);
    piece.cells = piece.baseCells.map((c) => [...c]);
  }
  piece.location = 'tray';
  piece.anchor = null;
}

document.getElementById('rotateBtn').addEventListener('click', () => {
  const piece = findPiece(selectedId);
  if (piece) applyTransform(piece, rotateCW(piece.cells));
});

document.getElementById('flipBtn').addEventListener('click', () => {
  const piece = findPiece(selectedId);
  if (piece) applyTransform(piece, flipH(piece.cells));
});

document.getElementById('removeBtn').addEventListener('click', () => {
  const piece = findPiece(selectedId);
  if (!piece) return;
  removeToTray(piece);
  renderAll();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  for (const piece of pieces) removeToTray(piece);
  selectedId = null;
  renderAll();
});

window.addEventListener('keydown', (e) => {
  if (selectedId === null) return;
  const key = e.key.toLowerCase();
  if (key === 'r') document.getElementById('rotateBtn').click();
  else if (key === 'f') document.getElementById('flipBtn').click();
  else if (key === 'delete' || key === 'backspace') {
    e.preventDefault();
    document.getElementById('removeBtn').click();
  } else if (key === 'escape') deselect();
});

// ---------------------------------------------------------------------
// Trascinamento (pointer events, unificato mouse/touch)
// ---------------------------------------------------------------------

function positionGhost(e) {
  const { ghostEl, grabFraction } = dragState;
  const w = ghostEl.firstElementChild.width.baseVal.value;
  const h = ghostEl.firstElementChild.height.baseVal.value;
  ghostEl.style.left = `${e.clientX - grabFraction.x * w}px`;
  ghostEl.style.top = `${e.clientY - grabFraction.y * h}px`;
}

function clearHighlights() {
  boardSvg.querySelectorAll('.peg.highlight-valid, .peg.highlight-invalid')
    .forEach((el) => el.classList.remove('highlight-valid', 'highlight-invalid'));
}

function highlightTarget(piece, ax, ay, valid) {
  for (const [dx, dy] of piece.cells) {
    const peg = boardSvg.querySelector(`.peg[data-x="${ax + dx}"][data-y="${ay + dy}"]`);
    if (peg) peg.classList.add(valid ? 'highlight-valid' : 'highlight-invalid');
  }
}

function computeDropTarget(e) {
  const piece = dragState.piece;
  const boardRect = boardSvg.getBoundingClientRect();
  const overBoard = e.clientX >= boardRect.left && e.clientX <= boardRect.right &&
    e.clientY >= boardRect.top && e.clientY <= boardRect.bottom;

  clearHighlights();
  dragState.overBoard = overBoard;
  if (!overBoard) {
    dragState.targetAnchor = null;
    dragState.targetValid = false;
    return;
  }

  const cellPx = boardRect.width / BOARD_COLS;
  const pieceWidthPx = shapeWidth(piece.cells) * BOARD_CELL_PX;
  const pieceHeightPx = shapeHeight(piece.cells) * BOARD_CELL_PX;
  const topLeftX = e.clientX - dragState.grabFraction.x * pieceWidthPx;
  const topLeftY = e.clientY - dragState.grabFraction.y * pieceHeightPx;
  let ax = Math.round((topLeftX - boardRect.left) / cellPx);
  let ay = Math.round((topLeftY - boardRect.top) / cellPx);

  const maxX = Math.max(...piece.cells.map(([x]) => x));
  const maxY = Math.max(...piece.cells.map(([, y]) => y));
  ax = Math.max(0, Math.min(ax, BOARD_COLS - 1 - maxX));
  ay = Math.max(0, Math.min(ay, BOARD_ROWS - 1 - maxY));

  const valid = board.canPlace(piece, ax, ay);
  dragState.targetAnchor = { x: ax, y: ay };
  dragState.targetValid = valid;
  highlightTarget(piece, ax, ay, valid);
}

function onPointerDown(e) {
  const el = e.target.closest('[data-piece-id]');
  if (!el) {
    // clic su un'area vuota (non un pezzo, non la barra di selezione): deseleziona
    if (selectedId !== null && !e.target.closest('#selectionToolbar')) deselect();
    return;
  }
  if (e.pointerType === 'mouse' && e.button !== 0) return;

  const piece = findPiece(Number(el.dataset.pieceId));
  if (!piece) return;
  e.preventDefault();

  // Legge la posizione dell'elemento PRIMA di ridisegnare qualunque cosa:
  // qualsiasi render successivo crea nuovi nodi DOM e renderebbe 'el' un
  // riferimento non piu' agganciato al documento (il suo rect sarebbe 0,0).
  // Il punto di presa e' salvato come FRAZIONE (0..1) della dimensione
  // dell'elemento sorgente, non in pixel assoluti: il vassoio disegna i
  // pezzi a TRAY_CELL_PX ma il fantasma/campo usano BOARD_CELL_PX, quindi
  // un offset in pixel misurato sul vassoio non avrebbe senso alla scala
  // del campo.
  const rect = el.getBoundingClientRect();
  const grabFraction = {
    x: (e.clientX - rect.left) / rect.width,
    y: (e.clientY - rect.top) / rect.height,
  };

  dragState = {
    piece,
    grabFraction,
    startX: e.clientX,
    startY: e.clientY,
    moved: false,
    fromLocation: piece.location,
    fromAnchor: piece.anchor ? { ...piece.anchor } : null,
    overBoard: false,
    targetAnchor: null,
    targetValid: false,
  };

  selectedId = piece.id;
  piece.dragging = true;
  if (piece.location === 'board') board.clear(piece.id);
  renderTray();
  renderPiecesLayer();
  updateToolbar();

  const ghost = document.createElement('div');
  ghost.className = 'drag-ghost';
  ghost.innerHTML = pieceStandaloneSVG(piece.cells, piece.color, BOARD_CELL_PX, piece.id);
  document.body.appendChild(ghost);
  dragState.ghostEl = ghost;
  positionGhost(e);

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp, { once: true });
}

function onPointerMove(e) {
  if (!dragState) return;
  const dx = e.clientX - dragState.startX;
  const dy = e.clientY - dragState.startY;
  if (!dragState.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) dragState.moved = true;
  positionGhost(e);
  if (dragState.moved) computeDropTarget(e);
}

function isPointOverTray(e) {
  const rect = trayContainer.getBoundingClientRect();
  return e.clientX >= rect.left && e.clientX <= rect.right &&
    e.clientY >= rect.top && e.clientY <= rect.bottom;
}

function onPointerUp(e) {
  window.removeEventListener('pointermove', onPointerMove);
  if (!dragState) return;

  const { piece, ghostEl } = dragState;
  clearHighlights();
  ghostEl.remove();
  piece.dragging = false;

  if (!dragState.moved) {
    // Era solo un click di selezione: ripristina lo stato senza modifiche.
    if (dragState.fromLocation === 'board') board.place(piece, dragState.fromAnchor.x, dragState.fromAnchor.y);
    piece.location = dragState.fromLocation;
    dragState = null;
    renderAll();
    return;
  }

  if (dragState.overBoard && dragState.targetValid && dragState.targetAnchor) {
    board.place(piece, dragState.targetAnchor.x, dragState.targetAnchor.y);
    piece.location = 'board';
  } else if (isPointOverTray(e)) {
    removeToTray(piece);
  } else if (dragState.fromLocation === 'board') {
    board.place(piece, dragState.fromAnchor.x, dragState.fromAnchor.y);
    piece.location = 'board';
  } else {
    piece.location = 'tray';
  }

  dragState = null;
  renderAll();
}

document.addEventListener('pointerdown', onPointerDown);

// ---------------------------------------------------------------------
// Avvio
// ---------------------------------------------------------------------

initBoardSvg();
renderAll();

})();
