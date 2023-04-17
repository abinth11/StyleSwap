import express from "express"
const router = express.Router()
import { userControler } from "../controlers/userControlers/user-controlers.js"
import userValidation from "../validation/userValidation.js"
import sessionChecker from "../middlewares/session-checks.js"
import { userLoginAndSignupControler } from "../controlers/userControlers/userLoginAndSignup.js"
import { productControler } from "../controlers/userControlers/product-controlers.js"
import { cartControlers } from "../controlers/userControlers/cartControlers.js"
import { paymentControlers } from "../controlers/userControlers/paymentControlers.js"
import { orderControler } from "../controlers/userControlers/order-controlers.js"
import { profileControlers } from "../controlers/userControlers/profileControlers.js"
import * as googleAuth from "../config/googleauth.js"
import { wishListController } from "../controlers/userControlers/wishlistController.js"
import { trackVisitors } from '../middlewares/trackusers.js'

/* GET home page. */
//todo track visitors MDDLEWARE turned off coz of errors possibilities
router.get("/",trackVisitors, userControler.userHome)

//? ROUTES FOR HANDLING SIGNUP AND LOGIN
router
  .route("/userSignUp")
  .get(userLoginAndSignupControler.userSignUpGet)
  .post(
    userValidation.userSignUpValidate,
    userLoginAndSignupControler.usersignUpPost
  )

// *login with phone number and password
router
  .route("/userLogin")
  .get(userLoginAndSignupControler.userLoginGet)
  .post(
    userValidation.userLoginValidate,
    userLoginAndSignupControler.userLoginPost
  )

//* login with google account
router.get('/userLogin/login-with-google', 
  // Authenticate the user using the Google OAuth2.0 strategy
  googleAuth.passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/userLogin/login-with-google/callback',
googleAuth.passport.authenticate('google',{failureRedirect:'/userLogin'}),
userLoginAndSignupControler.loginWithGoogleRedirect
)

// *login with otp
router
  .route("/loginWithOtp")
  .get(userLoginAndSignupControler.loginWithOtpGet)
  .post(userLoginAndSignupControler.loginWithOtpPost)

// * validating otp
router
  .route("/otpValidate")
  .get(sessionChecker.isUserExist, userLoginAndSignupControler.otpValidateGet)
  .post(userLoginAndSignupControler.otpValidatePost)

//? ROUTES TO HANDLE USER CART AND RELATED INFORMATIONS
// Cart for user
router.get(
  "/userCart",
  // sessionChecker.isUserOrGuestExist,
  cartControlers.userCartGet
)
  
// add to the cart
router.get("/add-to-cart", cartControlers.addToCartGet)

// change product quantity in the cart
router.post("/change-quantity", cartControlers.changeCartProductQuantity)
 
// remove products from the cart
router.put("/remove-cart-product", cartControlers.removeProducts)

//? ROUTES FOR WISHLIST 
router.get('/user-wishlist',sessionChecker.isUserExist,wishListController.userWishlistGet)
router.get('/add-to-wishlist/:productId',wishListController.addToWishList)
router.delete('/user-wishlist/remove-item/:productId',wishListController.removeProducts)

//? ROUTES FOR PAYMENT AND OTHER PAYMENT RELATED FUCNTIONS
// proceed to checkout
router
  .route("/proceed-to-checkout")
  .get(sessionChecker.isUserExist, paymentControlers.proceedToCheckOutGet)
  .post(paymentControlers.proceedToCheckOutPost)

// order placed landing page
router.get(
  "/order-placed-landing",
  sessionChecker.isUserExist,
  paymentControlers.orderPlacedLanding
)

// wallet management
router.get(
  "/open-wallet",
  sessionChecker.isUserExist,
  paymentControlers.getWallet
)
router.get('/open-wallet/activate-wallet',sessionChecker.isUserExist,userControler.activateWallet)
router.post("/wallet-payment", paymentControlers.walletPayment)

// for verifying the payment
router.post("/verify-payment", paymentControlers.verifyRazorpayPayment)

//? ROUTES FOR USER SIDE PRODUCTS
// view more for each product in home page
router.get("/shop-product-right", productControler.shopProductRight)

//changer prouduct colors
router.post(
  "/shop-product-right/change-product",
  productControler.changeProduct
)

// buy now for each products
router.post("/shop-product-right/buyNow", paymentControlers.buyNow)

//? ROUTES FOR ORDERS
router.get(
  "/view-orders",
  sessionChecker.isUserExist,
  orderControler.getUserOrders
)
router.get(
  "/view-order-bundle/:id",
  sessionChecker.isUserExist,
  orderControler.viewOrderBundle
)

// cancell orders
router.post("/cancell-order", orderControler.cancellOrders)

//? ROUTES TO HANDLE USER PROFILE
// Edit profile
router.get(
  "/editProfile",
  sessionChecker.isUserExist,
  profileControlers.editUserProfile
)
router.post("/editProfile/:id", profileControlers.editUserProfilePost)

// user profile part
router.get(
  "/profile-dashboard",
  sessionChecker.isUserExist,
  profileControlers.userProfileDash
)
router.post('/upload-profile-photo',sessionChecker.isUserExist,profileControlers.uploadProfilePhoto)
router.get(
  "/profile-orders",
  sessionChecker.isUserExist,
  profileControlers.userProfileOrders
)
router.get(
  "/profile-orders-view-more/:id",
  sessionChecker.isUserExist,
  productControler.viewMoreProducts
)
router.get(
  "/profile-account-detail",
  sessionChecker.isUserExist,
  profileControlers.userAccountDetails
)
router.post("/update-user-profile", profileControlers.updateProfile)
router.get(
  "/profile-change-password",
  sessionChecker.isUserExist,
  profileControlers.changePassword
)
// change password
router.post(
  "/change-user-password/:id",
  userValidation.userPasswordUpdateValidation,
  profileControlers.changePasswordPost
)

// Address management
router.get(
  "/profile-address",
  sessionChecker.isUserExist,
  profileControlers.userProfileAddress
)
router.route("/addressManageMent").post(profileControlers.addAddressPost)
// .get(sessionChecker.isUserExist,userControler.addAddressGet)

// edit address
router
  .route("/editAddress")
  .get(profileControlers.editAddressGet)
  .post(profileControlers.editAddressPost)

// delete address
router.post("/delete-address", profileControlers.deleteAddress)

// track order
router.get("/track-order/:id", orderControler.trackOrders)

// return order
router.post("/return-products", productControler.returnProducts)

//? ROUTES TO HANDLE PRODUCT SEARCH
//for the serch feature
router.get("/search-products", productControler.serchProductsWithRedis)
// router.get("/index-products", productControler.indexProducts)

//? ROUTES FOR COUPONS
//view coupons
router.get(
  "/view-coupons",
  sessionChecker.isUserExist,
  userControler.viewCoupons
)

// apply coupon
router.post(
  "/apply-coupon-code",
  sessionChecker.isUserExist,
  userControler.applyCouponCode
) 

//? ROUTES FOR CATEGORY WISE FILTERING
//purchase based on category
router.get("/mens-category", productControler.mensCategory)
router.get("/womens-category", productControler.womensCategory)
router.get("/kids-category", productControler.kidsCategory)

//? PRODUCT RATING AND REVIEW
//Routes for Ratings
router.post(
  "/shop-product-right/add-rating-for-products",
  productControler.addRatingForProducts
)

router.post("/shop-product-right/edit-review", productControler.editRating)

router.get(
  "/get-available-size-and-color/:productId",
  productControler.getSizeAndColor
)
// User logout
router.get("/logoutUser", userControler.userLogout)

export default router
