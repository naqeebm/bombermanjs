var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(18081, () => {
  console.log('listening on port 18081');
});

app.use(express.static(__dirname + '/public'));

var io = socket(server);

let players = [];
let state = 'LOBBY';
let blocks = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 1],
  [1, 0, 2, 2, 0, 0, 0, 0, 2, 0, 2, 0, 0, 2, 0, 1],
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

io.on('connection', con => {
  console.log(con.id, 'new connection', 'left: ' + players.length);
  io.to(con.id).emit('acceptcon', con.id);
  io.to(con.id).emit('state', state);
  con.on('disconnecting', () => {
    console.log(con.id, 'disconnecting', 'left: ' + players.length);
    players = players.filter(player => player.id !== con.id);
    io.sockets.emit('players', players);
  });

  con.on('ack', data => {
    if (state === 'LOBBY') {
      console.log(con.id, '>>ack');
      players.push(data);
      io.to(con.id).emit('players', players);
    }
  });
  con.on('changeChar', newChar => {
    if (state === 'LOBBY') {
      if (players.filter(player => player.id === con.id).length > 0) {
        players.filter(player => player.id === con.id)[0].char = newChar;
        io.sockets.emit('players', players);
      }
    }
  });
  con.on('readyChange', data => {
    if (state === 'LOBBY') {
      if (players.filter(player => player.id === con.id).length > 0) {
        players.filter(player => player.id === con.id)[0].ready = data;
        io.sockets.emit('players', players);
      }
      if (players.filter(pl => pl.ready).length === players.length) {
        state = 'GAME';
        console.log('state: GAME');
        for (let i = 0; i < blocks.length; i++) {
          for (let j = 0; j < blocks[i].length; j++) {
            if (blocks[j][i] === -1) blocks[j][i] = 0;
          }
        }
        io.sockets.emit('allReady', blocks);
      }
    }
  });
  con.on('move', data => {
    if (state === 'GAME') {
      if (players.filter(pl => pl.id === con.id).length === 1) {
        players.filter(pl => pl.id === con.id)[0].x = data.x;
        players.filter(pl => pl.id === con.id)[0].y = data.y;
      }
      io.sockets.emit('players', players);
    }
  });
  con.on('dx', data => {
    if (state === 'GAME') {
      if (players.filter(pl => pl.id === con.id).length === 1) {
        players.filter(pl => pl.id === con.id)[0].dx = data;
      }
      io.sockets.emit('players', players);
    }
  });
  con.on('dy', data => {
    if (state === 'GAME') {
      if (players.filter(pl => pl.id === con.id).length === 1) {
        players.filter(pl => pl.id === con.id)[0].dy = data;
      }
      io.sockets.emit('players', players);
    }
  });
  con.on('blockChange', data => {
    blocks[data.y][data.x] = data.val;
    io.sockets.emit('setBlock', data);
  });
  con.on('addExplosion', data => {
    io.sockets.emit('newExplosion', { expl: data, id: con.id });
  });
  con.on('addBomb', data => {
    io.sockets.emit('newBomb', { bomb: data, id: con.id });
  });
});

// confirm still connected ?
setInterval(() => {
  if (state === 'GAME' && players.length === 0) {
    state = 'LOBBY';
  }
}, 1000);
