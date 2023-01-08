var express = require('express');
var router = express.Router();
let userHelpers = require('../helpers/user-helpers');
let userControler=require('../controlers/user-controlers');
const userValidation = require('../validation/userValidation');
const { request } = require('express');
let twilio=require('../middlewares/twilio')


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
.post(userValidation.userLoginValidate,userControler.userLoginPost)

router.route('/otpValidate')
.get(userControler.otpValidateGet)
.post(userControler.otpValidatePost)

router.get('/dashboard',userControler.dashboard)
router.post('/upload',userControler.upload)

module.exports = router;
