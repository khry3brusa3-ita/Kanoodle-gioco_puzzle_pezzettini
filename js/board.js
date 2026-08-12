// board.js
// Stato della griglia di gioco: quali celle sono occupate e da quale pezzo.
// Non conosce il concetto di "vassoio": si occupa solo del campo.
// Script classico (vedi nota in geometry.js sul perche' niente import/export).
(function () {

class Board {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  }

  /**
   * Verifica se `piece` (oggetto con .id e .cells) puo' essere collocato
   * con il suo angolo in alto a sinistra in (anchorX, anchorY).
   * `ignoreId` esclude dal controllo le celle gia' occupate dallo stesso
   * pezzo (utile quando lo si sta spostando/ruotando).
   */
  canPlace(piece, anchorX, anchorY, ignoreId = piece.id) {
    for (const [dx, dy] of piece.cells) {
      const x = anchorX + dx;
      const y = anchorY + dy;
      if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
      const occupant = this.grid[y][x];
      if (occupant !== null && occupant !== ignoreId) return false;
    }
    return true;
  }

  /** Rimuove ogni cella occupata dal pezzo con id `pieceId`, se presente. */
  clear(pieceId) {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] === pieceId) this.grid[y][x] = null;
      }
    }
  }

  /**
   * Colloca `piece` con angolo in (anchorX, anchorY). Non verifica la
   * validita': va chiamato canPlace() prima. Aggiorna anche piece.anchor.
   */
  place(piece, anchorX, anchorY) {
    this.clear(piece.id);
    for (const [dx, dy] of piece.cells) {
      this.grid[anchorY + dy][anchorX + dx] = piece.id;
    }
    piece.anchor = { x: anchorX, y: anchorY };
  }

  /** Numero di celle occupate sull'intero campo. */
  filledCount() {
    let n = 0;
    for (const row of this.grid) {
      for (const cell of row) if (cell !== null) n++;
    }
    return n;
  }

  get totalCells() {
    return this.cols * this.rows;
  }

  isFull() {
    return this.filledCount() === this.totalCells;
  }
}

  window.Sfere = window.Sfere || {};
  window.Sfere.Board = Board;
})();
