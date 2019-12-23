const local = require('./localStrategy');
const {User}= require('../models');

module.exports= (passport)=>{
    passport.serializeUser((user,done)=>{ //req.session 객체에 어떤 데이터를 저장할지 선택 매개변수로 user를 받아서 done 함수에 두번쨰인자로
        done(null, user.id) //user.id를 넘기고 있음
    });
    passport.deserializeUser((id,done)=>{ //매 요청시 실행, passport.session() 미들웨어가 이 메서드를 호출
        User.findOne({where:{id}}) //serialize에서 세션에 저장했던 아이디를 받아 DB에서 사용자정보를 조회 , 조회한 정보는 req.user에 저장
        .then(user => done(null,user))
        .catch(err=>done(err))
    });
    local(passport)
};