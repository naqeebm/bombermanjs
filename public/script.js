const canv = document.getElementById('canv');
const ctx = canv.getContext('2d');
const img = document.createElement('img');
img.src = 'imgs/tiles.png';

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

let tick = 0;
let timer = null;
let player = [1, 1, 'white'];
let speed = 0.14;
let explosionLength = 2;
let motion = [0, 0];
let blocks = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let maxBombs = 32;
let bombs = [[4, 4, 60]];
let explosions = [];
let placingBombs = false;

let particles = [];

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
  ctx.fillStyle = 'cyan';
  ctx.fillRect(0, 0, canv.width, canv.height);
  ctx.fillStyle = 'grey';
  ctx.strokeStyle = 'grey';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, XTILES * TILESIZE, YTILES * TILESIZE);
  ctx.fillStyle = 'lightgrey';
  ctx.fillRect(0, 0, XTILES * TILESIZE, YTILES * TILESIZE);
  for (let x = 0; x < XTILES; x++) {
    for (let y = 0; y < YTILES; y++) {
      switch (blocks[y][x]) {
        case 1:
          ctx.fillStyle = 'black';
          ctx.fillRect(
            x * TILESIZE + 4,
            y * TILESIZE + 4,
            TILESIZE - 4,
            TILESIZE - 4
          );
          ctx.fillStyle = 'darkslateblue';
          ctx.fillRect(
            x * TILESIZE + 6,
            y * TILESIZE + 6,
            TILESIZE - 8,
            TILESIZE - 8
          );
          ctx.drawImage(
            img,
            0,
            0,
            39,
            39,
            x * TILESIZE,
            y * TILESIZE,
            TILESIZE,
            TILESIZE
          );

          break;
        default:
          ctx.fillStyle = 'grey';
          ctx.fillRect(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE);
          ctx.drawImage(
            img,
            41,
            1,
            39,
            39,
            x * TILESIZE,
            y * TILESIZE,
            TILESIZE,
            TILESIZE
          );
          break;
      }
    }
  }
}

function drawChar(x, y, r, col, fillCol = null) {
  ctx.strokeStyle = col;
  if (fillCol !== null) {
    ctx.fillStyle = fillCol;
  }
  ctx.beginPath();
  ctx.arc(
    x * TILESIZE + TILESIZE / 2 + DRAWOFFSET / 2,
    y * TILESIZE + TILESIZE / 2 + DRAWOFFSET / 2,
    r,
    0,
    TWOPI
  );
  ctx.closePath();
  if (fillCol !== null) {
    ctx.fill();
  }
  ctx.stroke();
}

function drawPlayer() {
  drawChar(player[0], player[1], TILESIZE / 3, player[2]);
}

function drawBombs() {
  for (let i = 0; i < bombs.length; i++) {
    drawChar(
      bombs[i][0],
      bombs[i][1],
      TILESIZE / 3 + Math.min(1 / (bombs[i][2] / FPS), TILESIZE / 2),
      'red',
      'brown'
    );
  }
}

function drawParticles() {
  for (let i = 0; i < particles.length; i++) {
    // ctx.fillStyle = `rgba(${Math.floor(
    //   255 * (particles[i][4] / FPS)
    // )}, ${Math.floor(255 * (particles[i][4] / FPS))}, 255,${particles[i][4] /
    //   FPS})`;
    // ctx.fillRect(particles[i][0] * TILESIZE, particles[i][1] * TILESIZE, 4, 4);
    drawChar(
      particles[i][0],
      particles[i][1],
      1,
      `rgba(${Math.floor(255 * (particles[i][4] / FPS))}, ${Math.floor(
        255 * (particles[i][4] / FPS)
      )}, 255,${particles[i][4] / FPS})`
    );
  }
}

