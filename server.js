var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
app.use('/', express.static(__dirname + '/public'));

var port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log('Server listening at port %d', port);
});

var users = [];

io.sockets.on('connection', function(socket) {
    socket.on('login', function(nickName) {
        if (users.indexOf(nickName) > -1) {
            socket.emit("nameExisted");
        } else {
            socket.nickName = nickName;
            socket.userIndex = users.length;
            users.push(nickName);
            socket.emit("loginSuccess");
            io.sockets.emit("system", nickName, users.length, "login");
        }
    })

    socket.on("disconnect", function() {
        users.splice(socket.userIndex, 1);
        socket.broadcast.emit("system", socket.nickName, users.length, "logout")
    })

    socket.on("postMsg", function(msg) {
        socket.broadcast.emit('newMsg', socket.nickName, msg);
    })
})
