const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const{ User }= require('../models');

module.exports =(passport)=>{
    passport.serializeUser((user, done)=>{ //객체에 어떤 데이터 저장할지 선택 매개변수로 user를 받아 done함수 두번쨰 인자로 user.id를 넘김
        done(null, user.id)
    });
    passport.deserializeUser((id, done)=>{ //매 요청시 실행 passport.session() 미들웨어가 호출 serialize 세션에 저장한 아이디를 받아 db에서 사용자 조회
        User.findOne({ //세션에 저장된 아이디로 사용자 정보를 조회할 때 팔로잉 목록과 팔로워 목록도 같이 조회함
            where:{ id },
            include:[{  //include를 지정한 이유는 실수로 비밀번호를 조회하는 것을 방지하기 위함
                model:User,
                atributes: ['id','nick'],
                as:'Followers',
            },{
                model:User,
                atributes:['id','nick'],
                as:'Followings'
            }],
        })    
        .then(user=>done(null,user))
        .catch(err=> done(err));
         });     
        
    local(passport);
    kakao(passport);
};
