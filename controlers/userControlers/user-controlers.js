import { cartHelpers } from "../../helpers/userHelpers/cartHelpers.js"
import { userProductHelpers } from "../../helpers/userHelpers/userProductHelpers.js"
import { couponHelpers } from "../../helpers/userHelpers/couponHelperes.js"
export const userControler = {
  userHome: async (req, res) => {
    try {
      let cartCount
      // userHelpers.resetCouponCount()
      if (req.session.user) {
        cartCount = await cartHelpers.getCartProductsCount(
          req.session.user._id
        )
      }
      const products = await userProductHelpers.viewProduct()
      res.render("index", { user: req.session.user, products, cartCount })
      req.session.guestUser = null
    } catch (error) {
      res.render("index", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  dashboard: (req, res) => {
    try {
      res.render("users/dashboard", { user: req.session.user })
    } catch (error) {
      res.render("users/dashboard", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  viewCoupons: async (req, res) => {
    try {
      const coupons = await couponHelpers.getUserCoupons(req.session.user._id)
      const myCoupons = coupons.reverse()
      res.render("users/view-coupons-user", { myCoupons })
    } catch (error) {
      res.render("users/view-coupons-user", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  applyCouponCode: async (req, res) => {
    try {
      const { couponCode, amount } = req.body
      const response = await couponHelpers.redeemCoupon(couponCode, amount)
      req.session.couponAppliedDetails = response
      res.json(response)
    } catch (error) {
      res.render("users/shop-cart", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  userLogout: (req, res) => {
    try {
      req.session.user = null
      res.redirect("/")
    } catch (error) {
      res.render("index", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
}
