const userHelpers = require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers')
const twilio = require('../middlewares/twilio')
const { validationResult } = require('express-validator')
let err
module.exports = {
  userHome: async (req, res) => {
    try {
      let cartCount
      if (req.session.user) {
        cartCount = await userHelpers.getCartProductsCount(req.session.user._id)
      }
      const products = await userHelpers.viewProduct()
      res.render('index', { user: req.session.user, products, cartCount })
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  userSignUpGet: (req, res) => {
    try {
      if (req.session.user) {
        res.redirect('/')
      } else {
        res.render('users/signup', { signUpErr: req.session.signUpErr, errors: req.session.err })
        req.session.signUpErr = null
        req.session.err = null
      }
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  usersignUpPost: async (req, res) => {
    try {
      const errors = validationResult(req)
      req.session.err = errors.errors
      const { email, mobile } = req.body
      if (req.session.err.length === 0) {
        const response = await userHelpers.regisUserUser(req.body)
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
      res.status(500).send('Internal Server Error')
    }
  },
  userLoginGet: (req, res) => {
    try {
      if (req.session.user) {
        res.redirect('/')
      } else {
        res.render('users/login', { loginErr: req.session.loginError })
        req.session.loginError = null
      }
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  otpValidateGet: (req, res) => {
    try {
      if (req.session.vid) {
        res.render('users/otp-enter', { otpError: req.session.otpErr, mobile: req.session.mobile })
        req.session.otpErr = null
      } else {
        res.redirect('/')
      }
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  otpValidatePost: async (req, res) => {
    try {
      const { mobile, body: { otp } } = req.session
      const { valid } = await twilio.verifyOtp(mobile, otp)
      if (valid) {
        res.redirect('/')
      } else {
        const otpErr = 'Invalid otp..'
        res.redirect('/otpValidate', { otpError: otpErr, mobile })
      }
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  loginWithOtpGet: (req, res) => {
    try {
      res.render('users/otp-login')
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  loginWithOtpPost: async (req, res) => {
    try {
      const { mobile } = req.body
      req.session.mobile = mobile
      const response = await userHelpers.loginWthOTP(req.body)
      if (response.status) {
        const verify = await twilio.generateOpt(mobile)
        req.session.vid = verify
        req.session.user = response.user
        res.redirect('/otpValidate')
      } else if (response.block) {
        req.session.loginError = 'Your account is blocked by admin'
        res.redirect('/userLogin')
      } else {
        req.session.loginError = 'Invalid phone number or password..'
        res.redirect('/userLogin')
      }
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  dashboard: (req, res) => {
    try {
      res.render('users/dashboard', { user: req.session.user })
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  userLoginPost: async (req, res) => {
    try {
      const errors = validationResult(req)
      const err = errors.errors
      req.session.mobile = req.body.mobile
      if (err.length === 0) {
        const response = await userHelpers.loginUser(req.body)
        if (response.block) {
          req.session.loginError = 'Your account is blocked by admin'
          res.json({ status: false })
        } else if (response.status) {
          req.session.user = response.user
          res.json({ status: true })
        } else {
          req.session.loginError = 'Invalid phone number or password'
          res.json({ status: false })
        }
      }
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  shopProductRight: async (req, res) => {
    try {
      const { id } = req.params
      const product = await userHelpers.viewCurrentProduct(id)
      res.render('users/shop-product-right', { user: req.session.user, product })
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  userCartGet: async (req, res) => {
    try {
      const cartItems = await userHelpers.getcartProducts(req.session.user._id)
      const totalAmout = await userHelpers.findTotalAmout(req.session.user._id)
      const cartId = cartItems?._id
      res.render('users/shop-cart', { cartItems, user: req.session.user, totalAmout, cartId })
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  addToCartGet: async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.session?.user._id
      await userHelpers.addToCart(id, userId)
      res.json({ status: true })
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  changeCartProductQuantity: async (req, res) => {
    try {
      const { userId } = req.body
      const response = await userHelpers.changeCartQuantity(req.body)
      response.total = await userHelpers.findTotalAmout(userId)
      const subtotal = await userHelpers.findSubTotal(userId)
      response.subtotal = subtotal
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  removeProducts: async (req, res) => {
    try {
      const response = await userHelpers.removeCartProducts(req.body)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  proceedToCheckOutGet: async (req, res) => {
    try {
      const cartItems = await userHelpers.getcartProducts(req.session?.user._id)
      const address = await userHelpers.getAllAddresses(req.session.user._id)
      res.render('users/shop-checkout', { user: req.session.user, cartItems, address })
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  proceedToCheckOutPost: async (req, res) => {
    try {
      const { userId } = req.body
      const products = await userHelpers.getAllProductsUserCart(userId)
      let totalPrice = {}
      if (products[0]?.products.length) {
        totalPrice = await userHelpers.findTotalAmout(userId)
      }
      const response = await userHelpers.placeOrders(req.body, products, totalPrice)
      const insertedOrderId = response.insertedId
      const total = totalPrice?.offerTotal
      const { payment_method: paymentMethod } = req.body
      if (paymentMethod === 'cod') {
        res.json({ statusCod: true })
      } else if (paymentMethod === 'razorpay') {
        const razorpayResponse = await userHelpers.getRazorpay(insertedOrderId, total)
        res.json(razorpayResponse)
      } else if (paymentMethod === 'paypal') {
        const paypalResponse = await userHelpers.getPaypal(insertedOrderId, total)
        console.log(paypalResponse)
        res.json(paypalResponse)
      } else if (paymentMethod === 'wallet') {
        const walletDetails = await userHelpers.getWalletData(req.session.user?._id)
        walletDetails.wallet = true
        req.session.orderId = insertedOrderId
        res.json(walletDetails)
      } else {
        res.json({ status: false })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  orderPlacedLanding: (req, res) => {
    try {
      res.render('users/order-placed-landing')
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  verifyRazorpayPayment: async (req, res) => {
    try {
      userHelpers.verifyRazorpayPayments(req.body).then(() => {
        userHelpers.changePaymentStatus(req.body['payment[receipt]']).then(() => {
          console.log('Payment is success')
          res.json({ status: true })
        })
      }).catch((err) => {
        console.log(err)
        res.json({ status: false, errorMsg: err })
      })
      res.json({ status: true })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  getUserOrders: async (req, res) => {
    try {
      const odr = await userHelpers.getCurrentUserOrders(req.session.user._id)
      const orders = adminHelpers.ISO_to_Normal_Date(odr)
      res.render('users/shop-orders', { orders })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  cancellOrders: async (req, res) => {
    try {
      const { orderId, reason } = req.body
      userHelpers.cancellUserOrder(orderId, reason).then(() => {
        res.redirect('/view-orders')
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  editUserProfile: async (req, res) => {
    try {
      const id = req.session?.user._id
      const userDetails = await userHelpers.getLoginedUser(id)
      const address = await userHelpers.getUserAddress(id)
      res.render('users/edit-profile', { userDetails, user: req.session.user, address })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  editUserProfilePost: (req, res) => {
    try {
      const { userId } = req.params
      userHelpers.editProfile(userId, req.body).then(() => {
        res.redirect('/')
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  addAddressPost: (req, res) => {
    try {
      const userId = req.session.user?._id
      const { addressFromCheckOut } = req.body
      req.body.userId = userId
      userHelpers.addNewAddress(req.body).then(() => {
        const jsonResponse = addressFromCheckOut
          ? { addressFromCheckOut: true }
          : { addressFromProfile: true }
        res.json(jsonResponse)
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: true, message: 'Error occurred while adding address' })
    }
  },
  editAddressGet: async (req, res) => {
    try {
      const { from } = req.query
      const currentAddress = await userHelpers.getCurrentAddress(req.query.id)
      res.render('users/user-profile/edit-address', { currentAddress, from })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  editAddressPost: (req, res) => {
    try {
      const { from } = req.query
      userHelpers.editAddress(req.query.addressId, req.body).then(() => {
        req.session.updatedAddr = 'Successfully updated address'
        from === 'profile' ? res.redirect('/profile-address') : res.redirect('/proceed-to-checkout')
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  deleteAddress: (req, res) => {
    const { addressId, from } = req.body
    try {
      userHelpers.addressDelete(addressId).then(() => {
        from === 'profile' ? res.redirect('/profile-address') : res.redirect('/proceed-to-checkout')
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  userProfileDash: (req, res) => {
    try {
      res.render('users/user-profile/user-dashboard', { user: req.session.user })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  userProfileOrders: async (req, res) => {
    try {
      const odr = await userHelpers.getOrdersProfile(req.session.user._id)
      const orders = adminHelpers.ISO_to_Normal_Date(odr)
      res.render('users/user-profile/user-orders', { orders })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  userProfileTrackOrders: (req, res) => {
    try {
      res.render('users/user-profile/user-track-orders')
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  userProfileAddress: async (req, res) => {
    try {
      const address = await userHelpers.getUserAddress(req.session.user._id)
      const updateMsg = req.session.updatedAddr
      res.render('users/user-profile/user-address', { address, updateMsg })
      req.session.updatedAddr = null
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  userAccountDetails: async (req, res) => {
    try {
      const userDetails = await userHelpers.getUserDetails(req.session.user._id)
      // let profile_update_status= req.session.profile_update_status
      res.render('users/user-profile/user-account', { userDetails })
      // req.session.profile_update_status=null;
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  updateProfile: (req, res) => {
    try {
      // let sessionUserId=req.session.user._id;
      userHelpers.updateUserDetails(req.body).then(() => {
        res.redirect('/profile-account-detail')
      })
    // req.session.profile_update_status=response;
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  changePassword: (req, res) => {
    try {
      const passwordChangeStat = req.session.password_change_stat
      const updatePasswdErr = req.session.updatePasswd_err
      const user = req.session.user._id
      res.render('users/user-profile/user-change-password', { user, passwordChangeStat, updatePasswdErr })
      req.session.password_change_stat = null
      req.session.updatePasswd_err = null
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  changePasswordPost: async (req, res) => {
    try {
      const errors = validationResult(req)
      req.session.updatePasswd_err = errors.errors
      if (req.session.updatePasswd_err.length === 0) {
        const response = await userHelpers.changeUserPassword(req.params.id, req.body)
        req.session.password_change_stat = response
        res.redirect('/profile-change-password')
      } else {
        res.redirect('/profile-change-password')
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  trackOrders: async (req, res) => {
    try {
      const order = await userHelpers.getOrderStatus(req.params.id)
      const statusDates = await userHelpers.getStatusDates(req.params.id)
      res.render('users/track-order', { order, statusDates })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  viewMoreProducts: async (req, res) => {
    try {
      const orderedProductsWithSameId = await userHelpers.getProductsWithSameId(req.params.id)
      res.render('users/view-more-orders', { orderedProductsWithSameId })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  returnProducts: (req, res) => {
    try {
      userHelpers.returnProduct(req.body)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  getWallet: async (req, res) => {
    try {
      const walletData = await userHelpers.getWalletData(req.session.user._id)
      res.render('users/wallet', { walletData })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  walletPayment: async (req, res) => {
    try {
      const insertedOrderId = req.session.orderId
      const userId = req.session.user._id
      const products = await userHelpers.getAllProductsUserCart(userId)
      let totalPrice = {}
      if (products[0]?.products.length) {
        totalPrice = await userHelpers.findTotalAmout(userId)
      }
      const total = totalPrice?.offerTotal
      const response = await userHelpers.getUserWallet(insertedOrderId, total, userId)
      res.json(response)
    } catch (error) {
      console.log(error)
      res.status(500).json({ status: false, errorMsg: 'Something went wrong' })
    }
  },
  userLogout: (req, res) => {
    try {
      req.session.user = null
      res.redirect('/')
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}
