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
} from "./minesweeper.js";

const BOARD_SIZE = 10;
const NUMBER_OF_MINES = 10;

const board = createBoard(BOARD_SIZE, NUMBER_OF_MINES);
const boardElement = document.querySelector(".board");
const minesLeftText = document.querySelector("[data-mine-count]");
const messageText = document.querySelector(".subtext");

/////////////////////////////////////////////////////
const listMinesLeft = function () {
  const markedTilesCount = board.reduce((count, row) => {
    return (
      count + row.filter((tile) => tile.status === TILE_STATUSES.MARKED).length
    );
  }, 0);

  minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount;
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
        if (tile.status === TILE_STATUSES.MARKED) markTile(tile);

        // Reveal mine
        if (tile.mine) revealTile(board, tile);
      });
    });
  }
};

/////////////////////////////////////////////////////
board.forEach((row) => {
  row.forEach((tile) => {
    boardElement.append(tile.element);

    tile.element.addEventListener("click", function () {
      revealTile(board, tile);
      checkGameEnd();
    });
    tile.element.addEventListener("contextmenu", function (e) {
      e.preventDefault();

      markTile(tile);

      listMinesLeft();
    });
  });
});
boardElement.style.setProperty("--size", BOARD_SIZE);
minesLeftText.textContent = NUMBER_OF_MINES;
