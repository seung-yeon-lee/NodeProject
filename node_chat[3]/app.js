const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const ColorHash = require('color-hash') //세션아이디를 HEX형식의 색상 문자열로 바꿔주는 패키지 해시이므로 같은 세션 아이디는 항상 같은 색상 문자열로 바뀜
require('dotenv').config();

const webSocket = require('./socket')
const indexRouter = require('./routes');
const connect = require('./schemas') //서버실행할떄 몽고디비에 접속 할 수 있도록 서버와 몽구스 연결
const app = express();
connect()
const sessionMiddleware = session({ //SOCKET IO도 미들웨어를 사용 할 수 있으므로 express-session을 공유
    resave: false,                   //(app.js,socket.js간에 session 미들웨어를 공유 하기에 변수로 분리하였음)
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
    httpOnly: true,
    secure: false,
    },
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')
app.set('port', process.env.PORT || 8005);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/gif', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(sessionMiddleware);
app.use(flash());

app.use((req, res, next) => { //세션에 컬러 속성이 없을떄 session ID를 바탕으로 컬러 속성을 생성, 앞으로는 req.session.color를 사용자 아이디처럼 사용
    if (!req.session.color) {
        const colorHash = new ColorHash();
        req.session.color = colorHash.hex(req.sessionID)
    }
    next()
})

app.use('/', indexRouter);

app.use((req, res, next) => {
    const err = new Error('Not Fount');
    err.status = 404;
    next(err)
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

const server = app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중')
});

webSocket(server, app, sessionMiddleware);
 //웹 소켓 express server connect

