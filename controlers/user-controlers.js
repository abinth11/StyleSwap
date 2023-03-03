const userHelpers = require("../helpers/user-helpers");
const adminHelpers = require("../helpers/admin-helpers")
let twilio = require('../middlewares/twilio')
let { validationResult } = require('express-validator');
let err;
module.exports = {
    userHome: async (req, res) => {
        let cartCount, defaultHeader = true;
        if (req.session.user) {
            cartCount = await userHelpers.getCartProductsCount(req.session.user._id)
            console.log(cartCount);
        }
        userHelpers.viewProduct().then((products) => {
            res.render('index', { user: req.session.user, products, cartCount });
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
                    res.json({status:false})
                    // res.redirect('/userSignUp')
                }
                else if (response.mobile == mobile) {
                    req.session.signUpErr = `${response.mobile} already exists please login`
                    res.json({status:false})
                    // res.redirect('/userSignUp')
                }
                else if (response.status) {
                    req.session.loggedIn = true;
                    req.session.user = response.userData;
                    res.json({status:true})
                    // res.redirect('/');
                }
            })
        }
        else {
            // res.redirect('/userSignUp');
            res.json({status:false})
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
        console.log(req.body)
        const errors = validationResult(req);
        console.log(errors);
        err = errors.errors
        req.session.mobile = req.body.mobile;
        if (err.length == 0) {
            userHelpers.loginUser(req.body).then((response) => {
                if (response.block) {
                    req.session.loginError = "Your accout is blocked by admin ";
                    res.json({status:false})
                    // res.redirect('/userLogin');
                }
                else if (response.status) {
                    req.session.user = response.user;
                    res.json({status:true})
                    // res.redirect('/')
                }
                else {
                    req.session.loginError = "Invalid phone number or password.."
                    res.json({status:false})
                    // res.redirect('/userLogin');
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
    userCartGet: async (req, res) => {
        // let cartItems = await userHelpers.getcartProducts(req.session?.user._id)
        let totalAmout = await userHelpers.findTotalAmout(req.session.user._id);
        let cartItems = await userHelpers.getcartProducts(req.session.user._id);
        // console.log(cartItems);
        let cartId=cartItems._id
        res.render('users/shop-cart', { cartItems, user: req.session.user, totalAmout,cartId})
    },
    addToCartGet: (req, res) => {
        let productId = req.params.id
        let userId = req.session?.user._id;
        userHelpers.addToCart(productId, userId).then((response) => {
            res.json({ status: true })
            // res.redirect('/');
        })
    },
    changeCartProductQuantity: (req, res) => {
        userHelpers.changeCartQuantity(req.body).then(async (response) => {
            response.total = await userHelpers.findTotalAmout(req.body.userId);
            let subtotal=await userHelpers.findSubTotal(req.body.userId);
            response.subtotal=subtotal;
            console.log(subtotal);
            res.json(response);
        })
    },
    removeProducts: (req, res) => {
        userHelpers.removeCartProducts(req.body).then((response) => {
            res.json(response)
        })
    },
    proceedToCheckOutGet: async (req, res) => {
        let cartItems = await userHelpers.getcartProducts(req.session?.user._id)
        let totalAmout = await userHelpers.findTotalAmout(req.session.user._id)
        let address = await userHelpers.getAllAddresses(req.session.user._id);
        console.log(address)
        res.render('users/shop-checkout', { totalAmout, user: req.session.user, cartItems, address });
    },
    proceedToCheckOutPost: async (req, res) => {
        console.log(req.body);
        let products = await userHelpers.getAllProductsUserCart(req.body.userId);
        let totalPrice = await userHelpers.findTotalAmout(req.body.userId);
        userHelpers.placeOrders(req.body, products, totalPrice).then((response) => {
            res.json({ status: true })
            // console.log(response)
        })
    },
    getUserOrders: async (req, res) => {
        let odr = await userHelpers.getCurrentUserOrders(req.session.user._id)
        let orders = adminHelpers.ISO_to_Normal_Date(odr)
        // console.log(orders)
        res.render('users/shop-orders', { orders })
    },
    cancellOrders: (req, res) => {
        let orderId = req.body.orderId;
        userHelpers.cancellUserOrder(orderId).then((response) => {
            console.log(response);
            res.redirect('/view-orders')
        })
    },
    editUserProfile: async (req, res) => {
        let id = req.session?.user._id;
        let userDetails = await userHelpers.getLoginedUser(id);
        let address = await userHelpers.getUserAddress(id);
        console.log(address)
        res.render('users/edit-profile', { userDetails, user: req.session.user, address })
    },
    editUserProfilePost: (req, res) => {
        let userId = req.params.id;
        userHelpers.editProfile(userId, req.body).then((response) => {
            res.redirect('/')
        })
    },
    // addAddressGet: (req, res) => {
    //     let userId = req.session?.user._id;
    //     let updateMsg=req.session.updatedAddr
    //     console.log(updateMsg)
    //     userHelpers.getUserAddress(userId).then((address) => {
    //         console.log(address)
    //         res.render('users/add-address', { address,updateMsg });
    //         req.session.updateMsg=null;
    //     })
    // },
    addAddressPost: (req, res) => {
        let userId = req.session.user?._id;
        let addressFromCheckOut = req.body.fromCheckOut;
        req.body.userId = userId;
        console.log(req.body);
        userHelpers.addNewAddress(req.body).then((response) => {
            console.log(response)
            if (addressFromCheckOut) {
                res.json({addressFromCheckOut:true})
                // res.redirect('/proceed-to-checkout')
            } else {
                res.json({addressFromProfile:true})
                // res.redirect('/profile-address')
            }
        })
    },
    editAddressGet:async(req,res)=>{
        // console.log(req.query)
        let from=req.query.from;
        let currentAddress=await userHelpers.getCurrentAddress(req.query.id);
        res.render('users/user-profile/edit-address',{currentAddress,from})
    },
    editAddressPost:(req,res)=>{
        console.log(req.query)
        let from=req.query.from;
        userHelpers.editAddress(req.query.addressId,req.body).then(()=>{
           req.session.updatedAddr="Successfully updated address"
           if(from=='profile'){
            res.redirect('/profile-address')
           }else{
            res.redirect('/proceed-to-checkout')
           }
        })
    },
    deleteAddress: (req, res) => {
        console.log(req.body);
        let addressId = req.body.addressId,from=req.body.from
        userHelpers.addressDelete(addressId).then((response) => {
            console.log(response)
            if(from=='profile'){
                res.redirect('/profile-address')
            }else{
                res.redirect('/proceed-to-checkout')
            }
        })
    },
    userProfileDash: (req, res) => {
        res.render('users/user-profile/user-dashboard', { user: req.session.user })
    },
    userProfileOrders: async (req, res) => {
        let odr = await userHelpers.getCurrentUserOrders(req.session.user._id)
        let orders = adminHelpers.ISO_to_Normal_Date(odr)
        console.log(orders)
        res.render('users/user-profile/user-orders', { orders })
    },
    userProfileTrackOrders: (req, res) => {
        res.render('users/user-profile/user-track-orders')
    },
    userProfileAddress: async (req, res) => {
        let address = await userHelpers.getUserAddress(req.session.user._id);
        let updateMsg=req.session.updatedAddr;
        console.log(updateMsg)
        res.render('users/user-profile/user-address', { address,updateMsg })
        req.session.updatedAddr=null;
    },
    userAccountDetails: async (req, res) => {
        let userDetails = await userHelpers.getUserDetails(req.session.user._id);
        // let profile_update_status= req.session.profile_update_status
        res.render('users/user-profile/user-account', { userDetails })
        // req.session.profile_update_status=null;
    },
    updateProfile: (req, res) => {
        // let sessionUserId=req.session.user._id;
        // console.log(req.body)
        userHelpers.updateUserDetails(req.body).then((response) => {
            console.log(response)
            res.redirect('/profile-account-detail')
        })
        // console.log(response)
        // req.session.profile_update_status=response;  
    },
    changePassword: (req, res) => {
        let password_change_stat = req.session.password_change_stat;
        let updatePasswd_err = req.session.updatePasswd_err;
        let user = req.session.user._id;
        res.render('users/user-profile/user-change-password', { user, password_change_stat, updatePasswd_err })
        req.session.password_change_stat = null;
        req.session.updatePasswd_err = null;
    },
    changePasswordPost: (req, res) => {
        const errors = validationResult(req);
        console.log(errors);
        req.session.updatePasswd_err = errors.errors
        if (req.session.updatePasswd_err.length == 0) {
            userHelpers.changeUserPassword(req.params.id, req.body).then((response) => {
                // console.log(response)
                req.session.password_change_stat = response;
                res.redirect('/profile-change-password');
            })
        } else {
            res.redirect('/profile-change-password')
        }
    },
    userLogout: (req, res) => {
        req.session.user = null;
        res.redirect('/');
    }
}