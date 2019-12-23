const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {Good,Auction,User}= require('../models');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

const router = express.Router();

router.use((req,res,next)=>{ //모든 pug 템플릿에 사용자 정보를 변수로 넣음 , res.render 메서드에 user:req.user를 하지않아도 되므로 중복 제거
    res.locals.user = req.user;
    next()
});

router.get('/' ,async(req,res,next)=>{
    try{                                            //soldId가 낙찰자의 아이디이므로 낙찰자가 null 이면 경매
        const goods = await Good.findAll({where:{soldId: null}})
        res.render('main',{
            title:'NodeAuction',
            goods,
            loginError:req.flash('loginError')
        });
    }catch(error){
        console.error(error)
        next(error)
    }                    //.get은 메인화면을 렌더링, 렌더링할때 경매가 진행중인 상품목록도 같이 불러옴, soldId가 낙찰자의 아이디이므로 null이면 경매가 진행중
});

router.get('/join', isNotLoggedIn, (req,res)=>{
    res.render('join',{
        title:'회원가입 - NodeAuction',
        joinError:req.flash('joinError')
    });
});

router.get('/good',isLoggedIn, (req,res)=>{
    res.render('good', {title:'상품 등록 -NodeAuction'})
});

fs.readdir('uploads',(error)=>{
    if(error){
        console.error('uploads 폴더가 없어 생성합니다.')
        fs.mkdirSync('uploads')
    }
});
const upload = multer({
    storage:multer.diskStorage({
        destination(req,file,cb){
            cb(null, 'uploads/');
        },
        filename(req,file,cb){
            const ext= path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext)+ new Date().valueOf()+ext)
        },
    }),
    limits:{fileSize: 5 *1024 *1024},
});

router.post('/good', isLoggedIn, upload.single('img'), async(req,res,next)=>{
    try{
        const {name, price} = req.body;
        await Good.create({
            ownerId: req.user.id,
            name,
            img:req.file.filename,
            price,
        });
        res.redirect('/')
    }catch(error){
        console.error(error);
        next(error)
    }
});
 router.get('/good/:id', isLoggedIn, async(req,res,next)=>{
     try{
         const [good, auction]= await Promise.all([
             Good.findOne({
                 where:{ id: req.params.id},
                 include:{
                     model:User,
                     as:'owner',
                 },
             }),
             Auction.findAll({
                 where:{goodId:req.params.id},
                 include:{model:User},
                 order:[['bid','ASC']],
             }),
         ]);
         res.render('auction',{
             title: `${good.name}- NodeAuction`,
             good,
             auction,
             auctionError: req.flash('auction Error')
         });
     }catch(error){
         console.error(error)
         next(error)
     }
 });

 router.post('/good/:id/bid', isLoggedIn, async(req,res,next)=>{
     try{
        const{bid, msg} = req.body;
        const good = await Good.findOne({
            where:{id:req.params.id},
            include:{model:Auction},
        })
     }catch(error){
         console.error(error)
         next(error)
     }
 })




module.exports = router;