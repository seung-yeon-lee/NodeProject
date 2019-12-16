const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const {User}= require('../models')

module.exports = (passport)=>{
    passport.use(new localStrategy({ 
        usernameField: 'email',
        passwordField: 'password',
    }, async(email,password,done)=>{     //실제 수행하는 async함수 localstrategy의 두번째 인자로 들어감 3번쨰 인자인 done 함수는 passport.authenticate의 콜백함수
        try{
            const exUser = await User.findOne({where:{email}});
            if(exUser){
                const result = await bcrypt.compare(password, exUser.password);     //db에서 일치하는 이메일 찾은후 있다면 compare함수로 비밀번호를 비교
                if(result){
                    done(null,exUser)  //비교해서 일치한다면 2번쨰 인자로 사용자 정보를 넣어 보냄
                }else{                 //로그인 성공시 done의 1번쨰 인자는 passport.auth...(authError)로 exUser는 두번쨰 인자인 user에 담김
                    done(null,false, {message: '비밀번호가 일치하지 않습니다.'});  //message는 passport.au..에 3번쨰 인자인 info에 담김
                }
            }else{
                done(null, false, {message: '가입되지 않은 회원합니다.'})
            }
        }catch(error){
            console.error(error);
            done(error)
        }
    }));
};