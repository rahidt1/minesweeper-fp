import { times, range } from "lodash/fp";

// Logic

export const TILE_STATUSES = {
  HIDDEN: "hidden",
  MINE: "mine",
  MARKED: "marked",
  NUMBER: "number",
};

///////////////////////////////////////////////////
// Helper functions

export const positionMatch = function (a, b) {
  return a.x === b.x && a.y === b.y;
};

const nearbyTiles = function (board, { x, y }) {
  const offsets = range(-1, 2);

  return offsets
    .flatMap((xOffset) => {
      return offsets.flatMap((yOffset) => {
        return board[x + xOffset]?.[y + yOffset];
      });
    })
    .filter((tile) => tile != null);
};

const replaceTile = function (board, position, newTile) {
  return board.map((row, x) => {
    return row.map((tile, y) => {
      if (positionMatch(position, { x, y })) return newTile;
      return tile;
    });
  });
};

export const markedTilesCount = function (board) {
  return board.reduce((count, row) => {
    return (
      count + row.filter((tile) => tile.status === TILE_STATUSES.MARKED).length
    );
  }, 0);
};

///////////////////////////////////////////////////
export const createBoard = function (boardSize, minePositions) {
  const board = [];

  // For loop alternative
  return times((x) => {
    return times((y) => {
      return {
        x,
        y,
        mine: minePositions.some((p) => positionMatch({ x, y }, p)),
        status: TILE_STATUSES.HIDDEN,
      };
    }, boardSize);
  }, boardSize);
};

export const revealTile = function (board, { x, y }) {
  const tile = board[x][y];
  if (tile.status !== TILE_STATUSES.HIDDEN) return board;

  if (tile.mine) {
    return replaceTile(
      board,
      { x, y },
      { ...tile, status: TILE_STATUSES.MINE }
    );
  }
  tile.status = TILE_STATUSES.NUMBER;

  const adjacentTiles = nearbyTiles(board, tile);
  const mines = adjacentTiles.filter((tile) => tile.mine);

  const newBoard = replaceTile(
    board,
    { x, y },
    { ...tile, status: TILE_STATUSES.NUMBER, adjacentMinesCount: mines.length }
  );

  if (mines.length === 0) {
    return adjacentTiles.reduce((b, t) => {
      return revealTile(b, t);
    }, newBoard);
  }
  return newBoard;
};

export const markTile = function (board, { x, y }) {
  const tile = board[x][y];
  if (
    tile.status !== TILE_STATUSES.HIDDEN &&
    tile.status !== TILE_STATUSES.MARKED
  )
    return board;

  if (tile.status === TILE_STATUSES.MARKED)
    return replaceTile(
      board,
      { x, y },
      { ...tile, status: TILE_STATUSES.HIDDEN }
    );
  else
    return replaceTile(
      board,
      { x, y },
      { ...tile, status: TILE_STATUSES.MARKED }
    );
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
