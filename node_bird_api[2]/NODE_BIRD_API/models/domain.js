module.exports = (sequelize, DataTypes)=>(
    sequelize.define('domain',{
        host:{
            type:DataTypes.STRING(80),
            allowNull: false,
        },
        type:{
            type:DataTypes.STRING(10),
            allowNull:false,
        },
        clientSecret:{ //도메인 모델에는 host와 도메인종류(type),클라이언트 비밀키가 들어감 클라이언트 비밀키닌 API를 사용할 떄 필요한 비밀키
            type:DataTypes.STRING(40),
            allowNull:false,
        },
    },{
        validate:{ //데이터를 추가로 검증하는 속성 unkown()이라는 검증키를 만듬 종류로 프리,프리미엄 둘중 하나만 선택할 수 있음 어길시 에러
            unknownType(){
                console.log(this.type, this.type !== 'free', this.type !== 'premium');
                if(this.type !== 'free' && this.type !== 'premium'){
                    throw new Error('type 칼럼은 free나 premium이어야 합니다.');
                }
            },
        },
        timestamps: true,
        paranoid: true,
    })
);
