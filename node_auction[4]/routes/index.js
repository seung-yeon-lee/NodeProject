const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule'); //스케쥴링 구현을 위한 모듈, 카운트 종료시 낙찰자를 정하기 위함

const {Good, Auction, User, sequelize} = require('../models')        //스케쥴링
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
        const good= await Good.create({  //스케쥴링 구현  Good 변수를 생성한 후 await 대입
            ownerId: req.user.id,
            name,
            img:req.file.filename,
            price,
        });
        //스케쥴링 코드 추가 ++
        const end = new Date();
        end.setDate(end.getDate()+1); //하루 뒤
        schedule.scheduleJob(end, async()=>{ //scheduljob 메서드로 일정을 예약,첫번쨰 인자는 실행될 시간, 두번쨰 인자로 해당 시각이 되었을떄 수행할 콜백
            const success = await Auction.findOne({
                where:{goodId:good.id},
                order:[['bid','DESC']],
            });         //가장 높은 입찰을 한 사람을 찾아 상품 모델의 낙찰자 아이디에 넣어주도록 정의
            await Good.update({soldId:success.userId},{where:{id:good.id}});
            await User.update({
                money: sequelize.literal(`money -${success.bid}`), //낙찰자의 보유자산을 낙찰 금액만큼 빼는 코드(칼럼-숫자), 늘리려면 +
            },{     //스케쥴링은 노드가 종료되면 예약도 같이 종료, 보완하기위해 서버가 시작될 떄 경매 시작후 24시간이 지났을떄 낙찰자 없는 경매를 찾아
               where:{id:success.userId}    //낙찰자를 지정하는 코드를 추가해야함 (checkAuction.js)
            });
        });
        res.redirect('/')
    }catch(error){
        console.error(error);
        next(error)
    }
});
 router.get('/good/:id', isLoggedIn, async(req,res,next)=>{ //해당 상품과 기존 입찰 정보들을 불러온 뒤 렌더링
     try{
         const [good, auction]= await Promise.all([
             Good.findOne({
                 where:{ id: req.params.id},
                 include:{
                     model:User,
                     as:'owner', //상픔모델에 사용자모델은 include.. *as속성 사용, good,user모델은 일대다 관계가 두번 연결(owner,sold)로 되어있으므로,
                 },              // 이런경우에는 어떤 관계를 include 할지 as속성으로 밝혀줘야함.
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

 router.post('/good/:id/bid', isLoggedIn, async(req,res,next)=>{ //클라이언트로부터 받은 입창정보를 저장
     try{  //정상적인 입찰가가 들어왔다면 저장 후 해당 경매방의 모든 사람에게 입찰자,입찰가격,입찰메세지등을 웹 소켓으로 전달 
        const{bid, msg} = req.body; 
        const good = await Good.findOne({
            where:{id:req.params.id},
            include:{model:Auction},
            order:[[{model:Auction}, 'bid', 'DESC']], //order는 include될 모델의 칼럼을 정렬하는 방법, auction모델의 bid를 내림차순으로 정렬
        });
        if(good.price > bid){  //시작 가격보다 낮게 입찰 한다면
            return res.status(403).send('시작 가격보다 높게 입찰해야 합니다.')
        }
        //경매 종료 시간이 지났으면
        if( new Date(good.createdAt).valueOf() +(24*60*60*1000)< new Date()){
            return res.status(403).send('경매가 이미 종료되었습니다')
        } 
        //직전 입찰가와 현재 입찰가 비교
        if(good.auctions[0] && good.auctions[0].bid >= bid){
            return res.status(403).send('이전 입찰가보다 높아야 합니다')
        }                                       
        const result = await Auction.create({   
            bid,                                
            msg,
            userId: req.user.id,
            goodId: req.params.id,
        });
        req.app.get('io').to(req.params.id).emit('bid',{
            bid:result.bid,
            msg:result.msg,
            nick:req.user.nick,
        });
        return res.send('Ok')
     }catch(error){
         console.error(error)
         next(error)
     }
 })

 //낙찰자가 낙찰 내역을 볼 수 있게 하는 라우터 

 router.get('/list', isLoggedIn, async(req,res,next)=>{
     try{
         const goods = await Good.findAll({
             where:{soldId:req.user.id},
             include: {model:Auction},
             order:[[{model:Auction},'bid','DESC']], //낙찰 상품과 입찰내역을 조회한 후 렌더링, 입찰내역은 내림차순으로 정렬하여 낙찰자의 내역이 가장 위에
         });
         res.render('list',{title:'낙찰 목록 - NodeAuction', goods:goods})
     }catch(error){
         console.error(error)
         next(error)
     }
 });
module.exports = router;