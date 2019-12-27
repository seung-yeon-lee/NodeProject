const mongoose = require('mongoose');
const {Schema}= mongoose;
const historySchema= new Schema({  //검색내역 스키마는  검색어와 생성시간 스키마로 구성되어있음
    query:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
})

module.exports = mongoose.model('History', historySchema)