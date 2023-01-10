var express = require('express');
var router = express.Router();
let userControler=require('../controlers/user-controlers');
const userValidation = require('../validation/userValidation');
let sessionChecker = require('../middlewares/session-checks');
const userHelpers = require('../helpers/user-helpers');

/* GET home page. */
router.get('/',userControler.userHome);

//view more for each product in home page
router.get('/shop-product-right/:id',userControler.shopProductRight);

//User registration(singnUp)
router.route('/userSignUp')
.get(userControler.userSignUpGet)
.post(userValidation.userSignUpValidate,userControler.usersignUpPost)

//User login 
router.route('/userLogin')
.get(userControler.userLoginGet)
.post(userValidation.userLoginValidate,userControler.userLoginPost);

// //login with otp withoug passwords
router.route('/loginWithOtp')
.get(userControler.loginWithOtpGet)
.post(userControler.loginWithOtpPost)

//otp validation
router.route('/otpValidate')
.get(sessionChecker.isUserExist,userControler.otpValidateGet)
.post(userControler.otpValidatePost)

//User logout
router.get('/logoutUser',userControler.userLogout);

module.exports = router;
