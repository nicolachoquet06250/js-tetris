class Game {
    constructor() {
        this.canvas = document.querySelector('#board');
        this.ctx = this.canvas.getContext('2d');
        this.canvasNext = document.querySelectorAll('.next');
        this.ctxNext = [];
        for(let canvasNext of this.canvasNext) {
            this.ctxNext.push(canvasNext.getContext('2d'));
        }
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
        for(let ctxNext of this.ctxNext) {
            let block_size = ctxNext.canvas.classList.contains('mobile') ? MOBILE_BLOCK_SIZE : BLOCK_SIZE;
            ctxNext.canvas.width = 4 * block_size;
            ctxNext.canvas.height = 4 * block_size;
            ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
        }
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
            cancelAnimationFrame(this.requestId);
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
        for(let play_button of document.querySelectorAll('.play-button')) {
            this.toggleButton(play_button);
        }
        for(let pause_button of document.querySelectorAll('.pause-button')) {
            pause_button.innerHTML = 'Pause';
            this.toggleButton(pause_button);
        }
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

    defineAction(keyCode, event = null) {
        if (keyCode === KEY.P) {
            this.pause();
        }
        if (keyCode === KEY.ESC) {
            this.gameOver();
        } else if (this.moves[keyCode]) {
            if(event !== null) {
                event.preventDefault();
            }
            // Get new state
            let p = this.moves[keyCode](this.board.piece);
            if (keyCode === KEY.SPACE) {
                // Hard drop
                while (this.board.valid(p)) {
                    this.account.score += POINTS.HARD_DROP;
                    this.board.piece.move(p);
                    p = this.moves[KEY.DOWN](this.board.piece);
                }
            } else if (this.board.valid(p)) {
                this.board.piece.move(p);
                if (keyCode === KEY.DOWN) {
                    this.account.score += POINTS.SOFT_DROP;
                }
            }
        }
    }

    defineKeyDownEvent() {
        document.addEventListener('keydown', event => {
            this.defineAction(event.keyCode, event);
        });

        document.querySelector('.turn-shape').addEventListener('click', () => {
            this.defineAction(KEY.UP);
        });

        document.querySelector('.go-left').addEventListener('click', () => {
            this.defineAction(KEY.LEFT);
        });

        document.querySelector('.go-right').addEventListener('click', () => {
            this.defineAction(KEY.RIGHT);
        });

        document.querySelector('.accelerate-shape').addEventListener('click', () => {
            this.defineAction(KEY.DOWN);
        });
    }

    showButton(btn) {
        btn.classList.remove('d-none');
        btn.classList.add('d-block');
    }

    hideButton(btn) {
        btn.classList.remove('d-block');
        btn.classList.add('d-none');
    }

    toggleButton(btn) {
       if(btn.classList.contains('d-none')) {
           this.showButton(btn);
       } else {
           this.hideButton(btn);
       }
    }

    initPlayButtonEvent() {
        for(let play_button of document.querySelectorAll('.play-button')) {
            play_button.addEventListener('click', () => {
                game.play();
                for(let play_button of document.querySelectorAll('.play-button')) {
                    this.hideButton(play_button);
                }
                for(let pause_button of document.querySelectorAll('.pause-button')) {
                    this.showButton(pause_button);
                }
            });
        }
    }

    initPauseButtonEvent() {
        for(let pause_button of document.querySelectorAll('.pause-button')) {
            pause_button.addEventListener('click', () => {
                game.pause();
                pause_button.innerHTML = pause_button.innerText === 'Pause' ? 'Replay' : 'Pause';
            });
        }
    }

    updateAccount(key, value) {
        let element = document.getElementById(key);
        if (element) {
            element.textContent = value;
        }
    }
}