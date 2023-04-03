import userHelpers from "../../helpers/user-helpers.js"
export const userControler = {
  userHome: async (req, res) => {
    try {
      let cartCount
      // userHelpers.resetCouponCount()
      if (req.session.user) {
        cartCount = await userHelpers.getCartProductsCount(
          req.session.user._id
        )
      }
      console.log(req.session)
      const products = await userHelpers.viewProduct()
      res.render("index", { user: req.session.user, products, cartCount })
      req.session.guestUser = null
    } catch (error) {
      console.error(error)
      res.render("index", { warningMessage: "Internal Server Error Please try again later..."})
    }
  },
  dashboard: (req, res) => {
    try {
      res.render("users/dashboard", { user: req.session.user })
    } catch (error) {
      console.error(error)
      res.status(500).send("Internal Server Error")
    }
  },
  viewCoupons: async (req, res) => {
    try {
      const coupons = await userHelpers.getUserCoupons(req.session.user._id)
      const myCoupons = coupons.reverse()
      res.render("users/view-coupons-user", { myCoupons })
    } catch (error) {
      console.log(error)
    }
  },
  applyCouponCode: async (req, res) => {
    try {
      const { couponCode, amount } = req.body
      const response = await userHelpers.redeemCoupon(couponCode, amount)
      req.session.couponAppliedDetails = response
      res.json(response)
    } catch (error) {
      console.log(error)
    }
  },
 
  userLogout: (req, res) => {
    try {
      req.session.user = null
      res.redirect("/")
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Internal server error" })
    }
  },
}