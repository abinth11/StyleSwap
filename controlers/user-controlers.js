const userHelpers = require("../helpers/user-helpers");
let twilio=require('../middlewares/twilio')
let { check, validationResult } = require('express-validator');
const { response } = require("express");
let err;
module.exports = {
    userHome: (req, res) => {
        userHelpers.viewProduct().then((products)=>{
            // console.log(products);
            res.render('index',{user:true,products});
        })
        
    },
    userSignUpGet: (req, res) => {
        console.log("errosss")
        console.log(err)
        res.render('users/signup',{signUpErr:req.session.signUpErr,errors:req.session.err});
        req.session.signUpErr=null;
        req.session.err=null;


    },
    usersignUpPost: (req, res) => {
        const errors = validationResult(req);
        req.session.err = errors.errors
        let {email,mobile}=req.body
        console.log(req.session.err);
        if (req.session.err.length == 0) {
            userHelpers.regisUserUser(req.body).then((response) => {
                console.log(response)
                // response == req.body.email ? console.log("User already exists") : console.log("Regitstration completed");
                if(response.email==email)
                {
                    req.session.signUpErr= `${response.email} already exists please login`
                    res.redirect('/userSignUp')
                    console.log("User already exists please login");
                }
                else if(response.mobile==mobile)
                {
                    req.session.signUpErr= `${response.mobile} already exists please login`
                    res.redirect('/userSignUp')
                    console.log("User already exists please login");

                }
                else if(response.status)
                {
                    req.session.loggedIn=true;
                    req.session.user=response.userData;
                    res.redirect('/');
                    console.log("Registration completed successfully...")
                   
                }
                
                // console.log(response);
            })

        }
        else{
            res.redirect('/userSignUp');
        }
    },
    userLoginGet: (req, res) => {
        res.render('users/login',{loginErr:req.session.loginError});
        req.session.loginError=null;
    },
    otpValidateGet:(req,res)=>{
        res.render('users/otp-enter',{otpError:req.session.otpErr})
        req.session.otpErr=null;

    },
    otpValidatePost:(req,res)=>{
        // console.log("otp validate post")
        // console.log(req,session.mobile,req.body.otp)
        // console.log(req.session.mobile)
        // console.log(req.session)
        twilio.verifyOtp(req.session.mobile,req.body.otp).then((response)=>{
            console.log(response)
            if(response.valid){
                res.redirect('/');
            }
            else{
                req.session.otpErr="Invalid otp.."
                res.redirect('/otpValidate')
            }
            
        })


    },
    dashboard:(req,res)=>{
        res.render('users/dashboard',{user:req.session.user})
    },
    userLoginPost: (req, res) => {
        const errors = validationResult(req);
        console.log(errors);
         err = errors.errors
        req.session.mobile=req.body.mobile;
        if (err.length == 0) {
            userHelpers.loginUser(req.body).then((response)=>{
             if(response.status)
             {
                twilio.generateOpt(req.session.mobile).then(()=>{
                    req.session.user=response.user;
                    res.redirect('/otpValidate')
                })
             }
             else if(response.block)
             {
                req.session.loginError="Your accout is blocked by admin ";
                res.redirect('/userLogin');
             }
             else{
                req.session.loginError="Invalid phone number or password.."
                res.redirect('/userLogin');
             }
            })
        }
    },
    shopProductRight:(req,res)=>{
        let productId=req.params.id;
        console.log(productId);
        userHelpers.viewCurrentProduct(productId).then((product)=>{
            // console.log(product);
            res.render('users/shop-product-right',{user:req.session.user,product});
        })
       

    },
    upload:(req,res)=>{
        console.log(req.files);

    },
}