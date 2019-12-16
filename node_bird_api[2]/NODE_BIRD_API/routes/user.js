const express = require('express');

const {isLoggedIn} = require('./middlewares');
const {User} = require('../models');

const router = express.Router();
//다른 사용자를 팔로우 할 수 있는 /user/:id/follow 라우터  :id 부분이 req.params.id가 된다
router.post('/:id/follow', isLoggedIn, async(req,res,next)=>{
    try{ //먼저 팔로우할 사용자를 db에서 조회한 후 시퀄라이즈에서 추가한 addfollowing 메서드로 현재 로그인한 사용자의 관계를 지정
        const user = await User.findOne({where:{id:req.user.id}});
        await user.addFollowing(parseInt(req.params.id, 10));
        res.send('Success');
    }catch(error){
        console.error(error);
        next(error)
    }
});
//팔로잉 관계가 생겼으므로 req.user에도 팔로워와 팔로잉 목록을 저장해야함  passport/index.js에서 deserializeUser 부분 조작 
module.exports = router;
