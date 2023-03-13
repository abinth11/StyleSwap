const express = require('express')
const router = express.Router()
const userControler = require('../controlers/user-controlers')
const userValidation = require('../validation/userValidation')
const sessionChecker = require('../middlewares/session-checks')

/* GET home page. */
router.get('/', userControler.userHome)

// view more for each product in home page
router.get('/shop-product-right/:id', userControler.shopProductRight)

// User registration(singnUp)
router.route('/userSignUp')
  .get(userControler.userSignUpGet)
  .post(userValidation.userSignUpValidate, userControler.usersignUpPost)

// User login
router.route('/userLogin')
  .get(userControler.userLoginGet)
  .post(userValidation.userLoginValidate, userControler.userLoginPost)

// //login with otp withoug passwords
router.route('/loginWithOtp')
  .get(userControler.loginWithOtpGet)
  .post(userControler.loginWithOtpPost)

// otp validation
router.route('/otpValidate')
  .get(sessionChecker.isUserExist, userControler.otpValidateGet)
  .post(userControler.otpValidatePost)

// Cart for user
router.get('/userCart', sessionChecker.isUserExist, userControler.userCartGet)

// add to the cart
router.get('/add-to-cart/:id', sessionChecker.isUserExist, userControler.addToCartGet)

// change product quantity in the cart
router.post('/change-quantity', userControler.changeCartProductQuantity)

// remove products from the cart
router.put('/remove-cart-product', userControler.removeProducts)

// proceed to chekout
router.route('/proceed-to-checkout')
  .get(sessionChecker.isUserExist, userControler.proceedToCheckOutGet)
  .post(userControler.proceedToCheckOutPost)

// order placed landing page
router.get('/order-placed-landing', sessionChecker.isUserExist, userControler.orderPlacedLanding)
// buy now for each products
router.get('/buyNow', userControler.proceedToCheckOutGet)

// for verifying the payment
router.post('/verify-payment', userControler.verifyRazorpayPayment)

// my orders
router.get('/view-orders', sessionChecker.isUserExist, userControler.getUserOrders)

// cancell orders
router.post('/cancell-order', userControler.cancellOrders)

// Edit profile
router.get('/editProfile', sessionChecker.isUserExist, userControler.editUserProfile)
router.post('/editProfile/:id', userControler.editUserProfilePost)

// user profile part
router.get('/profile-dashboard', sessionChecker.isUserExist, userControler.userProfileDash)
router.get('/profile-orders', sessionChecker.isUserExist, userControler.userProfileOrders)
router.get('/profile-orders-view-more/:id', sessionChecker.isUserExist, userControler.viewMoreProducts)
router.get('/profile-track-orders', sessionChecker.isUserExist, userControler.userProfileTrackOrders)
router.get('/profile-account-detail', sessionChecker.isUserExist, userControler.userAccountDetails)
router.post('/update-user-profile', userControler.updateProfile)
router.get('/profile-change-password', sessionChecker.isUserExist, userControler.changePassword)
// change password
router.post('/change-user-password/:id', userValidation.userPasswordUpdateValidation, userControler.changePasswordPost)

// Address management
router.get('/profile-address', sessionChecker.isUserExist, userControler.userProfileAddress)
router.route('/addressManageMent')
  .post(userControler.addAddressPost)
// .get(sessionChecker.isUserExist,userControler.addAddressGet)

// edit address
router.route('/editAddress')
  .get(userControler.editAddressGet)
  .post(userControler.editAddressPost)

// delete address
router.post('/delete-address', userControler.deleteAddress)

// track order
router.get('/track-order/:id', userControler.trackOrders)

// return order
router.post('/return-products', userControler.returnProducts)

// User logout
router.get('/logoutUser', userControler.userLogout)

module.exports = router
