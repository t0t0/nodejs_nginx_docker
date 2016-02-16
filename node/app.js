var redis = require('redis');
var client = redis.createClient("6379", "redis"); //creates a new client

client.on('connect', function() {
    console.log('connected');
});

var express = require('express');

// Constants
 var PORT = 8080;

 // App
 var app = express();
 app.get('/', function (req, res) {
   res.send('Hello world\n');
   });

   app.listen(PORT);
   console.log('Running on http://localhost:' + PORT);



