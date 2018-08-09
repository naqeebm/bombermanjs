const canv = document.getElementById('canv');
const ctx = canv.getContext('2d');
const TWOPI = 2 * Math.PI;
const FPS = 60;
const DEFAULTPLAYERSPEED = 1;
const DEFAULTG = 4;

canv.height = window.innerHeight;
canv.width = window.innerWidth;
const h = canv.height;
const w = canv.width;

const XTILES = 16;
const YTILES = 16;
const TILESIZE = 40;
const DRAWOFFSET = 4;
const speed = 0.14;

let timer = null;
let player = [1, 1, 'white'];
let motion = [0, 0];

function startTimer() {
  if (timer === null) {
    timer = setInterval(timerloop, 1000 / FPS);
    console.log('started timer');
  }
}

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
    console.log('stopped timer');
  }
}

function drawBoard() {
  ctx.fillStyle = 'darkslategrey';
  ctx.fillRect(0, 0, canv.width, canv.height);
  ctx.fillStyle = 'grey';
  ctx.strokeStyle = 'grey';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, XTILES * TILESIZE, YTILES * TILESIZE);
  for (let x = 0; x < XTILES; x++) {
    for (let y = 0; y < YTILES; y++) {
      ctx.strokeRect(
        x * TILESIZE + 4,
        y * TILESIZE + 4,
        TILESIZE - 4,
        TILESIZE - 4
      );
    }
  }
}

function drawChar(x, y, col) {
  ctx.strokeStyle = col;
  ctx.beginPath();
  ctx.arc(
    x * TILESIZE + TILESIZE / 2 + DRAWOFFSET / 2,
    y * TILESIZE + TILESIZE / 2 + DRAWOFFSET / 2,
    TILESIZE / 2,
    0,
    TWOPI
  );
  ctx.closePath();
  ctx.stroke();
}

function drawPlayer() {
  drawChar(player[0], player[1], player[2]);
}

window.addEventListener('keypress', e => {
  switch (e.key) {
    case 'x':
      startTimer();
      break;
    case 'c':
      stopTimer();
      break;
    default:
      break;
  }
});

window.addEventListener('keydown', e => {
  switch (e.key) {
    case 'a':
      motion[0] = -speed;
      break;
    case 'd':
      motion[0] = speed;
      break;
    case 'w':
      motion[1] = -speed;
      break;
    case 's':
      motion[1] = speed;
      break;
    default:
      break;
  }
});

window.addEventListener('keyup', e => {
  switch (e.key) {
    case 'a':
    case 'd':
      motion[0] = 0;
      break;
    case 'w':
    case 's':
      motion[1] = 0;
    default:
      break;
  }
});

function timerloop() {
  player[0] += motion[0];
  player[1] += motion[1];
  if (player[0] < 0) {
    player[0] = 0;
  } else if (player[0] > XTILES - 1) {
    player[0] = XTILES - 1;
  } else if (player[1] < 0) {
    player[1] = 0;
  } else if (player[1] > YTILES - 1) {
    player[1] = YTILES - 1;
  }
  ctx.clearRect(0, 0, XTILES * TILESIZE, YTILES * TILESIZE);
  drawBoard();
  drawPlayer();
}
