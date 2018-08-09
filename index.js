var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(18081, () => {
  console.log('listening on port 18081');
});

app.use(express.static(__dirname + '/public'));

var io = socket(server);
