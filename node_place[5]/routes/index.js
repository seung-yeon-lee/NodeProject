
// 3개의 라우터 작성 메인화면 라우터get/ , 검색어 자동완성 라우터 get/autocomplete/:Query, 장소검색 라우터 get/search:/query로 구성

const express = require('express');
const util = require('util');
const googleMaps = require('@google/maps');

const History = require('../Schemas/history'); //검색어,생성시간 스키마 정의 한 것 require
const Favorite = require('../Schemas/favorite') //즐겨찾기 구현

const router = express.Router();
const googleMapsClient = googleMaps.createClient({ //구글 지도 클라이언트를 만드는 방법 create 메서드에 .env파일에 적어두었던 키를 넣어둠
    key:process.env.PLACES_API_KEY,
}); //생성된 클라이언트에는 places,placesQueryAutoComplete,placeNearBy 등의 메서드가 들어있음 이 메서드를 활용하여 API를 사용 할 수 있음

router.get('/', async(req,res,next)=>{
    try{
        const favorites = await Favorite.find({});
        res.render('index',{results:favorites})
    }catch(error){
        console.error(error)
        next(error)
    } 
});

router.get('/autocomplete/:query', (req,res,next)=>{ 
    googleMapsClient.placesQueryAutoComplete({ //placesQuery...(검색어 자동완성)를 사용한 라우터
        input: req.params.query,    //라우터로부터 전달된 쿼리를 input으로 넣어줌
        language:'ko', //한국어로 설정
    },(err,response)=>{   //콜백방식으로 동작 결과는 response.json.predictions에 담겨있음, 예상 검색어는 최대 5개까지 반환
        if(err){
            return next(err)
        }
        return res.json(response.json.predictions);
    });
});
router.get('/search/:query', async(req,res,next)=>{ 
    const googlePlaces = util.promisify(googleMapsClient.places);
    const googlePlacesNearby = util.promisify(googleMapsClient.placesNearby);
    const { lat,lng,type }= req.query;    //자세한 검색을 위해 type울 추가했으므로 추가
    try{
      const history= new History({ query: req.params.query});
      await history.save();
      let response;
      if(lat && lng){   //쿼리스트링으로  lat,lng가 제공되면 places API 대신에 placesNearby API를 사용
          response = await googlePlacesNearby({
              keyword: req.params.query,   //찾을 검색어
              location: `${lat},${lng}`,   //위도,경도
              rankby: 'distance',          // 정렬 순서
              type,                        // type 추가
              language:'ko'                //radius를 사용하진 않았지만 인기순으로 정렬하거나, 검색 반경을 입력하는 용도로 사용 가능
          });                              // 현재 작성한 코드는 가까운 거리순, 인기순으로 하고싶다면 radius:5000, 추가(rankby 대신)
      }else{
          response = await googlePlaces({
              query: req.params.query,
              language:'ko',
              type,
          })
      }
      res.render('result', {
          title: `${req.params.query} 검색결과`,
          results: response.json.results,
          query: req.params.query,
      })
    }catch(error){
        console.error(error)
        next(error)
    }
});

router.post('/location/:id/favorite', async(req,res,next)=>{
    try{
        const favorite = await Favorite.create({
            placeId: req.params.id,
            name: req.body.name,
            location: [req.body.lng, req.body.lat], //주의 google Map API 사용떄와 다르게 경도, 위도 순으로 넣어야 함.
        });
        res.send(favorite);
    }catch(error){
        console.error(error)
        next(error)
    }
});





module.exports = router;




// //     google places API가 그렇게 저확한 결과를 반환하지않아서 내 위치 주변을 검색하는 api를 만드는 작업 전에 사용 하던 코드

// // router.get('/search/:query', async(req,res,next)=>{ //실제 장소검색 시 결괏값을 반환 하는 라우터, 반환이전에 검색 내역을 구현하기 위해 db에 검색어를 저장
// //     const googlePlaces = util.promisify(googleMapsClient.places); //util.pro.. 사용하는 이유는 구글 지도 클라이언트는 콜백 방식으로 동작
// //     try{                                                          // 몽구스 프로미스와 같이 사용하기 위해 promise 패턴으로 바꾸고 > async/await으로 바꿔줌.
// //         const history = new History({ query: req.params.query });
// //         await history.save();
// //         const response = await googlePlaces({ //places 메서드로 장소를 검색할 수 있음, query에 검색어를 넣어줌
// //             query:req.params.query,
// //             language:'ko',
// //         });
// //         res.render('result', {
// //             title: `${req.params.query} 검색 결과`,
// //             results: response.json.results,  //결과는 response.json.results에 담겨 있음
// //             query: req.params.query,    //지금까진 Google Places API 이용 앞으론 Google Maps API를 사용하여 지도에 결과 표시  
// //         });
// //     }catch(error){
// //         console.error(error);
// //         next(error)
// //     }
// // });

