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

io.on('connection', con => {
  console.log(con.id, 'new connection');
  io.to(con.id).emit('acceptcon', con.id);
  io.to(con.id).emit('state', state);
  io.to(con.id).emit('players', players);
  players.push({ id: con.id });
  con.on('disconnecting', () => {
    console.log(con.id, 'disconnecting');
    players = players.filter(player => player.id !== con.id);
    console.log(players);
  });
});
