// geometry.js
// Funzioni pure per manipolare le forme dei pezzi, espresse come array di
// coppie [x, y] (coordinate intere relative, griglia a celle unitarie).
//
// Script classico (non module): niente import/export, cosi' funziona anche
// caricato da file:// (i moduli ES vengono bloccati dal CORS quando la
// pagina e' aperta come file locale, sia nel browser sia dentro pywebview).
(function () {
  /**
   * Riporta una forma in posizione "canonica": il minimo x e il minimo y
   * diventano 0. Va richiamata dopo ogni rotazione/specchiatura.
   */
  function normalize(cells) {
    const minX = Math.min(...cells.map(([x]) => x));
    const minY = Math.min(...cells.map(([, y]) => y));
    return cells.map(([x, y]) => [x - minX, y - minY]);
  }

  /**
   * Ruota la forma di 90 gradi in senso orario (come appare a video, dove
   * l'asse y cresce verso il basso) e la rinormalizza.
   */
  function rotateCW(cells) {
    const rotated = cells.map(([x, y]) => [-y, x]);
    return normalize(rotated);
  }

  /** Specchia la forma orizzontalmente (asse verticale) e la rinormalizza. */
  function flipH(cells) {
    const flipped = cells.map(([x, y]) => [-x, y]);
    return normalize(flipped);
  }

  /** Larghezza (in celle) del riquadro che contiene la forma. */
  function shapeWidth(cells) {
    return Math.max(...cells.map(([x]) => x)) + 1;
  }

  /** Altezza (in celle) del riquadro che contiene la forma. */
  function shapeHeight(cells) {
    return Math.max(...cells.map(([, y]) => y)) + 1;
  }

  /**
   * Elenca le coppie di celle adiacenti (ortogonalmente) della stessa forma,
   * usate per disegnare i "colli" che collegano le sfere di un pezzo.
   * Ogni coppia viene restituita una sola volta.
   */
  function adjacentPairs(cells) {
    const set = new Set(cells.map(([x, y]) => `${x},${y}`));
    const pairs = [];
    for (const [x, y] of cells) {
      if (set.has(`${x + 1},${y}`)) pairs.push([[x, y], [x + 1, y]]);
      if (set.has(`${x},${y + 1}`)) pairs.push([[x, y], [x, y + 1]]);
    }
    return pairs;
  }

  /** Confronta due forme cella-per-cella (ordine indipendente). */
  function sameShape(cellsA, cellsB) {
    if (cellsA.length !== cellsB.length) return false;
    const setB = new Set(cellsB.map(([x, y]) => `${x},${y}`));
    return cellsA.every(([x, y]) => setB.has(`${x},${y}`));
  }

  window.Sfere = window.Sfere || {};
  window.Sfere.Geometry = {
    normalize, rotateCW, flipH, shapeWidth, shapeHeight, adjacentPairs, sameShape,
  };
})();
