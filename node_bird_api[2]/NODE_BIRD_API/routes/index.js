const express= require('express');
const uuidv4 = require('uuid/v4');
const {User, Domain} = require('../models');

const router = express.Router();

router.get('/', (req,res,next)=>{ //루트 라우터는 접속시 로그인 화면을 보여줌
    User.findOne({
        where:{id:req.user && req.user.id ||null},
        include:{model:Domain}, //join 기능
    })
    .then((user)=>{
        res.render('login',{
            user,
            loginError: req.flash('loginError'),
            domains: user && user.domains,
        });
    })
    .catch((error)=>{
        next(error)
    });
});

router.post('/domain', (req,res,next)=>{ //도메인 라우터는 폼으로부터 온 데이터를 도메인 모델에 저장
    Domain.create({
        userId:req.user.id,
        host:req.body.host,
        type:req.body.type,
        clientSecret: uuidv4(), //uuid는 범용 고유 식별자로 고유한 문자열을 만들고 싶을때 사용 사용시 중복될 가능성은 거의없다
    })                  //서버를 실행하고 접속하면 이제 api가 아니라 api를 이용하는 사용자 입장이됨 사용하기 위해는 허가를 받아야함
    .then(()=>{         //로그인시 앞장에서 만들었던 nodebird 아이디 사용 가능 
        res.redirect('/')
    })
    .catch((error)=>{
        next(error)
    })
});

module.exports = router;