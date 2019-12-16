//API를 사용하려면 인증을 받아야하므로 사용자 인증이 원활하게 진행되는지 테스트 하는 라우터//
const express = require('express');
const axios = require('axios'); //다른 서버로 요청을 보내는 패키지
const router = express.Router();

//nodeAPI(v1.js)에서 작성한 것을 사용하는 코드
const URL = 'http://localhost:8002/v1';

axios.defaults.headers.origin = 'http://localhost:8003'
const request = async (req,api)=>{
    try{
     if(!req.session.jwt){ //session에 토큰이 없다면
        const tokenResult = await axios.post(`${URL}/token`,{ //axios.post(주소,{데이터})를 하면 요청본문에 데이터를 실어보내는 것 응답결과는
            clientSecret:process.env.CLIENT_SECRET,           //await으로 받은 객체의 data 속성에 들어있음 (API서버에서 보내주는 응답값)
   });
   req.session.jwt = tokenResult.data.token; //세션에 토큰 저장  data= 위에 글 참조
     }
     return await axios.get(`${URL}${api}`,{
         headers:{authorization:req.session.jwt},
     });  //API 요청
    }catch(error){
        console.error(error);
        if(error.response.status<500){  //410이나 419처럼 의도된 에러면 발생
            return error.response;
        }
        throw error;
    }
};

router.get('/mypost', async(req,res,next)=>{
    try{
     const result= await request(req, '/posts/my');  //토큰 발급 받는 부분이 반복되므로 위에서 사용한 request 사용
     res.json(result.data)
    }catch(error){
     console.error(error);
     next(error)
    }
});

router.get('/search/:hashtag', async(req,res,next)=>{
    try{
        const result = await request(
            req, `posts/hashtag/${encodeURIComponent(req.params.hashtag)}`,
        );
        res.json(result.data);
    }catch(error){
        if(error.code){
            console.error(error)
            next(error)
        }
    }
});

//이전에는 call이 api를 호출하는 것은 서버에서 서버로 API를 호출한 것 이후 작성하는 것은 call의 프론트에서 서버 api를 호출할 떄 사용

router.get('/', (req,res)=>{
    res.render('main',{key:process.env.CLIENT_SECRET});
});

module.exports = router;


// // router.get('/test', async(req,res,next)=>{
// //     try{
// //       if(!req.session.jwt){ //세션에 토큰이없으면
// //         const tokenResult = await axios.post('http://localhost:8002/v1/token',{
// //             clientSecret: process.env.CLIENT_SECRET,
// //         }); //발급받은  토큰이 저장되어있지않다면 post 라우터로부터 토큰을 발급받음 이때 http 요청본문에 클라이언트 비밀키를 실어 보냄.
// //         if(tokenResult.data && tokenResult.data.code === 200){ //토큰발행 성공
// //             req.session.jwt = tokenResult.data.token; //세션에 토큰 저장
// //         }else{ //토큰 발급 실패
// //             return res.json(tokenResult.data); //발급 실패 사유 응답
// //         }
// //     }  
// //     //발급받은 토큰 테스트 (발급에 성공했다면 get으로 접근하여 토큰을 테스트해봄)
// //     const result = await axios.get('http://localhost:8002/v1/test', {
// //         headers: {authorization: req.session.jwt}, //보통 토큰은 http여청 헤더에 넣어서 보냄 **응답결과는 await으로 받은 객체의 data 속성에 있음
// //     });
// //     return res.json(result.data);
// //     }catch(error){
// //     console.error(error);
// //     if(error.response.status === 419){  //토큰 만료시
// //         return res.json(error.response.data)
// //     }
// //     return next(error)
// //     }
// // });

// // module.exports = router;