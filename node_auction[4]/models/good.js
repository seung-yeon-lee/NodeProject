module.exports= (sequelize, DataTypes)=>(
    sequelize.define('good',{
        name:{
            type:DataTypes.STRING(40),
            allowNull: false,
        },
        img:{
            type:DataTypes.STRING(200),
            allowNull:false,
        },
        price:{
            type:DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
    },{
        timestamps: true,
        paranoid: true,
    })
);
//상품 모델은 상품명 상품사진 시작가격으로 구성