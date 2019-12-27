const mongoose = require('mongoose');
const {Schema}= mongoose;
const favoriteSchema = new Schema({
    placeId:{ //즐겨찾기 스키마  장소아이디,장소명,좌표,생성시간으로 구성
        type:String,
        unique: true, //다른 행 과 중복되선 안된다 
        required:true, //반드시 입력해야 한다
    },
    name:{
        type:String,
        required:true
    },
    location:{type:[Number], index:'2dsphere'}, //좌표를 저장하는 필드(칼럼), 경도,위도 정보가 배열로 들어옴 index부분은 위치정보를 저장하겠다라는 의미
    createdAt:{
        type:Date,
        default:Date.now,  //문서가 생성되면 기본값으로 저장
    },
});

module.exports = mongoose.model('Favorite', favoriteSchema)