import passport from "passport"
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
passport.serializeUser((user,done)=>{
done(null,user)
})
passport.deserializeUser((user,done)=>{
  done(null,user)
       
})
passport.use(new GoogleStrategy({
    clientID: "775881117552-sadk4h5jbejfrrc8bj51j0ctvpe8psom.apps.googleusercontent.com",
    clientSecret: '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',
    callbackURL: "https://styleswap.online/userLogin/login-with-google/callback",
    passReqToCallback: true, 
  }, (request, accessToken, refreshToken, profile, done) => {
    return done(null,profile)
    // Handle the authentication callback
  }))

 export { passport}
