import otherHelpers from "../../helpers/otherHelpers.js"
import { paymentHelpers } from "../../helpers/userHelpers/paymentHelpers.js"
import { cartHelpers } from "../../helpers/userHelpers/cartHelpers.js"
import { walletHelpers } from "../../helpers/userHelpers/walletHelpers.js"
import { profileHelpers } from "../../helpers/userHelpers/profileHelpers.js"
import HttpStatusCodes from "../../contants/httpStatusCodes.js"
export const paymentControlers = {
  proceedToCheckOutGet: async (req, res) => {
    try {
      const cartItems = await cartHelpers.getcartProducts(
        req.session?.user._id
      )
      const couponAppliedTotal =
        req.session.couponAppliedDetails?.priceAfterDiscount
      const address = await profileHelpers.getAllAddresses(
        req.session.user._id
      )
      res.render("users/shop-checkout", {
        user: req.session.user,
        cartItems,
        address,
        couponAppliedTotal,
      })
    } catch (error) {
      res.render("users/shop-checkout", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  proceedToCheckOutPost: async (req, res) => {
    try {
      const { userId } = req.body
      const products = await cartHelpers.getAllProductsUserCart(userId)
      let totalPrice = {}
      if (products[0]?.products.length) {
        totalPrice = await cartHelpers.findTotalAmout(userId)
      }
      let couponObj = null
      if (req.session.couponAppliedDetails) {
        couponObj = req.session.couponAppliedDetails
      }
      const response = await paymentHelpers.placeOrders(
        req.body,
        products,
        totalPrice,
        couponObj
      )
      const insertedOrderId = response.insertedId
      let total = totalPrice?.offerTotal
      if (couponObj?.discountAmount) {
        total = total - couponObj.discountAmount
      }
      const { payment_method: paymentMethod } = req.body
      if (paymentMethod === "cod") {
        const codResponse = {
          statusCod: true,
          coupon: await otherHelpers.checkProbabilityForCoupon(0.6, userId),
        }
        res.json(codResponse)
      } else if (paymentMethod === "razorpay") {
        const razorpayResponse = await paymentHelpers.getRazorpay(
          insertedOrderId,
          total
        )
        res.json(razorpayResponse)
      } else if (paymentMethod === "paypal") {
        const paypalResponse = await paymentHelpers.getPaypal(
          insertedOrderId,
          total
        )
        res.json(paypalResponse)
      } else if (paymentMethod === "wallet") {
        const walletDetails = await walletHelpers.getWalletData(
          req.session.user?._id
        )
        walletDetails.wallet = true
        walletDetails.total = total
        req.session.orderId = insertedOrderId
        res.json(walletDetails)
      } else {
        res.json({ status: false })
      }
    } catch (error) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" })
    }
  },
  orderPlacedLanding: (req, res) => {
    try {
      res.render("users/order-placed-landing",{user:req.session.user})
      req.session.couponAppliedDetails = null
    } catch (error) {
      res.render("users/order-placed-landing", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  verifyRazorpayPayment: async (req, res) => {
    try {
      const userId = req.session.user._id
      paymentHelpers
        .verifyRazorpayPayments(req.body)
        .then(() => {
          paymentHelpers
            .changePaymentStatus(req.body["payment[receipt]"])
            .then(async () => {
              const coupon = await otherHelpers.checkProbabilityForCoupon(
                0.5,
                userId
              )
              res.json({ status: true, coupon })
            })
        })
        .catch((err) => {
          res.json({ status: false, errorMsg: err })
        })
    } catch (error) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" })
    }
  },
  getWallet: async (req, res) => {
    try {
      const walletData = await walletHelpers.getWalletData(
        req.session.user._id 
      )  
      if (walletData) { 
        walletData.transactions = walletData.transactions ? walletData.transactions.reverse() : []
      }
      res.render("users/wallet", { walletData,user:req.session.user })
    } catch (error) { 
      res.render("users/wallet", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  walletPayment: async (req, res) => {
    try {
      const insertedOrderId = req.session.orderId
      const userId = req.session.user._id
      const { total } = req.body
      const response = await walletHelpers.getUserWallet(
        insertedOrderId,
        parseInt(total),
        userId
      )
      const coupon = await otherHelpers.checkProbabilityForCoupon(0.5, userId)
      response.coupon = coupon
      res.json(response)
    } catch (error) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, errorMsg: "Something went wrong" })
    }
  },
  buyNow: async (req, res) => {
    try {
      const { productId } = req.body
      const userId = req.session.user?._id
      if (req.session?.user?._id) {
        const response = cartHelpers.addToCart(productId, userId)
        response
          ? res.status(HttpStatusCodes.OK).json({ status: true, Message: "Success" })
          : res
              .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
              .json({ status: true, Message: "Something went wrong" })
      } else {
        res.status(HttpStatusCodes.OK).json({ status: false, Message: "User is not logined" })
      }
    } catch (error) {
      res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          error: true,
          errorMsg: "Something went wrong please try again later",
        })
    }
  },
}
