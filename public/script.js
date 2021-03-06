console.log('connecting to server http://localhost:18081');
const server = io.connect('http://localhost:18081');
// console.log('connecting to server http://178.128.45.249:18081');
// const server = io.connect('http://178.128.45.249:18081');
let id = null;

const canv = document.getElementById('canv');
const ctx = canv.getContext('2d');
const img = document.createElement('img');
img.src = 'imgs/tiles.png';

const TWOPI = 2 * Math.PI;
const FPS = 60;

canv.height = window.innerHeight;
canv.width = window.innerWidth;
const h = canv.height;
const w = canv.width;

let portraitMode = false;
let touch = null;
let mobileButtons = null;
if (w < h) {
  portraitMode = true;
  mobileButtons = [
    [canv.width - 90, canv.height - 90, 30],
    [90, canv.height - 90, 20]
  ];
  touch = [0, 0];
}

let screen = 'LOAD';
let loadingPercent = 0;
const XTILES = 16;
const YTILES = 16;
const TILESIZE = 40;
const DRAWOFFSET = 4;
const scale = Math.min(h, w) / (XTILES * TILESIZE);

let edit = false;
let ready = false;

let tick = 0;
let timer = null;
let player = [1, 1, 'white'];
let name = 'Player ' + (new Date().getTime() % 93);
let char = 0;
let speed = 0.1;
let alive = true;
let players = [];

