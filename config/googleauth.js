import passport from "passport"
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import ENV_VARS from "../envConfig.js"
passport.serializeUser((user,done)=>{
done(null,user)
})
passport.deserializeUser((user,done)=>{
  done(null,user)
       
})
passport.use(new GoogleStrategy({
    clientID:ENV_VARS.GOOGLE_CLIENT_ID,
    clientSecret: ENV_VARS.GOOGLE_CLIENT_SECRET,
    callbackURL: ENV_VARS.GOOGLE_CALLBACK_URL,
    passReqToCallback: true, 
  }, (request, accessToken, refreshToken, profile, done) => {
    return done(null,profile)
    // Handle the authentication callback
  }))

 export { passport}
