// pieces.js
// Le 12 forme sono state ricavate osservando il vassoio completo nelle foto
// fornite (tutte le 55 celle occupate, un colore per pezzo) e verificate
// contando le celle per colore: 5+5+5+5+4+5+4+5+3+4+5+5 = 55, coerente con
// un campo 5 x 11. Coordinate in celle unitarie, forma normalizzata
// (minX = minY = 0). Ogni pezzo qui e' definito nella sua orientazione
// "di base", quella mostrata nel vassoio.
// Script classico (vedi nota in geometry.js sul perche' niente import/export).
(function () {

const BOARD_COLS = 5;
const BOARD_ROWS = 11;

const PIECE_DEFINITIONS = [
  {
    id: 1,
    name: 'Rosso',
    color: '#E8434B',
    cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1]],
  },
  {
    id: 2,
    name: 'Viola',
    color: '#7A3B8F',
    cells: [[2, 0], [1, 1], [2, 1], [0, 2], [1, 2]],
  },
  {
    id: 3,
    name: 'Lime',
    color: '#9BC53D',
    cells: [[0, 0], [1, 0], [0, 1], [0, 2], [1, 2]],
  },
  {
    id: 4,
    name: 'Menta',
    color: '#3FCF9E',
    cells: [[1, 0], [0, 1], [1, 1], [0, 2], [1, 2]],
  },
  {
    id: 5,
    name: 'Blu Notte',
    color: '#38408F',
    cells: [[0, 0], [0, 1], [0, 2], [1, 2]],
  },
  {
    id: 6,
    name: 'Arancione',
    color: '#F5A21E',
    cells: [[2, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
  },
  {
    id: 7,
    name: 'Bordeaux',
    color: '#A32638',
    cells: [[1, 0], [2, 0], [0, 1], [1, 1]],
  },
  {
    id: 8,
    name: 'Giallo',
    color: '#FFCB3D',
    cells: [[0, 0], [0, 1], [1, 1], [0, 2], [0, 3]],
  },
  {
    id: 9,
    name: 'Azzurro',
    color: '#35B6E8',
    cells: [[1, 0], [0, 1], [1, 1]],
  },
  {
    id: 10,
    name: 'Verde Scuro',
    color: '#189A8C',
    cells: [[1, 0], [0, 1], [1, 1], [2, 1]],
  },
  {
    id: 11,
    name: 'Blu Reale',
    color: '#2B6CD4',
    cells: [[2, 0], [2, 1], [0, 2], [1, 2], [2, 2]],
  },
  {
    id: 12,
    name: 'Rosa',
    color: '#EF6FA0',
    cells: [[1, 0], [2, 0], [3, 0], [0, 1], [1, 1]],
  },
];

  window.Sfere = window.Sfere || {};
  window.Sfere.BOARD_COLS = BOARD_COLS;
  window.Sfere.BOARD_ROWS = BOARD_ROWS;
  window.Sfere.PIECE_DEFINITIONS = PIECE_DEFINITIONS;
})();