let maxBombs = 1;
let explosionLength = 2;
let motion = [0, 0];
let current = [1, 1];
let blocks = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 1],
  [1, 2, 2, 2, 0, 0, 0, 0, 2, 0, 2, 0, 0, 2, 0, 1],
  [1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 2, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 0, 1],
  [1, 2, 2, 2, 0, 2, 2, 2, 2, 0, 2, 0, 0, 2, 2, 1],
  [1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 2, 2, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2, 1],
  [1, 2, 2, 2, 0, 2, 2, 2, 2, 0, 2, 0, 0, 2, 2, 1],
  [1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 2, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 0, 1],
  [1, 2, 2, 2, 0, 2, 2, 2, 2, 0, 2, 0, 0, 2, 2, 1],
  [1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 2, 2, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 1],
  [1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
let back = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

loadingPercent = 50;
let bombs = [];
let explosions = [];
let placingBombs = false;

let particles = [];
loadingPercent = 100;

let powerups = [];
let NOPOWERUPS = 4;

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

function checkProx(x, y, x1, y1, leeway) {
  len = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
  if (Math.abs(len) < leeway) {
    return true;
  } else {
    return false;
  }
}

function drawBoard(blocks) {
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
        case -1:
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
          ctx.fillStyle = 'black';
          ctx.fillRect(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE);
          break;
        case 1:
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
        case 2:
          ctx.drawImage(
            img,
            81,
            1,
            39,
            39,
            x * TILESIZE,
            y * TILESIZE,
            TILESIZE,
            TILESIZE
          );
          break;
        case 3:
          let temp = powerups.filter(pwr => pwr[0] === x && pwr[1] === y);
          if (temp.length === 1) {
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
            ctx.fillStyle = `rgba(${128 +
              128 * Math.sin((tick % 128) / TWOPI)},128,255,0.5)`;
            ctx.beginPath();
            ctx.moveTo(x * TILESIZE + DRAWOFFSET, y * TILESIZE + DRAWOFFSET);
            ctx.lineTo(
              x * TILESIZE + TILESIZE - DRAWOFFSET,
              y * TILESIZE + DRAWOFFSET
            );
            ctx.lineTo(
              x * TILESIZE + TILESIZE - DRAWOFFSET,
              y * TILESIZE + TILESIZE - DRAWOFFSET
            );
            ctx.lineTo(
              x * TILESIZE + DRAWOFFSET,
              y * TILESIZE + TILESIZE - DRAWOFFSET
            );
            ctx.closePath();
            ctx.fill();
            ctx.drawImage(
              img,
              0 + 40 * temp[0][2],
              280,
              39,
              39,
              x * TILESIZE,
              y * TILESIZE,
              TILESIZE,
              TILESIZE
            );
          } else {
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

function drawPlayer(x, y, dx, dy, char, alive) {
  let offset = 2 * Math.cos((tick / FPS) * (char + 1));
  // drawChar(player[0], player[1], TILESIZE / 3, player[2]);
  ctx.drawImage(
    img,
    2 + (dy < 0 ? 2 : dx > 0 ? 1 : 0) * 40,
    42 + 40 * char,
    37,
    37,
    x * TILESIZE + (alive ? offset : 0),
    y * TILESIZE + (alive ? offset / 2 : 0),
    TILESIZE,
    TILESIZE
  );
  if (!alive) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'red';
    ctx.moveTo(x * TILESIZE + offset, y * TILESIZE);
    ctx.lineTo(x * TILESIZE + offset + TILESIZE, y * TILESIZE + TILESIZE);
    ctx.stroke();
    ctx.drawImage(
      img,
      2,
      42 + 40 * 1,
      37,
      37,
      x * TILESIZE + offset,
      (y - 0.5) * TILESIZE + 2 * offset + TILESIZE / 3,
      TILESIZE / 2,
      TILESIZE / 2
    );
  }
}

function drawPlayers(players) {
  for (let i = 0; i < players.length; i++) {
    drawPlayer(
      players[i].x,
      players[i].y,
      players[i].dx,
      players[i].dy,
      players[i].char,
      players[i].alive
    );
  }
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
    fillText(
      `${Math.round(bombs[i][2] / FPS)} `,
      bombs[i][0] + 0.5,
      bombs[i][1] + 0.75,
      'black'
    );
    fillText(
      `${Math.round(bombs[i][2] / FPS)} `,
      bombs[i][0] + 0.45,
      bombs[i][1] + 0.7,
      'white'
    );
  }
}

function drawParticles() {
  for (let i = 0; i < particles.length; i++) {
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

function fillText(txt, x, y, col) {
  ctx.font = '16px calibri';
  ctx.fillStyle = col;
  ctx.fillText(txt, x * TILESIZE, y * TILESIZE);
}

function fillInfo() {
  fillInfoText(
    `x: ${Math.round(player[0] * 10) / 10} y: ${Math.round(player[1] * 10) /
      10} mtn: ${motion[0]},${motion[1]} current: ${current[0]},${current[1]}`,
    player[0] * TILESIZE,
    player[1] * TILESIZE + (4 * TILESIZE) / 3
  );
  for (let i = 0; i < bombs.length; i++) {
    ctx.font = '20px calibri';
    ctx.fillStyle = 'black';
    ctx.fillText(
      `${bombs[i][0]} ${bombs[i][1]} ${bombs[i][2]}`,
      XTILES * TILESIZE + 20,
      2 * TILESIZE + 20 * i
    );
    ctx.drawImage(
      img,
      0,
      281,
      39,
      39,
      XTILES * TILESIZE,
      2 * TILESIZE + 20 * i - 15,
      20,
      20
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
    ctx.drawImage(
      img,
      81 + 40 * explosions[i][2],
      1,
      39,
      39,
      XTILES * TILESIZE + 100,
      2 * TILESIZE + 16 * i - 12,
      16,
      16
    );
    ctx.font = '16px calibri';
    ctx.fillStyle = 'black';
    ctx.fillText(
      `${explosions[i][0]} ${explosions[i][1]} ${explosions[i][2]} ${
        explosions[i][3]
      }`,
      XTILES * TILESIZE + 116,
      2 * TILESIZE + 16 * i
    );
  }
}

function timeoutExplosion(funct, timeout) {
  setTimeout(() => {
    funct();
  }, timeout);
}

function explodeBomb(bomb) {
  let count = 1;
  let flags = [false, false, false, false];

  while (count < bomb[3]) {
    if (!flags[0]) {
      if (blocks[bomb[1] - count][bomb[0]] === 0) {
        addExplosion([bomb[0], bomb[1] - count, FPS - count * 3, 2], count);
      } else if (blocks[bomb[1] - count][bomb[0]] === 2) {
        addExplosion([bomb[0], bomb[1] - count, FPS - count * 3, 4], count);
        changeBlock(bomb[1] - count, bomb[0], 0);
        flags[0] = true;
      } else {
        flags[0] = true;
      }
    }
    if (!flags[1]) {
      if (blocks[bomb[1]][bomb[0] - count] === 0) {
        addExplosion([bomb[0] - count, bomb[1], FPS - count * 3, 3], count);
      } else if (blocks[bomb[1]][bomb[0] - count] === 2) {
        addExplosion([bomb[0] - count, bomb[1], FPS - count * 3, 5], count);
        changeBlock(bomb[1], bomb[0] - count, 0);
        flags[1] = true;
      } else {
        flags[1] = true;
      }
    }
    if (!flags[2]) {
      if (blocks[bomb[1] + count][bomb[0]] === 0) {
        addExplosion([bomb[0], bomb[1] + count, FPS - count * 3, 2], count);
      } else if (blocks[bomb[1] + count][bomb[0]] === 2) {
        addExplosion([bomb[0], bomb[1] + count, FPS - count * 3, 4], count);
        changeBlock(bomb[1] + count, bomb[0], 0);
        flags[2] = true;
      } else {
        flags[2] = true;
      }
    }
    if (!flags[3]) {
      if (blocks[bomb[1]][bomb[0] + count] === 0) {
        addExplosion([bomb[0] + count, bomb[1], FPS - count * 3, 3], count);
      } else if (blocks[bomb[1]][bomb[0] + count] === 2) {
        addExplosion([bomb[0] + count, bomb[1], FPS - count * 3, 5], count);
        changeBlock(bomb[1], bomb[0] + count, 0);
        flags[3] = true;
      } else {
        flags[3] = true;
      }
    }

    count++;
  }
  if (explosionLength > 0) {
    addExplosion([bomb[0], bomb[1], FPS, 1], 0);
  } else {
    addExplosion([bomb[0], bomb[1], FPS, 1], 0);
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

function changeBlock(y, x, val) {
  if (blocks[y][x] === 2 && val === -1) {
    switch (tick % 8) {
      case 0:
      case 1:
      case 2:
      case 3:
        powerups.push([x, y, 0]);
        break;
      case 4:
      case 5:
        powerups.push([x, y, 1]);
        break;
      case 6:
        powerups.push([x, y, 2]);
        break;
      case 7:
        powerups.push([x, y, 3]);
        break;
    }
    server.emit('powerupsChanged',powerups);
  }
  blocks[y][x] = val;
  server.emit('blockChange', { x, y, val });
}

function addExplosion(data, count = 0) {
  if (
    explosions.filter(expl => expl[0] === data[0] && expl[1] === data[1])
      .length === 0
  ) {
    if (count === 0) {
      server.emit('addExplosion', data);
      explosions.push(data);
    } else {
      timeoutExplosion(() => {
        server.emit('addExplosion', data);
        explosions.push(data);
      }, count * 100);
    }
    changeBlock(data[1], data[0], -1);
  }
}

function drawCharSelect(x, y, char, selected) {
  ctx.strokeStyle = 'darkslateblue';
  ctx.strokeRect(x + 4, y + 4, TILESIZE - 8, TILESIZE - 8);
  ctx.strokeStyle = 'grey';
  ctx.strokeRect(x, y, TILESIZE, TILESIZE);
  if (selected) {
    ctx.fillStyle = ready ? 'green' : 'lime';
    ctx.fillRect(x + 1, y + 1, TILESIZE - 2, TILESIZE - 2);
  }
  ctx.drawImage(
    img,
    1 + 40 * (Math.floor((tick / FPS) * 1.5) % 2),
    41 + 40 * char,
    40,
    40,
    x + 2,
    y + 2,
    TILESIZE - 4,
    TILESIZE - 4
  );
}

function drawPlayerBoard() {
  for (let i = 0; i < players.length; i++) {
    drawPlayerOnPlayerBoard(
      players[i].name === undefined ? i : players[i].name,
      3,
      7 + i,
      players[i]
    );
  }
  // drawPlayerOnPlayerBoard('Player 1', 3, 7, { char: 2, ready: false });
  // drawPlayerOnPlayerBoard('Player 2', 3, 8, { char: 5, ready: true });
  // drawPlayerOnPlayerBoard('Bob', 3, 9, { char: 5, ready: false });
}

function drawPlayerOnPlayerBoard(name, x, y, player) {
  ctx.font = '24px calibri';
  ctx.fillStyle = 'black';
  ctx.fillText(
    '' + name + (player.ready ? ' ... ready!' : ' ...choosing'),
    (x + 1.2) * TILESIZE + 2,
    (y + 0.6) * TILESIZE + 2
  );
  ctx.fillStyle = 'white';
  ctx.fillText(
    '' + name + (player.ready ? ' ... ready!' : ' ...choosing'),
    (x + 1.2) * TILESIZE,
    (y + 0.6) * TILESIZE
  );
  ctx.strokeStyle = 'darkslateblue';
  ctx.strokeRect(
    x * TILESIZE + 4,
    y * TILESIZE + 4,
    TILESIZE - 8,
    TILESIZE - 8
  );
  ctx.strokeStyle = 'grey';
  ctx.strokeRect(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE);
  ctx.fillStyle = player.ready ? 'green' : 'grey';
  ctx.fillRect(x * TILESIZE + 1, y * TILESIZE + 1, TILESIZE - 2, TILESIZE - 2);
  ctx.drawImage(
    img,
    1 + 40 * (Math.floor((tick / FPS) * 1.5) % 2),
    41 + 40 * player.char,
    40,
    40,
    x * TILESIZE + 2,
    y * TILESIZE + 2,
    TILESIZE - 4,
    TILESIZE - 4
  );
}

function removePowerup(x, y, apply = false) {
  let i = 0;
  while (
    i < powerups.length &&
    !(powerups[i][0] == current[0] && powerups[i][1] == current[1])
  ) {
    i++;
  }
  if (apply) {
    if (i < powerups.length) {
      switch (powerups[i][2]) {
        case 0:
          maxBombs++;
          break;
        case 1:
          speed += 0.025;
          break;
        case 2:
          speed -= 0.025;
          break;
        case 3:
          alive = false;
          break;
      }
    }
    powerups.splice(i, 1);
  }
}

function setNewMoveDxDy(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) {
    motion[0] = Math.sign(Math.round(dx / 20)) * speed;
    motion[1] = 0;
    server.emit('dx', dx);
    server.emit('dy', dy);
  } else {
    motion[0] = 0;
    motion[1] = Math.sign(Math.round(dy / 20)) * speed;
    server.emit('dx', dx);
    server.emit('dy', dy);
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
      console.log('powerups', powerups);
      console.log(alive ? 'alive' : 'dead');
      break;
    case 'e':
      edit = !edit;
      break;
    default:
      break;
  }
});

window.addEventListener('keydown', e => {
  switch (screen) {
    case 'PLAY':
      switch (e.key) {
        case 'a':
          motion[0] = -speed;
          server.emit('dx', motion[0]);
          break;
        case 'd':
          motion[0] = speed;
          server.emit('dx', motion[0]);
          break;
        case 'w':
          motion[1] = -speed;
          server.emit('dy', motion[1]);
          break;
        case 's':
          motion[1] = speed;
          server.emit('dy', motion[1]);
          break;
        case ' ':
          placingBombs = true;
          break;
        default:
          break;
      }
  }
});

window.addEventListener('touchstart', e => {
  for (let j = 0; j < mobileButtons.length; j++) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (
        checkProx(
          e.changedTouches[i].pageX,
          e.changedTouches[i].pageY,
          mobileButtons[j][0],
          mobileButtons[j][1],
          100
        )
      ) {
        if (j === 1) {
          if (screen === 'PLAY') {
            placingBombs = true;
          } else if (screen === 'LOAD') {
            ready = !ready;
            server.emit('readyChange', ready);
          }
        } else {
          touch[0] = e.changedTouches[i].pageX - mobileButtons[0][0];
          touch[1] = e.changedTouches[i].pageY - mobileButtons[0][1];
          if (screen === 'PLAY') {
            setNewMoveDxDy(touch[0], touch[1]);
          } else if (screen === 'LOAD') {
            if (Math.sign(touch[0]) < 0) {
              if (!ready) {
                changeChar(char - 1);
                if (char < 0) {
                  changeChar(5);
                }
              }
            } else {
              if (!ready) {
                changeChar(char + 1);
                if (char > 5) {
                  changeChar(0);
                }
              }
            }
          }
        }
      }
    }
  }
});

window.addEventListener('touchmove', e => {
  e.preventDefault();
  if (screen === 'PLAY') {
    for (let j = 0; j < mobileButtons.length; j++) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (
          checkProx(
            e.changedTouches[i].pageX,
            e.changedTouches[i].pageY,
            mobileButtons[j][0],
            mobileButtons[j][1],
            100
          )
        ) {
          if (j == 0) {
            touch[0] = e.changedTouches[i].pageX - mobileButtons[0][0];
            touch[1] = e.changedTouches[i].pageY - mobileButtons[0][1];
            if (
              Math.sign(touch[0]) !== Math.sign(motion[0]) ||
              Math.sign(touch[1]) !== Math.sign(motion[1])
            )
              setNewMoveDxDy(touch[0], touch[1]);
          }
        }
      }
    }
  }
});

