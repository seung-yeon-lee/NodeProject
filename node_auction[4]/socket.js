const SocketIO = require('socket.io');
 //socket.io와도 연결 이번에는 네임스페이스를 쓰지 않고 단순히 연결
module.exports = (server,app)=>{
    const io = SocketIO(server, {path: '/socket.io'});

    app.set('io',io);

    io.on('connection', (socket)=>{
        const req = socket.request;
        const {headers:{referer}} =req;
        const roomId = referer.split('/')[referer.split('/').length -1];
        socket.join(roomId); //클라이언트 연결 시 주소로부터 경매방 아이디를 받아와 join으로 해당 방에 입장
        socket.on('disconnect', ()=>{
            socket.leave(roomId); //연결이 끊겼다면 leave로 해당방에서 나감
        });
    });
};

//main pug에 추가 ......