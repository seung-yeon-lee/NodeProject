const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db={};

const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize= sequelize;
db.Sequelize= Sequelize;
db.User=require('./user')(sequelize,Sequelize);
db.Good=require('./good')(sequelize,Sequelize);
db.Auction=require('./auction')(sequelize,Sequelize);

db.Good.belongsTo(db.User, {as:'owner'});// 사용자 모델과 상품 모델간에는 일대다 관계가 두번 적용됨. 사용자가 여러 상품을 등록할 수 있고 사용자가 여러 상품을 
db.Good.belongsTo(db.User, {as:'sold'}); // 낙찰 받을 수도 있기 떄문, 두 관계를 구별하기 위해 as 속성에 관계명을 지정함 각각 ownerId, soldId 컬럼으로 추가됨
db.User.hasMany(db.Auction);  //사용자가 입찰을 여러번 할 수 있으므로 사용자 모델과 경매 모델은 일대다 관계
db.Good.hasMany(db.Auction);  // 한 상품에 여러명이 입찰하므로 상품모델과 경매모델도 일대다 관계
db.Auction.belongsTo(db.User); 
db.Auction.belongsTo(db.Good);

module.exports = db;

//로그인을 위한 passport local만 사용 =>

// config.json 작성 후 //sequelize db:create로 db생성