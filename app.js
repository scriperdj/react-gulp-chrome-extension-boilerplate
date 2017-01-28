// [START app]
'use strict';

var express = require('express');
var http    = require('http');

var app = express();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})
app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
});
app.use('/static', express.static(__dirname + '/public'));
// Start the server
var server = http.createServer(app)
server.listen('3000', '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address,
    server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
