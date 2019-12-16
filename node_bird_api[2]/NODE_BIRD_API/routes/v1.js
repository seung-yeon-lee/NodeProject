///JWT(Json Web Token)는 json형식의 데이터를 저장하는 토큰
// 헤더(headers): 토큰의 종류와 해시 알고리즘 정보가 들어있음
// 페이로드(payload):토큰의 내용물이 인코딩된 부분
// 시그니처(signature):일련의 문자열, 토큰이 변조되었는지 여부를 확인할 수 있음
// 사용자이름,권한 등 외부에 노출되어도 좋은 정보에 한해서 믿고 사용이 가능

const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('./middlewares');
const { Domain, User, Post, Hashtag } = require('../models');

const router = express.Router();

router.post('/token', async (req, res) => {
    const { clientSecret } = req.body;
    try {
        const domain = await Domain.findOne({
            where: { clientSecret },
            include: {
                model: User,
                attribute: ['nick', 'id'],
            },
        });
        if (!domain) {
            return res.status(401).json({
                code: 401,
                message: '등록되지 않은 도메인 입니다. 도메인을 등록하세요'
            });
        } //등록되지 않은 도메인이라면 에러 메세지로 응답하고 등록된 도메인이라면 토큰을 발급해서 응답한다. jwt.sing 메서드로 발급 받을 수 있다
        const token = jwt.sign({ //첫번째 인자는 토큰의 내용 id와 nick을 넣어줌
            id: domain.user.id,
            nick: domain.user.nick,
        }, process.env.JWT_SECRET, { // 두번쨰 인자는 토큰의 비밀키
            expiresIn: '1m', //세번째 인자는 토큰의 설정 유효기간을 1분으로 발급자를 nodebird로 적어주었음
            issuer: 'nodebird',
        });
        return res.json({
            code: 200,
            message: '토큰이 발급되었습니다.',
            token: token
        });
    } catch (error) {
        console.error(errpr);
        return res.status(500).json({
            code: 500,
            message: '서버 에러'
        });
    }
});

router.get('/test', verifyToken, (req, res) => {
    res.json(req.decoded)
});
//다시 API제공자의 입장으로 나머지 api 라우터를 완성시키기 위한 코드 //  -----------------------------------------
router.get('/posts/my', verifyToken, (req, res) => {
    Post.findAll({ where: { userId: req.decoded.id } })
        .then((posts) => { //req.decoded.id 의 값을 userId에 담는다
            console.log(posts);
            res.json({
                code: 200,
                playload: posts, //playload = token의 내용물이 인코딩된 것 , playload의 값으로 posts로 할당
            });
        })
        .catch((error) => {
            console.error(error)
            return res.status(500).json({
                code: 500,
                message: 'Server Error',
            });
        });
});     //내가 올린 포스트와 해시태그 검색 결과를 가져오는 라우터 이렇듯 사용자에게 제공해도 되는 정보를 API로 만들면 됨. 위에 post/my  라우터도 마찬가지
router.get('posts/hashtag/:title', verifyToken, async (req, res) => {
    try {
        const hashtag = await Hashtag.findOne({ where: { title: req.params.title } });
        if (!hashtag) {
            return res.status(404).json({
                code: 404,
                message: '검색 결과가 없습니다',
            });
        }
        const posts = await hashtag.getPosts()  //getposts 메서드 다시 보기
        return res.json({
            code: 200,
            payload: posts,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러'
        })        //작성 후 사용하는 측으로 가서 api를 이용하는 코드 작성 => nodebird-call/router/index.js에 기입
    }             // 토큰을 발급 받는 부분이 반복되므로 이를 함수로 만들어 재사용하는 것이 좋음.
})






















module.exports = router;

