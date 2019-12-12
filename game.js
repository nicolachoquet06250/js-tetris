class Game {
    constructor() {
        this.canvas = document.getElementById('board');
        this.ctx = this.canvas.getContext('2d');
        this.canvasNext = document.getElementById('next');
        this.ctxNext = this.canvasNext.getContext('2d');
        this.time = {};
        this.boardIs(new Board(this.ctx, this.ctxNext));
        this.account = null;
        this.moves = {};
        this.requestId = null;
    }

    /**
     * @param {{
     *      score: number,
     *      level: number,
     *      lines: number
     * }} account
     * @returns {Game}
     */
    accountIs(account) {
        this.account = account;
        return this;
    }

    /**
     * @param {Board} board
     * @returns {Game}
     */
    boardIs(board) {
        this.board = board;
        return this;
    }

    addMove(move, callback) {
        this.moves[move] = callback;
        return this;
    }

    addMovesInBoard() {
        for(let move in this.moves) {
            this.board.addMove(move, this.moves[move]);
        }
        return this;
    }

    initNext() {
        // Calculate size of canvas from constants.
        this.ctxNext.canvas.width = 4 * BLOCK_SIZE;
        this.ctxNext.canvas.height = 4 * BLOCK_SIZE;
        this.ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
    }

    reset() {
        this.account.score = 0;
        this.account.lines = 0;
        this.account.level = 0;
        this.board.reset();
        this.time = { start: 0, elapsed: 0, level: LEVEL[this.account.level] };
    }

    play() {
        this.reset();
        this.time.start = performance.now();
        // If we have an old game running a game then cancel the old
        if (this.requestId) {
            cancelAnimationFrame(requestId);
        }

        this.animate();
    }

    animate(now = 0) {
        this.time.elapsed = now - this.time.start;
        if (this.time.elapsed > this.time.level) {
            this.time.start = now;
            if (!this.board.drop()) {
                this.gameOver();
                return;
            }
        }

        // Clear board before drawing new state.
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.board.draw();
        this.requestId = requestAnimationFrame(e => this.animate(e));
    }

    gameOver() {
        cancelAnimationFrame(this.requestId);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(1, 3, 8, 1.2);
        this.ctx.font = '1px Arial';
        this.ctx.fillStyle = 'red';
        this.ctx.fillText('GAME OVER', 1.8, 4);
    }

    pause() {
        if (!this.requestId) {
            this.animate();
            return;
        }

        cancelAnimationFrame(this.requestId);
        this.requestId = null;

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(1, 3, 8, 1.2);
        this.ctx.font = '1px Arial';
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillText('PAUSED', 3, 4);
    }

    defineKeyDownEvent() {
        document.addEventListener('keydown', event => {
            if (event.keyCode === KEY.P) {
                this.pause();
            }
            if (event.keyCode === KEY.ESC) {
                this.gameOver();
            } else if (this.moves[event.keyCode]) {
                event.preventDefault();
                // Get new state
                let p = this.moves[event.keyCode](this.board.piece);
                if (event.keyCode === KEY.SPACE) {
                    // Hard drop
                    while (this.board.valid(p)) {
                        this.account.score += POINTS.HARD_DROP;
                        this.board.piece.move(p);
                        p = this.moves[KEY.DOWN](this.board.piece);
                    }
                } else if (this.board.valid(p)) {
                    this.board.piece.move(p);
                    if (event.keyCode === KEY.DOWN) {
                        this.account.score += POINTS.SOFT_DROP;
                    }
                }
            }
        });
    }

    updateAccount(key, value) {
        let element = document.getElementById(key);
        if (element) {
            element.textContent = value;
        }
    }
}