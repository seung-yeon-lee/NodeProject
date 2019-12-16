//API 제공 서버를 만들었으니 API를 호출하는 서버만들기 서버지만 다른 서버에게 요청을 하므로 클라이언트 역할을 수행
// API 사용자의 입장에서 진행, Nodebird 앱의 데이터를 가져오기 위함
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
require('dotenv').config();

const indexRouter = require('./routes');
const app = express();

app.set('views', path.join(__dirname), 'views');
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 8003);

app.use(morgan('dev'));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET,
    cookie:{
        httpOnly:true,
        secure:false,
    },
}));




app.use('/', indexRouter);

app.use((req,res,next)=>{
    const err = new Error('Not Found');
    err.status = 404;
    next(error);
});

app.use((err,req,res,next)=>{
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.render('error')
});

app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '번 포트 대기중');
})