window.addEventListener('touchend', e => {
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (
      checkProx(
        e.changedTouches[i].pageX,
        e.changedTouches[i].pageY,
        mobileButtons[1][0],
        mobileButtons[1][1],
        mobileButtons[1][2]
      )
    ) {
      placingBombs = false;
    }
    touch[0] = null;
    touch[1] = null;
    setNewMoveDxDy(0, 0);
  }
});

function changeChar(newChar) {
  char = newChar;
  server.emit('changeChar', char);
}

function playerDead() {
  console.log('DEAD');
  alive = false;
  server.emit('dead', alive);
}

function drawCircle(x, y, r, lw = 1, stroke = null, fill = null) {
  if (fill !== null || stroke !== null) {
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TWOPI);
    ctx.closePath();
    if (fill !== null) ctx.fill();
    if (stroke !== null) ctx.stroke();
  }
}

function drawMobileControls() {
  drawCircle(mobileButtons[0][0], mobileButtons[0][1], 30, 5, 'grey');
  ctx.strokeStyle = 'grey';
  ctx.lineWidth = 4;
  ctx.moveTo(mobileButtons[0][0], mobileButtons[0][1]);
  ctx.lineTo(mobileButtons[0][0] + touch[0], mobileButtons[0][1] + touch[1]);
  ctx.stroke();
  drawCircle(
    mobileButtons[0][0] + touch[0],
    mobileButtons[0][1] + touch[1],
    20,
    5,
    'lightgrey',
    'rgba(128,128,128,0.5)'
  );
  drawCircle(
    mobileButtons[1][0],
    mobileButtons[1][1],
    20,
    5,
    'lightgrey',
    screen === 'PLAY'
      ? placingBombs
        ? 'rgba(255,0,0,0.5)'
        : null
      : ready
        ? 'green'
        : 'lime'
  );
  ctx.fillStyle = 'white';
  ctx.font = '12px arial';
  ctx.fillText(
    screen === 'PLAY' ? 'B' : 'R',
    mobileButtons[1][0] - 5,
    mobileButtons[1][1] + 5
  );
  if (screen === 'PLAY') {
    ctx.fillText(
      '^',
      mobileButtons[0][0] - 2,
      mobileButtons[0][1] - mobileButtons[0][2]
    );
    ctx.fillText(
      'v',
      mobileButtons[0][0] - 5,
      mobileButtons[0][1] + mobileButtons[0][2] + 7
    );
  }
  ctx.fillText(
    '<',
    mobileButtons[0][0] - mobileButtons[0][2] - 10,
    mobileButtons[0][1] + 5
  );
  ctx.fillText(
    '>',
    mobileButtons[0][0] + mobileButtons[0][2] + 4,
    mobileButtons[0][1] + 5
  );
}

