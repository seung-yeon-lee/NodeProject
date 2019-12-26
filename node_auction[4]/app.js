const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('dotenv').config();

const IndexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const {sequelize} = require('./models');
const passportConfig = require('./passport');
const sse = require('./sse'); // sse 모듈 연결
const webSocket= require('./socket') //socket.io 모듈 연결
const checkAuction= require('./checkAuction') //스케쥴링 보완할 js 파일 immport

const app = express();
sequelize.sync();
passportConfig(passport)
checkAuction(); //서버를 재 시작하면 앞으로 서버를 시작할 때마다 낙찰자를 지정하는 작업을 수행
//서버가 켜져있어야함, 서버가 중간에 꺼졌다면 checkauction.js 코드에 따라 낙찰자를 선정하게 됨

const sessionMiddleware = session({
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET,
    cookie:{
        httpOnly:true,
        secure:false,
    }
});

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 8010);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'public')));
app.use('/img', express.static(path.join(__dirname,'uploads')));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', IndexRouter);
app.use('/auth', authRouter);

app.use((req,res,next)=>{
    const err = new Error('Not Found');
    err.status = 404;
    next(err)
});

app.use((err,req,res,next)=>{
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development'? err : {};
    res.status(err.status || 500);
    res.render('error')
});
const server = app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '번 포트에서 대기 중')
});

webSocket(server,app);
sse(server);