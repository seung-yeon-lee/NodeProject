
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { isLoggedIn, isNotLoggedIn} = require('./middlewares');
const { User } = require('../models')

const router = express.Router();
                    
router.post('/join', isNotLoggedIn, async(req,res,next)=>{
    const {email, nick, password}= req.body;
    try{
        const exUser = await User.findOne({where:{ email } });
        if(exUser){
            req.flash('joinError', '이미 가입된 이메일 입니다.'); //같은 이메일로 가입한 사용자 있는지 조회 후 있다면 회원가입 페이지로 보냄
            return res.redirect('/join');
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({    //없다면 비밀번호를 암호화하고 생성 회원가입 시 비밀번호는 암호화해서 저장해아함. bcryptjs 두번쨰 인자는 반복횟수 개념
            email,
            nick,
            password:hash,
        });
        return res.redirect('/');
    }catch(error){
        console.error(error);
        return next(error)
    }
});
router.post('/login', isNotLoggedIn, (req,res,next)=>{
    passport.authenticate('local',(authError,user,info)=>{ //로컬 로그인 전략을 수행  localstrategy 부분 kakao부분 로그인 참조
        if(authError){
            console.error(authError);
            return next(authError)
        }
        if(!user){
            req.flash('loginError', info.message);
            return res.redirect('/')
        }
        return req.login(user, (loginError)=>{ //passport는 req객체에 login,logout 메서드를 추가 / req.login은 passport.serializeUser를 호출
            if(loginError){
                console.error(loginError)
                return next(loginError)
            }
            return res.redirect('/');
        });
    })(req,res,next); //미들웨어 내의 미들웨어는 붙임
});

router.get('/logout', isLoggedIn,(req,res)=>{
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

router.get('/kakao',passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao',{
    failureRedirect:'/',
}),(req,res)=>{
    res.redirect('/');
});

module.exports = router;