window.addEventListener('keyup', e => {
  switch (screen) {
    case 'LOAD':
      switch (e.key) {
        case 'r':
          ready = !ready;
          server.emit('readyChange', ready);
          // screen = 'PLAY';
          break;
        case 'a':
        case 'ArrowLeft':
          if (!ready) {
            changeChar(char - 1);
            if (char < 0) {
              changeChar(5);
            }
          }
          break;
        case 'd':
        case 'ArrowRight':
          if (!ready) {
            changeChar(char + 1);
            if (char > 5) {
              changeChar(0);
            }
          }
          break;
      }
      break;
    case 'PLAY':
      switch (e.key) {
        case 'a':
        case 'd':
          motion[0] = 0;
          server.emit('dx', motion[0]);
          break;
        case 'w':
        case 's':
          motion[1] = 0;
          server.emit('dy', motion[1]);
          break;
        case ' ':
          placingBombs = false;
          break;
        default:
          break;
      }
  }
});

window.addEventListener('mousemove', e => {
  switch (screen) {
    case 'PLAY':
      if (edit) {
        let x = Math.floor(e.pageX / TILESIZE);
        let y = Math.floor(e.pageY / TILESIZE);
        blocks[y][x]++;
        if (blocks[y][x] == 4) {
          blocks[y][x] = 0;
        }
      }
  }
});

