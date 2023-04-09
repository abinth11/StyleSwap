import otherHelpers from "../../helpers/otherHelpers.js"
import { paymentHelpers } from "../../helpers/userHelpers/paymentHelpers.js"
import { cartHelpers } from "../../helpers/userHelpers/cartHelpers.js"
import { walletHelpers } from "../../helpers/userHelpers/walletHelpers.js"
import { profileHelpers } from "../../helpers/userHelpers/profileHelpers.js"
import { cartControlers } from "./cartControlers.js"
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
      console.error(error)
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
        console.log(paypalResponse)
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
      console.log(error)
      res.status(500).json({ message: "Internal server error" })
    }
  },
  orderPlacedLanding: (req, res) => {
    try {
      res.render("users/order-placed-landing")
      req.session.couponAppliedDetails = null
    } catch (error) {
      console.log(error)
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
        .then((response) => {
          console.log(response)
          paymentHelpers
            .changePaymentStatus(req.body["payment[receipt]"])
            .then(async () => {
              const coupon = await otherHelpers.checkProbabilityForCoupon(
                0.5,
                userId
              )
              console.log("Payment is success")
              res.json({ status: true, coupon })
            })
        })
        .catch((err) => {
          console.log(err)
          res.json({ status: false, errorMsg: err })
        })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Internal server error" })
    }
  },
  getWallet: async (req, res) => {
    try {
      const walletData = await walletHelpers.getWalletData(
        req.session.user._id
      )
      walletData.transactions = walletData.transactions.reverse()
      console.log(walletData)
      res.render("users/wallet", { walletData })
    } catch (error) {
      console.log(error)
      res.render("users/wallet", {
        warningMessage: "Internal Server Error Please try again later...",
      })
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
      const response = await walletHelpers.getUserWallet(
        insertedOrderId,
        parseInt(total),
        userId
      )
      const coupon = await otherHelpers.checkProbabilityForCoupon(0.5, userId)
      response.coupon = coupon
      res.json(response)
    } catch (error) {
      console.log(error)
      res.status(500).json({ status: false, errorMsg: "Something went wrong" })
    }
  },
  buyNow: async (req, res) => {
    try {
      const { productId } = req.body
      const userId = req.session.user?._id
      console.log(req.query)
      if (req.session?.user?._id) {
        const response = cartHelpers.addToCart(productId, userId)
        console.log(response)
        response
          ? res.status(200).json({ status: true, Message: "Success" })
          : res
              .status(500)
              .json({ status: true, Message: "Something went wrong" })
      } else {
        res.status(200).json({ status: false, Message: "User is not logined" })
      }
    } catch (error) {
      console.log(error)
      res
        .status(500)
        .jsoN({
          error: true,
          errorMsg: "Something went wrong please try again later",
        })
    }
  },
}
