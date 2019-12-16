exports.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        res.status(403).send('로그인이 필요합니다')
    }
};

exports.isNotLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        next();
    }else{
        res.redirect('/')
    }
};

// passport는 req객체에 isAuthenticated 메서드를 추가 로그인 중이면 true, 이렇듯 로그인 여부를 검사하는 미들웨어를 넣어 걸러낼 수가있음
// 지금 만든 이 미들웨어의 사용은 routes/page 라우터에서 사용함.


