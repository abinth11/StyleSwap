import twilio from "twilio"
import { validationResult } from "express-validator"
import userHelpers from "../../helpers/user-helpers.js"
import { loginAndSignUpHelpers } from "../../helpers/userHelpers/loginAndSignUpHelpers.js"
export const userLoginAndSignupControler = {
  userSignUpGet: (req, res) => {
    try {
      if (req.session.user) {
        res.redirect("/")
      } else {
        res.render("users/signup", {
          signUpErr: req.session.signUpErr,
          errors: req.session.err,
        })
        req.session.signUpErr = null
        req.session.err = null
      }
    } catch (error) {
      console.error(error)
      res.render("users/signup", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  usersignUpPost: async (req, res) => {
    try {
      const errors = validationResult(req)
      req.session.err = errors.errors
      const { email, mobile } = req.body
      if (req.session.err.length === 0) {
        const response = await loginAndSignUpHelpers.regisUserUser(req.body)
        if (response.email === email) {
          req.session.signUpErr = `${response.email} already exists please login`
          res.json({ status: false })
        } else if (response.mobile === mobile) {
          req.session.signUpErr = `${response.mobile} already exists please login`
          res.json({ status: false })
        } else if (response.status) {
          req.session.loggedIn = true
          req.session.user = response.userData
          const user = req.session.user
          userHelpers.createWallet(req.body, user)
          res.json({ status: true })
        }
      } else {
        res.json({ status: false })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json("Internal Server Error")
    }
  },
  userLoginGet: (req, res) => {
    try {
      let from
      req.query.from ? (from = req.query.from) : (from = "home")
      console.log(from)
      if (req.session.user) {
        res.redirect("/")
      } else {
        res.render("users/login", { loginErr: req.session.loginError, from })
        req.session.loginError = null
      }
    } catch (error) {
      console.error(error)
      res.render("users/login", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  otpValidateGet: (req, res) => {
    try {
      if (req.session.vid) {
        res.render("users/otp-enter", {
          otpError: req.session.otpErr,
          mobile: req.session.mobile,
        })
        req.session.otpErr = null
      } else {
        res.redirect("/")
      }
    } catch (error) {
      console.error(error)
      res.render("users/otp-enter", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  otpValidatePost: async (req, res) => {
    try {
      const {
        mobile,
        body: { otp },
      } = req.session
      const { valid } = await twilio.verifyOtp(mobile, otp)
      if (valid) {
        res.redirect("/")
      } else {
        const otpErr = "Invalid otp.."
        res.redirect("/otpValidate", { otpError: otpErr, mobile })
      }
    } catch (error) {
      console.error(error)
      res.render("users/otp-enter", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  loginWithOtpGet: (req, res) => {
    try {
      res.render("users/otp-login")
    } catch (error) {
      console.error(error)
      res.render("users/otp-login", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  loginWithOtpPost: async (req, res) => {
    try {
      const { mobile } = req.body
      req.session.mobile = mobile
      const response = await loginAndSignUpHelpers.loginWthOTP(req.body)
      if (response.status) {
        const verify = await twilio.generateOpt(mobile)
        req.session.vid = verify
        req.session.user = response.user
        res.redirect("/otpValidate")
      } else if (response.block) {
        req.session.loginError = "Your account is blocked by admin"
        res.redirect("/userLogin")
      } else {
        req.session.loginError = "Invalid phone number or password.."
        res.redirect("/userLogin")
      }
    } catch (error) {
      console.error(error)
      res.render("users/otp-login", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  userLoginPost: async (req, res) => {
    try {
      const { from } = req.body
      const errors = validationResult(req)
      const successResponse = {
        from,
        status: true,
      }
      const err = errors.errors
      req.session.mobile = req.body.mobile
      const guestId = req.session.guestUser?.id
      if (err.length === 0) {
        const response = await loginAndSignUpHelpers.loginUser(req.body)
        if (response.block) {
          req.session.loginError = "Your account is blocked by admin"
          res.json({ status: false })
        } else if (response.status) {
          req.session.user = response.user
          const userId = req.session.user._id
          if (from === "cart") {
            console.log(userId, guestId)
            await userHelpers.mergeGuestCartIntoUserCart(userId, guestId)
            req.session.guestUser = null
            res.json(successResponse)
          } else {
            res.json(successResponse)
          }
        } else {
          req.session.loginError = "Invalid phone number or password"
          res.json({ status: false })
        }
      }
    } catch (error) {
      console.error(error)
      res.status(500).json("Internal Server Error", { status: false })
    }
  },
}