function drawExplosions() {
  for (let i = 0; i < explosions.length; i++) {
    // drawChar(
    //   explosions[i][0],
    //   explosions[i][1],
    //   TILESIZE / 3,
    //   `black`,
    //   `rgba(255,0,0,${explosions[i][2] / FPS})`
    // );
    ctx.drawImage(
      img,
      81 + explosions[i][3] * 40,
      1,
      39,
      39,
      explosions[i][0] * TILESIZE,
      explosions[i][1] * TILESIZE,
      TILESIZE,
      TILESIZE
    );
  }
}

function fillInfoText(txt, x, y) {
  ctx.font = '24px calibri';
  ctx.fillStyle = 'black';
  ctx.fillText(txt, XTILES * TILESIZE, TILESIZE);
}

function fillInfo() {
  fillInfoText(
    `x: ${Math.round(player[0] * 10) / 10} y: ${Math.round(player[1] * 10) /
      10} mtn: ${motion[0]},${motion[1]}`,
    player[0] * TILESIZE,
    player[1] * TILESIZE + (4 * TILESIZE) / 3
  );
  for (let i = 0; i < bombs.length; i++) {
    ctx.font = '20px calibri';
    ctx.fillStyle = 'black';
    ctx.fillText(
      `${bombs[i][0]} ${bombs[i][1]} ${bombs[i][2]}`,
      XTILES * TILESIZE,
      2 * TILESIZE + 20 * i
    );
  }
  for (let i = 0; i < particles.length; i++) {
    ctx.font = '10px calibri';
    ctx.fillStyle = 'black';
    ctx.fillText(
      `${Math.round(particles[i][0])} ${Math.round(
        particles[i][1]
      )} ${Math.round(particles[i][2])} ${Math.round(
        particles[i][3]
      )} ${Math.round(particles[i][4])}`,
      XTILES * TILESIZE,
      2 * TILESIZE + 20 * bombs.length + 10 * i
    );
  }
  for (let i = 0; i < explosions.length; i++) {
    ctx.font = '16px calibri';
    ctx.fillStyle = 'black';
    ctx.fillText(
      `${explosions[i][0]} ${explosions[i][1]} ${explosions[i][2]} ${
        explosions[i][3]
      }`,
      XTILES * TILESIZE + 100,
      2 * TILESIZE + 16 * i
    );
  }
}

function explodeBomb(bomb) {
  let count = 1;
  let flags = [false, false, false, false];

  while (count < explosionLength) {
    if (!flags[0]) {
      if (blocks[bomb[1] - count][bomb[0]] === 0) {
        addExplosion([bomb[0], bomb[1] - count, FPS - count * 3, 2]);
      } else {
        flags[0] = true;
      }
    }
    if (!flags[1]) {
      if (blocks[bomb[1]][bomb[0] - count] === 0) {
        addExplosion([bomb[0] - count, bomb[1], FPS - count * 3, 3]);
      } else {
        flags[1] = true;
      }
    }
    if (!flags[2]) {
      if (blocks[bomb[1] + count][bomb[0]] === 0) {
        addExplosion([bomb[0], bomb[1] + count, FPS - count * 3, 2]);
      } else {
        flags[2] = true;
      }
    }
    if (!flags[3]) {
      if (blocks[bomb[1]][bomb[0] + count] === 0) {
        addExplosion([bomb[0] + count, bomb[1], FPS - count * 3, 3]);
      } else {
        flags[3] = true;
      }
    }

    count++;
  }
  if (explosionLength > 0) {
    addExplosion([bomb[0], bomb[1], FPS, 1]);
  } else {
    addExplosion([bomb[0], bomb[1], FPS, 0]);
  }

  for (let x = bomb[0] - 2; x < bomb[0] + 2; x += 1) {
    for (let y = bomb[1] - 2; y < bomb[1] + 2; y += 1) {
      particles.push([
        bomb[0],
        bomb[1],
        (-50 + Math.random() * 100) / 500,
        (-50 + Math.random() * 100) / 500,
        2 * FPS - Math.floor(Math.random() * FPS)
      ]);
    }
  }
}

