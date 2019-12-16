const mongoose = require('mongoose');

const { Schema } = mongoose;
const roomSchema = new Schema({
    title:{ //방 제목
        type: String,
        required: true,
    },
    max:{ // 최대 수용인원
        type:Number,
        required:true,
        default:10,  //기본적으로 10명, 최소인원은 2명
        min:2,
    },
    owner:{ //방장
        type:String,
        required:true,
    },
    password:String, //비밀번호는 requred 속성이 없으므로 꼭 넣지 않아도 됨. 비밀번호를 설정한다면 비밀방, 설정하지않는 다면 공개방

    createdAt:{ //생성시간
        type:Date,
        default:Date.now
    },
});

module.exports = mongoose.model('Room', roomSchema);

//채팅방 스키마 생성 => 채팅 스키마(chat.js)