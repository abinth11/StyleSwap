const userHelpers = require("../helpers/user-helpers");
let twilio = require('../middlewares/twilio')
let { validationResult } = require('express-validator');
let err;
module.exports = {
    userHome: (req, res) => {
        userHelpers.viewProduct().then((products) => {
            res.render('index', { user: req.session.user, products, userHome: true });
        })
    },
    userSignUpGet: (req, res) => {
        if (req.session.user) {
            res.redirect('/')
        }
        else {
            res.render('users/signup', { signUpErr: req.session.signUpErr, errors: req.session.err });
            req.session.signUpErr = null;
            req.session.err = null;
        }
    },
    usersignUpPost: (req, res) => {
        const errors = validationResult(req);
        req.session.err = errors.errors
        let { email, mobile } = req.body
        if (req.session.err.length == 0) {
            userHelpers.regisUserUser(req.body).then((response) => {
                if (response.email == email) {
                    req.session.signUpErr = `${response.email} already exists please login`
                    res.redirect('/userSignUp')
                }
                else if (response.mobile == mobile) {
                    req.session.signUpErr = `${response.mobile} already exists please login`
                    res.redirect('/userSignUp')
                }
                else if (response.status) {
                    req.session.loggedIn = true;
                    req.session.user = response.userData;
                    res.redirect('/');
                }
            })
        }
        else {
            res.redirect('/userSignUp');
        }
    },
    userLoginGet: (req, res) => {
        if (req.session.user) {
            res.redirect("/")
        }
        else {
            res.render('users/login', { loginErr: req.session.loginError });
            req.session.loginError = null;
        }
    },
    otpValidateGet: (req, res) => {
        if (req.session.vid) {
            res.render('users/otp-enter', { otpError: req.session.otpErr, mobile: req.session.mobile })
            req.session.otpErr = null;
        }
        else {
            res.redirect("/");
        }
    },
    otpValidatePost: (req, res) => {
        twilio.verifyOtp(req.session.mobile, req.body.otp).then((response) => {
            console.log(response)
            if (response.valid) {
                res.redirect('/');
            }
            else {
                req.session.otpErr = "Invalid otp.."
                res.redirect('/otpValidate')
            }
        })
    },
    loginWithOtpGet: (req, res) => {
        res.render('users/otp-login')
    },
    loginWithOtpPost: (req, res) => {
        let { mobile } = req.body
        req.session.mobile = mobile;
        console.log("called post method")
        userHelpers.loginWthOTP(req.body).then((response) => {
            console.log(response)
            if (response.status) {
                twilio.generateOpt(mobile).then((verify) => {
                    req.session.vid = verify
                    req.session.user = response.user;
                    res.redirect('/otpValidate')
                })
            }
            else if (response.block) {
                req.session.loginError = "Your accout is blocked by admin ";
                res.redirect('/userLogin');
            }
            else {
                req.session.loginError = "Invalid phone number or password.."
                res.redirect('/userLogin');
            }
        })
    },
    dashboard: (req, res) => {
        res.render('users/dashboard', { user: req.session.user })
    },
    userLoginPost: (req, res) => {
        const errors = validationResult(req);
        console.log(errors);
        err = errors.errors
        req.session.mobile = req.body.mobile;
        if (err.length == 0) {
            userHelpers.loginUser(req.body).then((response) => {
                if (response.block) {
                    req.session.loginError = "Your accout is blocked by admin ";
                    res.redirect('/userLogin');
                }
                else if (response.status) {
                    req.session.user = response.user;
                    res.redirect('/')
                }
                else {
                    req.session.loginError = "Invalid phone number or password.."
                    res.redirect('/userLogin');
                }
            })
        }
    },
    shopProductRight: (req, res) => {
        let productId = req.params.id;
        console.log(productId);
        userHelpers.viewCurrentProduct(productId).then((product) => {
            res.render('users/shop-product-right', { user: req.session.user, product });
        })
    },
    userLogout: (req, res) => {
        req.session.user = null;
        res.redirect('/');
    }

}