function addExplosion(data) {
  if (
    explosions.filter(expl => expl[0] === data[0] && expl[1] === data[1])
      .length === 0
  ) {
    explosions.push(data);
  }
}

window.addEventListener('keypress', e => {
  switch (e.key) {
    case 'x':
      startTimer();
      break;
    case 'c':
      stopTimer();
      break;
    case 'p':
      console.log('map:');
      let final = '[';
      for (let j = 0; j < YTILES; j++) {
        let str = '[';
        for (let i = 0; i < XTILES; i++) {
          str += blocks[j][i] + ',';
        }
        final += str.slice(0, str.length - 1) + '],';
      }
      console.log(final.slice(0, final.length - 1) + ']');
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
    case ' ':
      placingBombs = true;
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
      break;
    case ' ':
      placingBombs = false;
      break;
    default:
      break;
  }
});

function timerloop() {
  tick++;
  if (player[0] + motion[0] < 0) {
    player[0] = 0;
  } else if (player[0] + motion[0] > XTILES - 1) {
    player[0] = XTILES - 1;
  } else {
    if (
      blocks[Math.round(player[1])][Math.round(player[0] + motion[0])] === 0
    ) {
      player[0] += motion[0];
    }
  }

  if (player[1] + motion[1] < 0) {
    player[1] = 0;
  } else if (player[1] + motion[1] > YTILES - 1) {
    player[1] = YTILES - 1;
  } else {
    if (
      blocks[Math.round(player[1] + motion[1])][Math.round(player[0])] === 0
    ) {
      player[1] += motion[1];
    }
  }

  if (placingBombs && bombs.length < maxBombs) {
    if (
      bombs.filter(
        bomb =>
          bomb[0] === Math.round(player[0]) && bomb[1] === Math.round(player[1])
      ).length === 0
    ) {
      bombs.push([Math.round(player[0]), Math.round(player[1]), 3 * FPS]);
    }
  }
  for (let i = 0; i < particles.length; i++) {
    if (particles[i][0] < 0 || particles[i][0] > XTILES) {
      particles[i][2] = -particles[i][2] / 2;
    } else {
      if (
        blocks[Math.round(particles[i][1])][
          Math.round(particles[i][0] + particles[i][2])
        ] === 0
      ) {
        particles[i][0] += particles[i][2];
      } else {
        particles[i][2] = -particles[i][2] / 2;
      }
    }
    if (particles[i][1] < 0 || particles[i][1] > YTILES) {
      particles[i][3] = -particles[i][3] / 2;
    } else {
      if (
        blocks[Math.round(particles[i][1] + particles[i][3])][
          Math.round(particles[i][0])
        ] === 0
      ) {
        particles[i][1] += particles[i][3];
      } else {
        particles[i][3] = -particles[i][3] / 2;
      }
      particles[i][1] += particles[i][3];
    }
  }

  for (let i = 0; i < explosions.length; i++) {
    explosions[i][2]--;
    for (let j = 0; j < bombs.length; j++) {
      if (
        explosions[i][0] === bombs[j][0] &&
        explosions[i][1] === bombs[j][1]
      ) {
        explodeBomb(bombs.splice(j, 1)[0]);
      }
    }
    if (explosions[i][2] < 1) {
      explosions.shift();
    }
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i][4]--;
    if (particles[i][4] < 1) {
      particles.shift();
    }
  }
  for (let i = 0; i < bombs.length; i++) {
    bombs[i][2]--;
    if (bombs[i][2] < 1) {
      explodeBomb(bombs.splice(i, 1)[0]);
    }
  }

  ctx.clearRect(0, 0, canv.width, canv.height);
  drawBoard();
  drawParticles();
  drawPlayer();
  drawBombs();
  drawExplosions();
  fillInfo();
}
