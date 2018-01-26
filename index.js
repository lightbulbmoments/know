var express = require('express')
var app = express();
var server = require('http').createServer();
var io = require('socket.io')(server);
var app = express(),
    server = require('http').createServer(app),
    io = io.listen(server);

server.listen(80);
app.use(express.static('web'))
var config = {
    firebase: {
        apiKey: "AIzaSyCzWurmHuNeNRWJJc3hWhdMpYsXEfNaepY",
        authDomain: "gae-file-manager.firebaseapp.com",
        databaseURL: "https://gae-file-manager.firebaseio.com",
        projectId: "gae-file-manager",
        storageBucket: "gae-file-manager.appspot.com",
        messagingSenderId: "853183834927"
    },
    admin: {
        username: "admin@xyz.com",
        password: "admin123"
    }
}
// authenticate user to read data.
var dbmanager = new(require('./dbmanager.js'))(config);
dbmanager.init();

// socket listener
io.on('connection', function(client) {
    client.on('event', function(data) {
        console.log("data", data);
        // check if it's a valid rpc, if not return 400
        if (data.rpc && dbmanager[data.rpc]) {
            dbmanager[data.rpc](data, function(res) {
                io.emit("res", res);
            });
        } else {
            console.log("we dont know this rpc, Maybe hack ??");
            io.emit("res", 400);
        }
    });
});

// Your request handlers
app.get('/', function(req, res) {
    res.sendfile('./web/html/index.html')
})

app.get('/admin', function(req, res) {
    res.sendfile('./web/html/admin.html')
})

app.get('/user', function(req, res) {
    res.sendfile('./web/html/user.html')
})