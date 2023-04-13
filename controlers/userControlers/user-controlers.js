import { cartHelpers } from "../../helpers/userHelpers/cartHelpers.js"
import { userProductHelpers } from "../../helpers/userHelpers/userProductHelpers.js"
import { couponHelpers } from "../../helpers/userHelpers/couponHelperes.js"
import { wishListHelper } from "../../helpers/userHelpers/wishListHelpers.js"
import { walletHelpers } from "../../helpers/userHelpers/walletHelpers.js"
export const userControler = {
  userHome: async (req, res) => {
    try {
      let cartCount,cartItems,wishListItems,wishCount
      // userHelpers.resetCouponCount()
      if (req.session.user) {
        const userId = req.session.user._id
        cartCount = await cartHelpers.getCartProductsCount(
          userId )
         cartItems = await cartHelpers.getcartProducts(
          userId )
          wishListItems = await wishListHelper.getAllItemsInWishlist(userId)
          wishListItems = JSON.stringify(wishListItems?.products)
          wishCount = await wishListHelper.getWishedCount(userId)
      }  
      console.log(wishCount)
      const products = await userProductHelpers.viewProduct()
      res.render("index", { user: req.session.user, products, cartCount,cartItems,wishListItems,wishCount })
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
      res.render("users/view-coupons-user", { myCoupons, user:req.session.user})
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
  activateWallet: async(req,res) =>{
    try {
      const user = req.session.user
      const response = await walletHelpers.activateWallet(user)
      response.acknowledged
      ?res.status(200).json(response)
      :res.status(403).json(response)
    } catch (error) {
      res.render("user/wallet", {
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
