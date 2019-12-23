const SSE = require('sse');

module.exports = (server)=>{
    const sse = new SSE(server); //SSE 모듈을 불러와 new SSE(익스프레스 서버)로 서버 객체를 생성
    sse.on('connection', (client)=>{ //생성한 객체에 connection 이벤트리스너를 연결하여 클라이언트와 연결시 어떤 동작을 할지 정의 할 수있음
        setInterval(()=>{   //파라미터로 client 객체를 쓸 수 있음, 라우터에서 sse를 사용하고싶으면 app.set 메서드로 client 객체를 등록 후 req.app.get메서드로가져오면 가능
            client.send(new Date().valueOf().toString());
        }, 1000);
    });
};
// 위 코드는 1초마다 접속한 클라이언트에게 서버 타임스탬프를 보냄(client.send메서드), 단 문자열만 보낼 수 있음