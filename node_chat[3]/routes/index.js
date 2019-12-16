const express = require('express');
const Room = require('../schemas/room')
const Chat = require('../schemas/chat')
const path = require('path');
const fs = require('fs');
const multer = require('multer')

const router = express.Router();

router.get('/', async(req,res,next)=>{
    try{
        const rooms = await Room.find({});
        res.render('main', {rooms,title:'GIF 채팅방',error:req.flash('roomError')})
    }catch(error){
        console.error(error)
        next(error)
    }
});

router.get('/room', (req,res)=>{
    res.render('room', {title: '채팅방 생성'});
});

router.post('/room', async(req,res,next)=>{
    try{ //채팅방을 만드는 라우터 app.set('io,io)로 저장했던 io 객체를 가져온다
        const room = new Room({
            title: req.body.title,
            max: req.body.max,
            owner:req.session.color,
            password:req.body.password,
        });
        const newRoom = await room.save();
        const io = req.app.get('io'); // app.set('io',io)로 저장했던 io 객체를 가져 오는 코드
        io.of('/room').emit('newRoom', newRoom); //emit메서드는 /room 네임스페이스에 연결한 모든 클라이언트에게 데이터를 보내는 메서드
        res.redirect(`/room/${newRoom._id}?password=${req.body.password}`); //네임스페이스가 따로 없는 경우 io.emit메서드로 모든 클라이언트에게 데이터보낼수있음
    }catch(error){
        console.error(error)
        next(error)
    }
});

router.get('/room/:id', async(req,res,next)=>{
    try{ //채팅방을 렌더링 하는 라우터 , 렌더링 전에 방이 존재하는지 비밀방일 경우에는 비밀번호가 맞는지 허용인원 초과하지않았는지 등 검사
    const room = await Room.findOne({_id:req.params.id})
    const io = req.app.get('io') //io객체를 가져옴
    if(!room){
        req.flash('roomError', '존재하지 않는 방입니다.');
        return res.redirect('/')
    }
    if(room.password && room.password !== req.query.password){
        req.flash('roomError', '비밀번호가 틀렸습니다.')
        return res.redirect('/')
    }
    const {rooms}= io.of('/chat').adapter; //<= 옆 코드에 방 목록이 들어있음
    if(rooms && rooms[req.params.id] && room.max <=rooms[req.params.id].length){// 해당방의 소켓목록이 나옴 이것으로 소켓의 수를 세서 참가인원을 알 수 있음
        req.flash('roomError', '허용 인원이 초과하였습니다.')
        return res.redirect('/')
    }
    const chats = await Chat.find({room:room._id}).sort('createAt'); //채팅하는 부분 추가(chat.pug 채팅 부분)
                   // 기존 채팅 내역을 불러옴 , 방 접속시 db로 부터 채팅내역 가져오고 접속 후 웹소켓으로 새로운 채팅 메세지를 받음
    return res.render('chat',{
        room,
        title:room.title,
        chats:[],
        chats,        // 랜더링 할떄  Chat에서 찾은 roon._id값을 대입하여 추가
        user:req.session.color
    });
    }catch(error){
        console.error(error);
        return next(error)
    }
});

router.delete('/room/:id', async(req,res,next)=>{
    try{
        await Room.remove({_id:req.params.id})
        await Chat.remove({room:req.params.id});
        res.send('ok');
        setTimeout(() => {
            req.app.get('io').of('/room').emit('removeRoom', req.params.id);
        }, 2000);
    }catch(error){
        console.error(error)
        next(error)
    }
});

router.post('/room/:id/chat', async(req,res,next)=>{ //채팅을 db에 저장
    try{
        const chat = new Chat({
            room:req.params.id,
            user:req.session.color,
            chat:req.body.chat,
        });
        await chat.save();
        req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat); //<- 같은 방에 들어있는 소켓들에게 메세지 데이터를 전송
        res.send('ok')
    }catch(error){
        console.error(error)
        next(error)
    }
});

//이미지 업로드(chat.pug 마지막에 해당하는 라우터 )
fs.readdir('uploads', (error)=>{
    if(error){
        console.error('uploads 폴더가 없어 폴더를 생성합니다.')
        fs.mkdirSync('uploads')
    }
});
const upload = multer({       //nodeBird[1] 에서 사용한 업로드 방식과 같은 참조, 파일이 업로드 된 후 저장하고 방의 모든 소켓에게 데이터를 보냄
    storage: multer.diskStorage({   //upload폴더를 미들웨어로 연결시켜야 함. appjs
        destination(req,file,cb){
            cb(null,'uploads/')
        },
        filename(req,file,cb){
            const ext = path.extname(file.originalname);
            cb(null,path.basename(file.originalname, ext)+ new Date().valueOf()+ext);
        },
    }),
    limits: {fileSize:5 * 1024 * 1024},
});
router.post('/room/:id/gif', upload.single('gif'), async(req,res,next)=>{
    try{
        const chat = new Chat({
            room: req.params.id,
            user: req.session.color,
            gif: req.file.filename
        });
        await chat.save();
        req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
        res.send('ok');
    }catch(error){
        console.error(error);
        next(error)
    }
});


module.exports = router;
