module.exports=(sequelize, DataTypes)=>(
    sequelize.define('auction',{
        bid:{
            type:DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        msg: {
            type:DataTypes.STRING(100),
            allowNull:false,
        },
    },{
        timestamps: true,
        paranoid: true,
    })
)

//경매모델은 입찰가 입찰시 메시지로 구성  3가지 모델 다 정의하였으니 DB 및 Server와 연결 config.json