window.addEventListener('mousedown', () => {
  switch (screen) {
    case 'PLAY':
      edit = true;
  }
});

window.addEventListener('mouseup', e => {
  switch (screen) {
    case 'LOAD':
      let x = Math.floor(e.pageX / TILESIZE);
      let y = Math.floor(e.pageY / TILESIZE);
      if (x > 4 && x < 11 && y === 4) {
        changeChar(x - 5);
        // console.log('new char', char);
      }
      break;
    case 'PLAY':
      edit = false;
  }
});

function timerloop() {
  tick++;
  ctx.clearRect(0, 0, canv.width, canv.height);
  ctx.scale(scale, scale);
  switch (screen) {
    case 'LOAD':
      drawBoard(back);
      ctx.font = '19px arial';
      ctx.fillStyle = 'black';
      ctx.fillText('CONNECTING... ' + (id !== null ? 'CONNECTED' : ''), 52, 67);
      ctx.fillText(
        'LOADING GAME... ' +
          loadingPercent +
          '%' +
          (loadingPercent === 100 ? '! READY' : ''),
        53,
        91
      );
      if (players.length > 0) {
        if (loadingPercent === 100) {
          ctx.fillText('Waiting for players... press R when ', 53, 115);
          ctx.fillStyle = ready ? 'lime' : 'black';
          ctx.fillText('READY!', 352, 114);
        }
        for (let i = 0; i < 6; i++) {
          drawCharSelect(
            5 * TILESIZE + i * TILESIZE,
            4 * TILESIZE,
            i,
            char === i ? true : false,
            false
          );
        }
        ctx.fillStyle = 'white';
        ctx.fillText(
          'CONNECTING... ' + (id !== null ? 'CONNECTED' : ''),
          50,
          65
        );
        ctx.fillText(
          'LOADING GAME... ' +
            loadingPercent +
            '%' +
            (loadingPercent === 100 ? '! READY' : ''),
          51,
          89
        );
        if (loadingPercent === 100) {
          ctx.fillText('Waiting for players... press R when ', 51, 113);
          ctx.fillStyle = ready ? 'green' : 'white';
          ctx.fillText('READY!', 351, 113);
        }
        drawPlayerBoard();
      } else {
        if (loadingPercent === 100) {
          ctx.fillStyle = 'black';
          ctx.fillText('Game is in progress. Try again later.', 55, 117);
          ctx.fillStyle = 'white';
          ctx.fillText('Game is in progress. Try again later.', 53, 115);
        }
      }
      break;
    case 'PLAY':
      if (alive) {
        current[0] = Math.floor(player[0] + 0.5);
        current[1] = Math.floor(player[1] + 0.5);
        switch (blocks[current[1]][current[0]]) {
          case 3:
            changeBlock(current[1], current[0], 0);
            removePowerup(current[0], current[1], true);
            break;
        }
        if (motion[0] > 0) {
          switch (blocks[current[1]][Math.round(player[0] + motion[0] + 0.5)]) {
            case -1:
              player[0] += motion[0];
              playerDead();
              break;
            case 0:
              player[0] += motion[0];
              break;
            case 3:
              player[0] += motion[0];
              break;
          }
        } else if (motion[0] < 0) {
          switch (blocks[current[1]][Math.round(player[0] + motion[0] - 0.5)]) {
            case -1:
              player[0] += motion[0];
              playerDead();
              break;
            case 0:
              player[0] += motion[0];
              break;
            case 3:
              player[0] += motion[0];

              break;
          }
        }
        if (motion[1] > 0) {
          switch (blocks[Math.round(player[1] + motion[1] + 0.5)][current[0]]) {
            case -1:
              player[1] += motion[1];
              playerDead();
              break;
            case 0:
              player[1] += motion[1];
              break;
            case 3:
              player[1] += motion[1];
              break;
          }
        } else if (motion[1] < 0) {
          switch (blocks[Math.round(player[1] + motion[1] - 0.5)][current[0]]) {
            case -1:
              player[1] += motion[1];
              playerDead();
              break;
            case 0:
              player[1] += motion[1];
              break;
            case 3:
              player[1] += motion[1];
              break;
          }
        }

        if (placingBombs && bombs.length < maxBombs) {
          if (
            bombs.filter(
              bomb =>
                bomb[0] === Math.round(player[0]) &&
                bomb[1] === Math.round(player[1])
            ).length === 0
          ) {
            bombs.push([
              Math.round(player[0]),
              Math.round(player[1]),
              3 * FPS,
              explosionLength
            ]);
            server.emit('addBomb', [
              Math.round(player[0]),
              Math.round(player[1]),
              3 * FPS
            ]);
          }
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
        explosions[i][2] -= 2;
        for (let j = 0; j < bombs.length; j++) {
          if (
            explosions[i][0] === bombs[j][0] &&
            explosions[i][1] === bombs[j][1]
          ) {
            explodeBomb(bombs.splice(j, 1)[0]);
          }
        }
        if (explosions[i][2] < 1) {
          let expl = explosions.shift();
          // if (blocks[expl[1]][expl[0]] !== 3) { //disallow powerup destroying
          changeBlock(expl[1], expl[0], 0);
          // }
        }
      }

      for (let i = 0; i < powerups.length; i++) {
        if (blocks[(powerups[i][1], powerups[i][0])] !== 3) {
          changeBlock(powerups[i][1], powerups[i][0], 3);
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
      if (tick % 2 === 0) {
        if (alive) {
          server.emit('move', {
            x: Math.round(player[0] * 10) / 10,
            y: Math.round(player[1] * 10) / 10
          });
        }
      }
      drawBoard(blocks);
      drawParticles();
      drawBombs();
      drawPlayers(players.filter(pl => pl.id !== id));
      drawPlayer(player[0], player[1], motion[0], motion[1], char, alive);
      drawExplosions();

      // fillInfo();

      break;
    default:
      break;
  }
  ctx.scale(1 / scale, 1 / scale);

  if (portraitMode) {
    drawMobileControls();
  }
}

startTimer();

server.on('acceptcon', data => {
  id = data;
  console.log('>>connection confirmed!', data);
  server.emit('ack', {
    id,
    name,
    x: player[0],
    y: player[1],
    dx: motion[0],
    dy: motion[1],
    char,
    ready,
    speed,
    explosionLength,
    alive
  });
});

server.on('state', data => {
  if (screen === 'LOAD') {
  }
});

server.on('players', data => {
  // console.log('>>players', data);
  players = data;
});

server.on('disconnected', data => {
  players = players.filter(pl => pl.id !== data);
});

server.on('stillthere', () => {
  server.emit('stillhere');
});

server.on('allReady', data => {
  blocks = data;
  screen = 'PLAY';
});

server.on('setBlock', data => {
  blocks[data.y][data.x] = data.val;
});

server.on('newExplosion', data => {
  if (data.id !== id) {
    explosions.push(data.expl);
  }
});

server.on('newBomb', data => {
  if (data.id !== id) {
    bombs.push(data.bomb);
  }
});
