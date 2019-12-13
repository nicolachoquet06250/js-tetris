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
game.board.timeIs(game.time);
game.addMovesInBoard();

game.defineKeyDownEvent();
game.initNext();

for(let play_button of document.querySelectorAll('.play-button')) {
  play_button.addEventListener('click', () => game.play());
}

document.querySelector('#board').style.marginBottom = `${parseInt(document.querySelector('.mobile-play-bar')
    .style.height.replace('px', '')) + 10}px`;

for(let btn_container of document.querySelectorAll('.btn-container')) {
  btn_container.style.height = `${parseInt(document.querySelector('.mobile-play-bar')
      .style.height.replace('px', '')) / 3}px`;
}

