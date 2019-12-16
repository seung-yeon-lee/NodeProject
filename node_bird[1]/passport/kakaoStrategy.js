
const KakaoStrategy = require('passport-kakao').Strategy;

const { User } = require('../models');

module.exports = (passport) => {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_ID,
    callbackURL: 'http://localhost:3333/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done) => { //기존에 카카오로 로그인한 사용자가 있는지 조회, 있다면 done 호출
    try {
      const exUser = await User.findOne({ where: { snsId: profile.id, provider: 'kakao' } });
      if (exUser) {
        done(null, exUser);
      } else {  //없다면 회원가입 진행 => 사용자 생성 뒤 done 호출
        const newUser = await User.create({
          email: profile._json && profile._json.kaccount_email,
          nick: profile.displayName,
          snsId: profile.id,
          provider: 'kakao',
        });
    
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};