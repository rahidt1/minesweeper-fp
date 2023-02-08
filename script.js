//  Display UI
// 1. Populate board with tiles -
// 2. Left click on tiles
//    a. Reveal tiles

// 3. Right click on tiles
//    b. Mark tile

// 4. Check for win/lose

import {
  TILE_STATUSES,
  createBoard,
  markTile,
  revealTile,
  checkWin,
  checkLose,
  positionMatch,
  markedTilesCount,
} from "./minesweeper.js";

const BOARD_SIZE = 10;
const NUMBER_OF_MINES = 10;

let board = createBoard(
  BOARD_SIZE,
  getMinePositions(BOARD_SIZE, NUMBER_OF_MINES)
);
const boardElement = document.querySelector(".board");
const minesLeftText = document.querySelector("[data-mine-count]");
const messageText = document.querySelector(".subtext");

/////////////////////////////////////////////////////
function randomNumber(size) {
  return Math.floor(Math.random() * size);
}

const listMinesLeft = function () {
  minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount(board);
};

// Prevent addEventListener from propagation
const stopPropagation = function (e) {
  e.stopImmediatePropagation();
};

// Checking end of game
const checkGameEnd = function () {
  const win = checkWin(board);
  const lose = checkLose(board);

  // Stop able to click on board after win/lose
  if (win || lose) {
    boardElement.addEventListener("click", stopPropagation, { capture: true });
    boardElement.addEventListener("contextmenu", stopPropagation, {
      capture: true,
    });
  }

  if (win) messageText.textContent = "You Win";
  if (lose) {
    messageText.textContent = "You Lose";

    // Reveal all the mines
    board.forEach((row) => {
      row.forEach((tile) => {
        // Unmark tile if marked to reveal all the mines
        if (tile.status === TILE_STATUSES.MARKED) board = markTile(board, tile);

        // Reveal mine
        if (tile.mine) board = revealTile(board, tile);
      });
    });
  }
};

const tiletoElement = function (tile) {
  const element = document.createElement("div");
  element.dataset.status = tile.status;
  element.dataset.x = tile.x;
  element.dataset.y = tile.y;
  element.textContent = tile.adjacentMinesCount || "";
  return element;
};

const getTileElements = function () {
  return board.flatMap((row) => {
    return row.map(tiletoElement);
  });
};

// Get positions for mines
function getMinePositions(boardSize, numberOfMines) {
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
}

/////////////////////////////////////////////////////
const render = function () {
  boardElement.innerHTML = "";
  checkGameEnd();

  getTileElements().forEach((element) => {
    boardElement.append(element);
  });

  listMinesLeft();
};

boardElement.addEventListener("click", function (e) {
  if (!e.target.matches("[data-status]")) return;

  board = revealTile(board, {
    x: +e.target.dataset.x,
    y: +e.target.dataset.y,
  });

  render();
});

boardElement.addEventListener("contextmenu", function (e) {
  if (!e.target.matches("[data-status]")) return;

  e.preventDefault();
  board = markTile(board, {
    x: +e.target.dataset.x,
    y: +e.target.dataset.y,
  });
  render();
});

boardElement.style.setProperty("--size", BOARD_SIZE);
render();
