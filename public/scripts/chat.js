window.onload = function() {
    var chat = new Chat();
    chat.init();
}
var Chat = function() {
    this.socket = null;
}

Chat.prototype = {
    init: function() {
        var that = this;
        this.socket = io.connect();
        this.socket.on("connect", function() {
            document.getElementById('info').textContent = 'Place input your nickname...';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nickInput').focus();
        })

        //登陆
        document.getElementById('loginBtn').addEventListener("click", function() {
            var nickName = document.getElementById('nickInput').value;
            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                document.getElementById('nickInput').focus();
            }
        }, false)



        this.socket.on("nameExisted", function() {
            document.getElementById('info').textContent = 'Name existed, choose another.'
        })

        this.socket.on("loginSuccess", function() {
            document.getElementById('login').style.display = 'none';
            document.title = "Chatroom | " + document.getElementById('nickInput').value;
            document.getElementById('messageInput').focus()
        })


        this.socket.on("system", function(nickName, count, type) {
            var msg = nickName + (type == 'login' ? " joined" : " left");
            that._sendMsg('System ', msg, '#00e1e8')
            document.getElementById('status').textContent = count + (count > 1 ? " users" : " user") + " online";
        })

        document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput');
            var msg = messageInput.value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg);
                that._sendMsg('Me', msg);
            }
        }, false)

        this.socket.on("newMsg", function(nickName, msg) {
            that._sendMsg(nickName, msg)
        })

        //键盘监听事件
        document.getElementById('messageInput').addEventListener('keyup', function(e) {
            var messageInp = document.getElementById('messageInput');
            var msg = messageInput.value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                messageInput.focus();
                that.socket.emit("postMsg", msg);
                that._sendMsg('Me', msg)
            }
        }, false)
    },
    // 初始化函数结束

    //显示消息函数
    _sendMsg: function(nickName, msg, color) {
        var container = document.getElementById('historyMsg');
        var msgToDisplay = document.createElement("p");
        var date = new Date().toTimeString().slice(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = nickName + '<span id="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay)
        container.scroolTop = container.scrollHeight;
    }
}
