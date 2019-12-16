const express = require('express');
const { isLoggedIn, isNotLoggedIn} = require('./middlewares') //로그인 매서드 호출
const {User,Post}= require('../models')
const router= express.Router();



router.get('/profile', isLoggedIn,(req,res)=>{  //자신의 프로필은 로그인해야 볼 수 있으므로 isloggedin 미들웨어를 사용 true여야 넘어감
    res.render('profile', {title: '내 정보 - NodeBird', user:req.user});
});          //user 속성에 req.user를 넣어줌으로서 pug에서 user 객체를 통해 자용자 정보에 접근할 수 있게됨.

router.get('/join',isNotLoggedIn, (req,res)=>{
    res.render('join',{
        title: '회원가입 -NodeBird',
        user: req.user,
        joinError: req.flash('joinError'), //회원가입과 로그인시 에러보여주기위해 flash 메세지가 연결되어 있음//
    });
});

router.get('/', (req,res,next)=>{
   Post.findAll({
       include:{
           model:User,
           attributes:['id','nick'],
       }, 
       order:[['createdAt','DESC']],
   })
   .then((posts)=>{
    res.render('main',{
        title: 'NodeBird',
        twits:posts,  //db에서 게시글을 조회한 뒤 결과를 twits에 넣어 렌더링, 조회할때 게시글 작성자의 아이디와 닉네임을 join해서 제공 , 게시글 순서는 최신순으로 정렬
        user:req.user,
        loginError: req.flash('loginError')
    });
   })
   .catch((error)=>{
       console.error(error)
       next(error)
   })
});

module.exports = router;
