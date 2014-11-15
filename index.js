var express = require('express');
var path = require('path');
var app = express();

var mongo = require('mongodb');
var mongoose = require('mongoose');
var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/tictactoe';
mongoose.connect(connectionString);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('connection successful');
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', function(request, response) {
  response.sendFile(path.join(__dirname, '/public/ttt.html'));
});

app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080,
  process.env.OPENSHIFT_NODEJS_IP);