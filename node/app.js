var redis = require('redis');
var client = redis.createClient("6379", "redis"); //creates a new client

client.on('connect', function() {
    console.log('connected');
});
