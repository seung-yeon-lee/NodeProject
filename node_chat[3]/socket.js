const SocketIO = require('socket.io')
const axios = require('axios')
//몽고디비 스키마 정의 후 (views 폴더 pug참조 실시간 채팅방을 서버의 socket.js에 웹 소켓 이벤트 연결하는 코드)
module.exports= (server,app,sessionMiddleware)=>{
    const io = SocketIO(server,{path:'/socket.io'});
    app.set('io', io);  //라우터에서 io 객체를 쓸 수 있게 저장 (req.app.get('io)로 접근이 가능)
    const room = io.of('/room'); //SOCKET.IO에 네임스페이스를 부여하는 메서드 기본적으로 네임스페이스에 접속하지만 of메서드를 사용하면 다른 네임스페이스를
    const chat = io.of('/chat'); // 만들어 접속할 수 있음. 같은 네임스페이스 끼리만 데이터를 전달
    io.use((socket,next)=>{//io.use 메서드에 미들웨어를 장착 할 수 있음. 모든 웹 소켓 연결 시 마다 실행됨, 세선미들웨어에 요청객체,응답객체,next함수를 인자로
        sessionMiddleware(socket.request, socket.request.res, next)
    })
    room.on('connection', (socket)=>{ //room 네임스페이스에 이벤트 리스너를 붙여준 모습, 네임스페이스 마다 각각 이벤트 리스너를 붙일 수 있음
        console.log('room 네임스페이스에 접속');
        socket.on('disconnect', ()=>{
            console.log('room 네임스페이스 접속 해제')
        });
    });
    chat.on('connection', (socket)=>{//scket.io에는 네임스페이스보다 더 세부적인 개념으로 방(room)이라는 것이 있음. 같은 네임스페이스 안에서도 같은 방에 있는
        console.log('chat 네임스페이스에 접속'); //소켓끼리만 데이터를 죽 받을 수 있음 j
        const req = socket.request;
        const {headers:{referer}}=req
        const roomId = referer
            .split('/')[referer.split('/').length -1]
            .replace(/\?.+/,'');
        socket.join(roomId); //join메서드와 leave메서드는 방의 아이디를 인자로 받음 socket.request.headers.referer를 통해 현재 페이지의 url을 가져올 수 있음
        socket.to(roomId).emit('join',{ //socket.to(방 아이디) 메서드로 특정방에 데이터를 보낼 수 있음 방금 전 세션미들웨어와 socket.io를 연결했으므로 세션사용가능
            user: 'system',
            chat: `${req.session.color}님이 입장 하셨습니다.`
        });
        socket.on('disconnect', ()=>{
            console.log('chat 네임스페이스 접속 해제');
            socket.leave(roomId);
            const currentRoom =socket.adapter.rooms[roomId]; //접속 해제 시에는 현재 방의 사람 수를 구해서 참여자수가 0명이면 제거하는 http요청을 보냄
            const userCount = currentRoom? currentRoom.length : 0; //aadpter.rooms[roomId]에 참여중인 소켓 정보가 들어 있음
            if(userCount===0){  //라우터부분을 작성 (index.js // 이제 라우터에서 몽고디비와 웹 소켓 모두에 접근 할 수 있음)
                axios.delete(`http://localhost:8005/room/${roomId}`)
                .then(()=>{
                    console.log('방 제거 요청 성공');
                })
                .catch((error)=>{
                    console.error(error)
                });
            }else{
                socket.to(roomId).emit('exit',{
                    user:'system',
                    chat: `${req.session.color}님이 퇴장하셨습니다`,
                });
            }
        });
    });
};












// module.exports = (server)=>{
//     const io = SocketIO(server,{path:'/socket.io'});
//     //ws패키지와 크게 다를거 없음 두번째 인자로 옵션 객체를 넣어 서버에 관한 여러가지 설정을 할 수 있음
//     io.on('connection', (socket)=>{ //콜백으로 socket(소켓 객체)를 제공 io와 socket 객체가 socketIo의 핵심
//         const req = socket.request; // socket.request 속성으로 요청 객체에 접근 할 수 있음 socket.id로 소켓 고유의 아이디를 가져올 수있음
//         const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//         console.log('새로운 클라이언트로 접속!', ip, socket.id, req.ip)
//         socket.on('disconnect', ()=>{
//             console.log('클라이언트 접속 해제', ip, socket.id);
//             clearInterval(socket.interval);
//         });
//         socket.on('error', (error)=>{
//             console.error(error);
//         });
//         socket.on('reply',(data)=>{ //사용자가 직접만든 이벤트 클라이언트에서 reply라는 이벤트명으로 데이터를 보낼떄 서버에서 받는 부분
//             console.log(data);      //이렇듯 이벤트명을 사용하는 것이 ws 모듈과 차이점
//         });
//         socket.interval = setInterval(() => {
//             socket.emit('news', 'Hello Socket.Io') //첫번쨰 인자는 이벤트이름, 두번쨰 인자는 데이터 news라는 이벤트이름으로 hello...데이터를 클라이언트에게 보냄
//         }, 5000);                                  //클라이언트가 메세지를 받기 위해서 news라는 이벤트 리스너를 만들어 둬야함. (index.pug)
//     })
// }




//  // ws 패키지 이용한 간단한 웹 소켓 코드
// module.exports=(server) =>{
//     const wss = new WebSocket.Server({server});

//     wss.on('connection',(ws,req)=>{//connection 이벤트는 클라이언트가 서버와 웹 소켓 연결을 맺을 떄 발생
//         const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; //클라이언트의 ip를 알아내는 방법중 하나
//         console.log('새로운 클라이언트 접속', ip);
//         ws.on('message', (message)=>{
//             console.log(message);
//         });
//         ws.on('error',(error)=>{
//             console.error(error)
//         });        //ws 모듈을 불러온 호 익스프레스 서버를 웹 소켓 서버와 연결
//         ws.on('close', ()=>{
//             console.log('클라이언트 접속 해제',ip);
//             clearInterval(ws.interval); //setinterval을 clearinterval로 정리 , 이 부분이 없다면 메모리 누수 발생
//         });
//         const interval = setInterval(() => { 
//             if(ws.readyState === ws.OPEN){
//                 ws.send('서버에서 클라이언트로 메세지를 보냅니다')
//             }
//         }, 3000);
//         ws.interval = interval;
//     })
// };

// //웹 소켓은 서버에서 설정한다고 작동하는 것이 아님, 클라이언트에서도 웹 소켓을 사용해야함(양방향 통신) index.pug 작성 하고 script 태그에 웹 소켓 코드를 작성
