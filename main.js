let game = new Game();
let account = new Proxy({
  score: 0,
  level: 0,
  lines: 0
}, {
  set: (target, key, value) => {
    target[key] = value;
    game.updateAccount(key, value);
    return true;
  }
});
game.accountIs(account);
game.addMove(KEY.LEFT, p => ({ ...p, x: p.x - 1 }));
game.addMove(KEY.RIGHT, p => ({ ...p, x: p.x + 1 }));
game.addMove(KEY.DOWN, p => ({ ...p, y: p.y + 1 }));
game.addMove(KEY.SPACE, p => ({ ...p, y: p.y + 1 }));
game.addMove(KEY.UP, p => game.board.rotate(p));
game.board.accountIs(account);
game.addMovesInBoard();

game.defineKeyDownEvent();
game.initNext();

document.querySelector('.play-button').addEventListener('click', () => game.play());

