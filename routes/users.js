var express = require('express');
var router = express.Router();
let userControler = require('../controlers/user-controlers');
const userValidation = require('../validation/userValidation');
let sessionChecker = require('../middlewares/session-checks');
const userHelpers = require('../helpers/user-helpers');

/* GET home page. */
router.get('/', userControler.userHome);

//view more for each product in home page
router.get('/shop-product-right/:id', userControler.shopProductRight);

//User registration(singnUp)
router.route('/userSignUp')
    .get(userControler.userSignUpGet)
    .post(userValidation.userSignUpValidate, userControler.usersignUpPost)

//User login 
router.route('/userLogin')
    .get(userControler.userLoginGet)
    .post(userValidation.userLoginValidate, userControler.userLoginPost);

// //login with otp withoug passwords
router.route('/loginWithOtp')
    .get(userControler.loginWithOtpGet)
    .post(userControler.loginWithOtpPost)

//otp validation
router.route('/otpValidate')
    .get(sessionChecker.isUserExist, userControler.otpValidateGet)
    .post(userControler.otpValidatePost)

//Cart for user
router.get('/userCart', sessionChecker.isUserExist, userControler.userCartGet)

//add to the cart
router.get('/add-to-cart/:id', sessionChecker.isUserExist, userControler.addToCartGet)

//change product quantity in the cart
router.post('/change-quantity', userControler.changeCartProductQuantity)

//remove products from the cart
router.put('/remove-cart-product', userControler.removeProducts)

//proceed to chekout
router.route('/proceed-to-checkout')
    .get(sessionChecker.isUserExist, userControler.proceedToCheckOutGet)
    .post(userControler.proceedToCheckOutPost)

//my orders
router.get('/view-orders',sessionChecker.isUserExist,userControler.getUserOrders)

//cancell orders
router.post('/cancell-order',userControler.cancellOrders)

//Edit profile 
router.get('/editProfile',sessionChecker.isUserExist, userControler.editUserProfile)
router.post('/editProfile/:id', userControler.editUserProfilePost)

//user profile part
router.get('/profile-dashboard',sessionChecker.isUserExist,userControler.userProfileDash)
router.get('/profile-orders',sessionChecker.isUserExist,userControler.userProfileOrders)
router.get('/profile-track-orders',sessionChecker.isUserExist,userControler.userProfileTrackOrders)
router.get('/profile-address',sessionChecker.isUserExist,userControler.userProfileAddress)
router.get('/profile-account-detail',sessionChecker.isUserExist,userControler.userAccountDetails)
router.post('/update-user-profile',userControler.updateProfile)
router.get('/profile-change-password',sessionChecker.isUserExist,userControler.changePassword)
//change password
router.post('/change-user-password/:id',userValidation.userPasswordUpdateValidation,userControler.changePasswordPost);

//Address management
router.route('/addressManageMent')
    .get(userControler.addAddressGet)
    .post(userControler.addAddressPost)

//delete address
router.post('/delete-address',userControler.deleteAddress)

//User logout
router.get('/logoutUser', userControler.userLogout);

module.exports = router;
