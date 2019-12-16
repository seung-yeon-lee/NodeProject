const mongoose = require('mongoose');
const {Schema}= mongoose;
const {Types:{ObjectId}}=Schema;
const chatSchema = new Schema({
    room:{ //채팅방 아이디
        type:ObjectId,
        required:true,
        ref:'Room',  //room 필드는 Room 스키마와 연결하여 Room 컬렉션의 ObjectId가 들어가게됨
    },
    user:{ //체팅을 한 사람
        type:String,
        required:true,
    },
    chat:String, //채팅 내역
    gif: String, //이미지 주소

    createdAt:{ //채팅시간
        type:Date,
        default:Date.now,
    },
});

module.exports = mongoose.model('Chat', chatSchema)