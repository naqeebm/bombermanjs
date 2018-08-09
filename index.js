var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(8081, () => {
  console.log('listening on port 8081');
});

app.use(express.static(__dirname + '/public'));

var io = socket(server);
