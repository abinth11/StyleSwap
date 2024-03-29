import { cartHelpers } from "../../helpers/userHelpers/cartHelpers.js"
import { userProductHelpers } from "../../helpers/userHelpers/userProductHelpers.js"
import { couponHelpers } from "../../helpers/userHelpers/couponHelperes.js"
import { wishListHelper } from "../../helpers/userHelpers/wishListHelpers.js"
import { walletHelpers } from "../../helpers/userHelpers/walletHelpers.js"
import { profileHelpers } from "../../helpers/userHelpers/profileHelpers.js"
import HttpStatusCodes from "../../contants/httpStatusCodes.js"
export const userControler = {
  userHome: async (req, res) => {
    try {
      let cartCount,cartItems,wishListItems,wishCount,userDetails
      const user = req.session?.user
      if (user) {
        const userId = req.session.user._id
        cartCount = await cartHelpers.getCartProductsCount(
          userId ) 
          userDetails = await profileHelpers.getLoginedUser(userId)
          cartItems = await cartHelpers.getcartProducts(
          userId )
          wishListItems = await wishListHelper.getAllItemsInWishlist(userId)
          wishListItems = JSON.stringify(wishListItems?.products)
          wishCount = await wishListHelper.getWishedCount(userId)
          req.session.guestUser = null
      }else {
        const {guestUser} = req.session
        cartCount = await cartHelpers.getCartProductsCountGuest(guestUser?.id) 
      }     
      const products = await userProductHelpers.viewProduct()
      res.render("index", { user: req.session.user, products, cartCount,cartItems,wishListItems,wishCount,userDetails })
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
      ?res.status(HttpStatusCodes.OK).json(response)
      :res.status(HttpStatusCodes.BAD_REQUEST).json(response)
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
