window.onload = function() {
    var chat = new Chat();
    chat.init();
}
var Chat = function() {
    this.socket = null;
}

Chat.prototype = {
    init: function() {
        var COLOR = ['#07ff00', '#36eeee', '#375ad7', '#a15ce4', '#e263ae', '#ffa800', '#4f5ecb'];
        var color = COLOR[Math.floor(Math.random(0, 8) * 8)];
        var that = this;
        this.socket = io.connect();
        this.socket.on("connect", function() {
            document.getElementById('info').textContent = 'Place input your nickname...';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nickInput').focus();
        })

        this.socket.on('error', function(err) {
            if (document.getElementById('login').style.display == 'none') {
                document.getElementById('status').textContent = 'Fail to connect...';
            } else {
                document.getElementById('info').textContent = 'Fail to connect...';
            }
        });

        //登陆
        document.getElementById('loginBtn').addEventListener("click", function() {
            var nickName = document.getElementById('nickInput').value;
            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                document.getElementById('nickInput').focus();
            }
        }, false)

        //若名字重复，通知用户更改
        this.socket.on("nameExisted", function() {
            document.getElementById('info').textContent = 'Name existed, choose another.'
        })

        //登陆成功
        this.socket.on("loginSuccess", function() {
            document.getElementById('login').style.display = 'none';
            document.title = "Chatroom | " + document.getElementById('nickInput').value;
            document.getElementById('messageInput').focus()
        })

        //系统提示用户joined/left，显示在线人数
        this.socket.on("system", function(nickName, count, type) {
            var msg = nickName + (type == 'login' ? " joined" : " left");
            that._sendMsg('System ', msg, '#00e1e8')
            document.getElementById('status').textContent = count + (count > 1 ? " users" : " user") + " online";
        })

        //点击发送按钮，发送消息
        document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput');
            var msg = messageInput.value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg, color);
                that._sendMsg('Me', msg, color);
            }
        }, false)

        //监听新信息，并发送信息
        this.socket.on("newMsg", function(nickName, msg, color) {
            that._sendMsg(nickName, msg, color)
        })

        //键盘监听事件
        document.getElementById('nickInput').addEventListener("keyup", function(e) {
            var nickName = document.getElementById('nickInput').value;
            if (e.keyCode == 13 && nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                document.getElementById('nickInput').focus();
            }
        }, false)
        document.getElementById('messageInput').addEventListener('keyup', function(e) {
            var messageInp = document.getElementById('messageInput');
            var msg = messageInput.value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                messageInput.focus();
                that.socket.emit("postMsg", msg, color);
                that._sendMsg('Me', msg, color)
            }
        }, false)
    },
    // 初始化函数结束

    //发送消息函数
    _sendMsg: function(nickName, msg, color) {
        var container = document.getElementById('historyMsg');
        var msgToDisplay = document.createElement("p");
        var date = new Date().toTimeString().slice(0, 8);
        msgToDisplay.style.color = color;
        msgToDisplay.innerHTML = nickName + '<span id="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay)
        container.scrollTop = container.scrollHeight;
    }
}
