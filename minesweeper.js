// Logic

export const TILE_STATUSES = {
  HIDDEN: "hidden",
  MINE: "mine",
  MARKED: "marked",
  NUMBER: "number",
};

///////////////////////////////////////////////////
// Helper functions
const randomNumber = function (size) {
  return Math.floor(Math.random() * size);
};

const positionMatch = function (a, b) {
  return a.x === b.x && a.y === b.y;
};

// Get positions for mines
const getMinePositions = function (boardSize, numberOfMines) {
  const positions = [];

  while (positions.length < numberOfMines) {
    const position = {
      x: randomNumber(boardSize),
      y: randomNumber(boardSize),
    };

    // If previously no mine, then set the tile as mine
    if (!positions.some((p) => positionMatch(position, p))) {
      positions.push(position);
    }
  }

  return positions;
};

const nearbyTiles = function (board, { x, y }) {
  const tiles = [];

  for (let xOffset = -1; xOffset <= 1; xOffset++) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      const tile = board[x + xOffset]?.[y + yOffset];

      if (tile) tiles.push(tile);
    }
  }

  return tiles;
};

///////////////////////////////////////////////////
export const createBoard = function (boardSize, numberOfMines) {
  const board = [];
  const minePositions = getMinePositions(boardSize, numberOfMines);

  // Row
  for (let x = 0; x < boardSize; x++) {
    const row = [];

    // Tile
    for (let y = 0; y < boardSize; y++) {
      const element = document.createElement("div");
      element.dataset.status = TILE_STATUSES.HIDDEN;

      const tile = {
        element,
        x,
        y,
        mine: minePositions.some((p) => positionMatch({ x, y }, p)),
        get status() {
          return this.element.dataset.status;
        },
        set status(value) {
          this.element.dataset.status = value;
        },
      };

      row.push(tile);
    }
    board.push(row);
  }
  return board;
};

export const markTile = function (tile) {
  if (
    tile.status !== TILE_STATUSES.HIDDEN &&
    tile.status !== TILE_STATUSES.MARKED
  )
    return;

  if (tile.status === TILE_STATUSES.MARKED) tile.status = TILE_STATUSES.HIDDEN;
  else tile.status = TILE_STATUSES.MARKED;
};

export const revealTile = function (board, tile) {
  if (tile.status !== TILE_STATUSES.HIDDEN) return;

  if (tile.mine) {
    tile.status = TILE_STATUSES.MINE;
    return;
  }
  tile.status = TILE_STATUSES.NUMBER;

  const adjacentTiles = nearbyTiles(board, tile);
  const mines = adjacentTiles.filter((tile) => tile.mine);

  if (mines.length === 0) {
    // adjacentTiles.forEach((tile) => revealTile(board, tile));
    adjacentTiles.forEach(revealTile.bind(null, board));
  } else tile.element.textContent = mines.length;
};

// Check win condition
export const checkWin = function (board) {
  // If every tile is either  revealed or if mine then either marked or hidden
  return board.every((row) => {
    return row.every((tile) => {
      return (
        tile.status === TILE_STATUSES.NUMBER ||
        (tile.mine &&
          (tile.status === TILE_STATUSES.HIDDEN ||
            tile.status === TILE_STATUSES.MARKED))
      );
    });
  });
};

// Check lose condition
export const checkLose = function (board) {
  // If atleast one tile is mine
  return board.some((row) => {
    return row.some((tile) => {
      return tile.status === TILE_STATUSES.MINE;
    });
  });
};
