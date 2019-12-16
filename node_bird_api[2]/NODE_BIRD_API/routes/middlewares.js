const jwt = require('jsonwebtoken');
//jwt에 대한 설명은 routes>v1.js에 기술
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

exports.verifyToken = (req,res,next)=>{
    try{ //요청 헤더에 저장된 토큰req.headers.auth...을 사용// 사용자가 쿠키처럼 헤더에 토큰을 넣어서 보낼 것임.
        req.decoded= jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        return next();  //verify메서드로 토큰을 검증// 첫번쨰 인자로 토큰을 두번쨰 인자로는 토큰의 비밀키를 넣음
    }catch(error){ //토큰 비밀키가 일치하지 않는다면 catch문으로 이동
        if(error.name==='TokenExpiredError'){ //유효기간 초과시
          return res.status(419).json({
              code:419,
              message:'토큰이 만료되었습니다'
          });
        }
        return res.status(401).json({
            code:401,
            message:'유효하지 않은 토큰입니다.'
        })
    }
}

// passport는 req객체에 isAuthenticated 메서드를 추가 로그인 중이면 true, 이렇듯 로그인 여부를 검사하는 미들웨어를 넣어 걸러낼 수가있음
// 지금 만든 이 미들웨어의 사용은 routes/page 라우터에서 사용함.


