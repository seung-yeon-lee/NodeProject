const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag, User} =require('../models');
const {isLoggedIn} = require('./middlewares')

const router = express.Router();

fs.readdir('uploads',(error)=>{
    if(error){
        console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다')
        fs.mkdirSync('uploads')
    }
});
const upload = multer({  //multer 모듈에 옵션을 주어 upload변수에 대입 upload는 미들웨어를 만드는 객체가 됨 storage 에는 파일 저장 방식 경로, 파일명등을 설정할 수 있음
    storage:multer.diskStorage({ //diskstorage를 사용해 서버 디스크에 저장되도록함 destination 메서드로 저장 경로를 uploads폴더로 지정
        destination(req,file,cb){
            cb(null, 'uploads/')
        },
        filename(req,file,cb){ //filename 메서드로 기존이름(file.originalname)에 업로드 날짜값과 기존확장자(path.extname)를 붙이도록 설정
            const ext = path.extname(file.originalname);
            cb(null,path.basename(file.originalname, ext)+ Date.now())
        },
    }),
    limits:{fileSize: 5 * 1024 * 1024}, //최대 이미지 파일 용량 허용치를 의미 현재 10MB
}); //이미지 업로드 처리 라우터
router.post('/img', isLoggedIn, upload.single('img'),(req,res)=>{ //single은 하나의 이미지를 업로드할떄 사용하며 req.file 객체를 셍성
    console.log(req.file);                     //array,fields는 여러개의 이미지를 업로드할떄 사용, req.files객체를 생성 
    res.json({url: `img/${req.file.filename}`}); //array,field차이점= 이미지 업로드한 body 속성 개수 속성하나에 여러개 =array, 
});                                              // 여러속성에 이미지를 하나씩 업로드했다면 fields사용 none은 이미지를 올리지않고 데이터만 전송

const upload2 = multer(); //게시글 업로드 처리 라우터 이미지를 업로드했다면 이미지 주소도 req.body.url로 전송
router.post('/', isLoggedIn, upload2.none(), async(req,res,next)=>{ //아직 이미지 데이터가 없음으로 none 메서드 사용
    try{
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            userId: req.user.id,
        }); //이미지 주소가 온 것이지 데이터 자체가 온것이 아님. 게시글을 db에 저장 후 게시글 내용에서 해시태그를 정규표현식으로 추출
        const hashtags = req.body.content.match(/#[^\s]*/g); //추출한 해시태그들을 db에 저장후 post.addhashtag 메서드로 게시글과 해시태그 관계를
        if(hashtags){                                       //posthashtag테이블에 넣음
            const result = await Promise.all(hashtags.map(tag=> Hashtag.findOrCreate({
                where: {title: tag.slice(1).toLowerCase()},
            })));
            await post.addhashtags(result.map(r => r[0]))
        }
        res.redirect('/');
    }catch(error){
        console.error(error)
        next(error)
    }
});
//해시태그로 조회하는 /post/hashtag 라우터  쿼리스트링으로 해시태그 이름을 받고 해시태그가 빈 문자열인 경우 메인페이지로 돌려보낸다
router.get('/hashtag', async(req,res,next)=>{
    const query = req.query.hashtag;
    if(!query){
        return res.redirect('/');
    }
    try{ //db에서 해당 해시태그가 존재하는지 검색 후 있다먼 시퀄라이즈 에서 제공하는 getPosts 메서드로 모든 게시글을 가져온다
        const hashtag = await Hashtag.findOne({where: {title:query}});
        let posts=[];
        if(hashtag){
            posts= await hashtag.getPosts({include:[{model:User}]})
        } //가져올떄 작성자 정보를 join하고 조회 후 메인페이지를 렌더링하면서 전체 게시글 대신 조회된 게시글만 twits에 넣어 렌더링
        return res.render('main',{
            title:`${query}||NodeBird`,
            user: req.user,
            twits:posts,
        });
    }catch(error){
        console.error(error);
        return next(error)
    }
});

module.exports = router;
