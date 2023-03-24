import userHelpers from '../helpers/user-helpers.js'
import twilio from 'twilio'
import { v4 as uuidv4 } from 'uuid'
import { validationResult } from 'express-validator'
import adminHelpers from '../helpers/admin-helpers.js'
export const userControler = {
  userHome: async (req, res) => {
    try {
      let cartCount 
      userHelpers.resetCouponCount()
      if (req.session.user) {
        cartCount = await userHelpers.getCartProductsCount(req.session.user._id)
      }
      // console.log(req.session)
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
      let from
      req.query.from ? from = req.query.from : from = 'home'
      console.log(from)
      if (req.session.user) {
        res.redirect('/')
      } else {
        res.render('users/login', { loginErr: req.session.loginError, from })
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
      const { from } = req.body
      const errors = validationResult(req)
      const successResponse = {
        from,
        status: true
      }
      const err = errors.errors
      req.session.mobile = req.body.mobile
      const guestId = req.session.guestUser?.id
      if (err.length === 0) {
        const response = await userHelpers.loginUser(req.body)
        if (response.block) {
          req.session.loginError = 'Your account is blocked by admin'
          res.json({ status: false })
        } else if (response.status) {
          req.session.user = response.user
          const userId = req.session.user._id
          if (from === 'cart') {
            console.log(userId, guestId)
            await userHelpers.mergeGuestCartIntoUserCart(userId, guestId)
            req.session.guestUser = null
            res.json(successResponse)
          } else {
            res.json(successResponse)
          }
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
      console.log(product)
      res.render('users/shop-product-right', { user: req.session.user, product })
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  userCartGet: async (req, res) => {
    try {
      const user = req.session.user?._id
      const guestUser = req.session.guestUser?.id
      // console.log(user, guestUser)
      if (user) {
        const cartItems = await userHelpers.getcartProducts(req.session.user._id)
        const totalAmout = await userHelpers.findTotalAmout(req.session.user._id)
        let saved = 0
        if(totalAmout){
          saved = totalAmout.total-totalAmout.offerTotal
        }
        const cartId = cartItems?._id
        res.render('users/shop-cart', { cartItems, user: req.session.user, totalAmout, cartId, saved })
      } else if (guestUser) {
        // console.log(guestUser)
        console.log('guest user cart')
        const cartItems = await userHelpers.getGuestUserCartProducts(req.session.guestUser.id)
        console.log(cartItems)
        res.render('users/shop-cart', { cartItems, guestUser })
      }
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  addToCartGet: async (req, res) => {
    try {
      const guestUser = {}
      guestUser.id = uuidv4()
      if (!req.session.guestUser) {
        req.session.guestUser = guestUser
      }
      const { id: productId } = req.params
      const userId = req.session.user?._id
      const guestUserId = req.session.guestUser.id
      userId && await userHelpers.addToCart(productId, userId, guestUserId)
      guestUserId && await userHelpers.createGuestUser(guestUserId, productId)
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
      console.log(cartItems)
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
      let couponCode = null
      if( req.session?.couponCode) {
       couponCode = req.session.couponCode
      }
      const response = await userHelpers.placeOrders(req.body, products, totalPrice, couponCode)
      const insertedOrderId = response.insertedId
      const total = totalPrice?.offerTotal
      const { payment_method: paymentMethod } = req.body
      if (paymentMethod === 'cod') {
        const codResponse = {
          statusCod:true,
          coupon: await userHelpers.createCouponForUsers(userId)
        }
        console.log(codResponse)
        res.json(codResponse)
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
        walletDetails.total = total
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
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  getUserOrders: async (req, res) => {
    try {
      const odr = await userHelpers.getCurrentUserOrders(req.session.user._id)
      const orderGroup = await userHelpers.getOrderedGroup(req.session.user._id)
      console.log(orderGroup)
      const orders = adminHelpers.ISO_to_Normal_Date(odr)
      // console.log(orders)
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
      walletData.transactions = walletData.transactions.reverse()
      console.log(walletData)
      res.render('users/wallet', { walletData })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  walletPayment: async (req, res) => {
    try {
      console.log(req.body)
      const insertedOrderId = req.session.orderId
      const userId = req.session.user._id
      const { total } = req.body
      console.log(total)
      console.log(userId)
      const response = await userHelpers.getUserWallet(insertedOrderId, parseInt(total), userId)
      console.log(response)
      res.json(response)
    } catch (error) {
      console.log(error)
      res.status(500).json({ status: false, errorMsg: 'Something went wrong' })
    }
  },
  viewCoupons:async (req, res) => {
    try {
      const myCoupons = await userHelpers.getUserCoupons(req.session.user._id)
      console.log(req.session.user._id)
      console.log(myCoupons)
      res.render('users/view-coupons-user', { myCoupons })
    } catch (error) {
      console.log(error)
    }
  },
  applyCouponCode: async (req, res) => {
    try { 
      // console.log(req.body)
      const { couponCode, amount } = req.body
      req.session.couponCode = couponCode
      const response = await userHelpers.redeemCoupon(couponCode, amount)
      res.json(response)
      // console.log(response)
    } catch (error) { 
      console.log(error)    
    }
  },
  mensCategory: async (req, res)=>{
    try {
      const products = await userHelpers.getMensProducts()
      console.log(products)
      const numberofProducts = products.length
      res.render('users/shop-men', { products, numberofProducts})
    } catch (error) {
      console.log(error)
      res.status(500).json({message:'internal server error'})
    }
  },
  womensCategory : async (req, res) => {
    try {
      const products = await userHelpers.getWomensProducts()
      console.log(products)
      const numberofProducts = products.length
      res.render('users/shop-womens',{products, numberofProducts})
    } catch (error ) {
      console.log(error)
      res.status(500).json({message:'internal server error'})
    }

  },
  kidsCategory : async (req, res) => {
    try {
      const products = await userHelpers.getKidsProducts()
      const numberofProducts = products.length
      res.render('users/shop-womens',{products, numberofProducts})

    } catch (error ) {
      console.log(error)
      res.status(500).json({message:'internal server error'})
    }

  },
  searchProducts:async (req, res) => {
    try {
      const query = req.query.q // get the search query from the request query string
      console.log(query)
      const results = userHelpers.searchWithAlgolia(query)
      // const results = await index.search({ query }); // perform the search on the Algolia index
      res.json(results.hits) // return the search results as JSON
    } catch (error) { 
      console.error(error)
      res.status(500).send('Error searching for data')
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
