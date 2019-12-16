const Sequrelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize= new Sequrelize(
  config.database, config.username, config.password, config,
);
db.sequelize =sequelize;
db.Sequrelize= Sequrelize;
db.User = require('./user')(sequelize,Sequrelize);
db.Post= require('./post')(sequelize, Sequrelize);
db.Hashtag = require('./hashtag')(sequelize,Sequrelize);
db.Domain = require('./domain')(sequelize, Sequrelize); //Api작업용 생성한 domain.js 연결//
db.User.hasMany(db.Post); //user.post는 1:N 관계로 연결되어있음 시퀄라이즈는 post모델에 userId 컬럼을 추가함.
db.Post.belongsTo(db.User);
db.Post.belongsToMany(db.Hashtag,{through: 'PostHashtag'}); //post hashtag모델은 N:M(다대다)
db.Hashtag.belongsToMany(db.Post,{through:'PoshHashtag'})
db.User.belongsToMany(db.User,{
  foreignKey: 'followingId',
  as: 'Followers',
  through: 'Follow',
});
db.User.belongsToMany(db.User,{ //같은 테이블간 N:M 관계에선 모델 이름과 컬럼이름을 따로 정해줘야함. foreginKey 옵션에 각각 지정
  foreignKey: 'followerId',    //as 옵션은 시퀄라이즈가 조인 작업시 사용 하는 이름. getfollowinmgs. getfollwers, addfollowing addfollower등 메서드 자동 추가
  as:'Followings',
  through:'Follow'
});
 //사용자모델과 일대다 관계를 가지는데 사용자 한명이 여러 도메인을 소유할 수 있기 때문
db.User.hasMany(db.Domain);
db.Domain.belongsTo(db.User);



module.exports= db;