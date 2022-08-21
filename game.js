const BOARD_SIZE = 3; // has to be odd
const TILE_SIZE = 250;
const BLANK_TILE = 8;

export class Game {
  #tiles;
  #dom;
  #title;
  #moveCount;

  constructor(dom) {
    if (BOARD_SIZE % 2 !== 1) throw "Only odd board sizes please!";
    if (TILE_SIZE < 250 || TILE_SIZE > 250) {
      console.warn("Puzzle optimized for 750 x 750 image.");
    }

    this.#tiles = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => i);
    this.#moveCount = 0;
    this.#shuffle();

    const title = document.createElement("h1");
    title.classList.add("board__title");

    const boardDom = document.createElement("div");
    boardDom.style.width = TILE_SIZE * BOARD_SIZE + "px";
    boardDom.style.height = TILE_SIZE * BOARD_SIZE + "px";
    boardDom.classList.add("board");

    const shuffleButton = document.createElement("button");
    shuffleButton.classList.add("board__shuffle");
    shuffleButton.innerHTML = "Shuffle";

    dom.append(title);
    dom.append(boardDom);
    dom.append(shuffleButton);

    this.#dom = boardDom;
    this.#title = title;

    this.#dom.addEventListener("click", this.#handleClick.bind(this));
    shuffleButton.addEventListener("click", this.#handleShuffle.bind(this));
  }

  #isSolvable(nums) {
    // https://developerslogblog.wordpress.com/2020/04/01/how-to-shuffle-an-slide-puzzle/
    // count number of inversions
    // an inversion is when a tile precedes another tile with a lower number number.
    let inversionCount = 0;
    for (let i = 0; i < nums.length - 1; i++) {
      if (nums[i] === BLANK_TILE) continue;
      for (let j = i + 1; j < nums.length; j++) {
        if (nums[j] === BLANK_TILE) continue;
        nums[i] > nums[j] && inversionCount++;
      }
    }
    // if the puzzle´s grid is odd the puzzle is solvable when the number of inversions is even
    // not handling for even grid sizes
    return inversionCount % 2 === 0;
  }

  #shuffle() {
    this.#moveCount = 0;
    this.#tiles.sort(() => Math.random() - 0.5);

    if (!this.#isSolvable(this.#tiles)) {
      // make solvable by making inversion count even
      // swap first two if they don't include blank tile else swap last two
      if ([this.#tiles[0], this.#tiles[1]].includes(BLANK_TILE)) {
        [
          this.#tiles[this.#tiles.length - 1],
          this.#tiles[this.#tiles.length - 2],
        ] = [
          this.#tiles[this.#tiles.length - 2],
          this.#tiles[this.#tiles.length - 1],
        ];
      }

      [this.#tiles[0], this.#tiles[1]] = [this.#tiles[1], this.#tiles[0]];
    }
  }

  #handleShuffle() {
    this.#shuffle();
    this.render();
  }

  #handleClick(e) {
    const targetTileIdx = e.target.dataset.index;
    const blankTileIdx = this.#tiles.indexOf(BLANK_TILE);

    const [blankTileRow, blankTileCol] = [
      this.#getRow(blankTileIdx),
      this.#getCol(blankTileIdx),
    ];

    const top = this.#getIdxFromRowCol(blankTileRow - 1, blankTileCol);
    const bottom = this.#getIdxFromRowCol(blankTileRow + 1, blankTileCol);
    const left = this.#getIdxFromRowCol(blankTileRow, blankTileCol - 1);
    const right = this.#getIdxFromRowCol(blankTileRow, blankTileCol + 1);

    if (![top, bottom, left, right].includes(Number(targetTileIdx))) return;

    // swap target and blank tiles
    [this.#tiles[targetTileIdx], this.#tiles[blankTileIdx]] = [
      this.#tiles[blankTileIdx],
      this.#tiles[targetTileIdx],
    ];

    this.#moveCount++;
    this.render();
  }

  #getRow(idx) {
    return Math.floor(idx / BOARD_SIZE);
  }

  #getCol(idx) {
    return idx % BOARD_SIZE;
  }

  #getIdxFromRowCol(row, col) {
    if (row < 0 || row > BOARD_SIZE - 1 || col < 0 || col > BOARD_SIZE - 1)
      return -1;
    return row * BOARD_SIZE + col;
  }

  render() {
    const solved = this.#tiles.every((value, index) => value === index);

    const boardDom = this.#tiles.reduce((html, tile, idx) => {
      const col = this.#getCol(idx);
      const row = this.#getRow(idx);

      const bgCol = this.#getCol(tile);
      const bgRow = this.#getRow(tile);

      html.push(
        `<div class="board__tile ${
          tile === BLANK_TILE && !solved ? "board__tile--blank" : ""
        }" style="left:${col * TILE_SIZE}px; top:${
          row * TILE_SIZE
        }px; width:${TILE_SIZE}px; height:${TILE_SIZE}px; background-position: -${
          bgCol * TILE_SIZE
        }px -${bgRow * TILE_SIZE}px;" data-index="${idx}">${tile + 1}</div>`
      );

      return html;
    }, []);

    this.#dom.classList.remove("board--solved");
    this.#title.innerHTML = solved
      ? `Solved with ${this.#moveCount} moves`
      : `Moves: ${this.#moveCount}`;
    this.#dom.innerHTML = boardDom.join("");

    if (solved) {
      this.#dom.classList.add("board--solved");

      const iframe = `<iframe
          width="${TILE_SIZE * BOARD_SIZE}"
          height="${TILE_SIZE * BOARD_SIZE}"
          allow="autoplay; encrypted-media"
          frameborder="0"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
        >
        </iframe>`;

      setTimeout(() => {
        this.#dom.innerHTML = iframe;
      }, 2000);
    }
  }
}
