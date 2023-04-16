import { v4 as uuidv4 } from "uuid"
import { cartHelpers } from "../../helpers/userHelpers/cartHelpers.js"
import { guestHelper } from "../../helpers/userHelpers/guestHelper.js"
import { couponHelpers } from "../../helpers/userHelpers/couponHelperes.js"
export const cartControlers = {
  userCartGet: async (req, res) => {
    try {
      const user = req.session.user?._id
      const guestUser = req.session.guestUser?.id
      if (user) {
        const cartItems = await cartHelpers.getcartProducts(
          req.session.user._id
        )
        const coupons = await couponHelpers.getUserCoupons(user)
        const saved = 0
        const cartId = cartItems?._id
        res.render("users/shop-cart", {
          cartItems,
          coupons, 
          user: req.session.user,
          cartId, 
          saved, 
        })  
      } else if (guestUser) {
        const cartItems = await guestHelper.getGuestUserCartProducts(guestUser)
        res.render("users/shop-cart", { cartItems, guestUser })
      }else {
        res.render("users/shop-cart")
      }
    } catch (error) {
      res.render("users/shop-cart", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  addToCartGet: async (req, res) => {
    try {
      const guestUser = {}
      if (!req.session?.guestUser) {  
        guestUser.id = uuidv4()
        req.session.guestUser = guestUser
      }      
      const {productId , from } = req.query
      const userId = req.session.user?._id
      const guestUserId = req.session?.guestUser?.id
      userId && (await cartHelpers.addToCart(productId, userId,from))
      guestUserId && 
        (await guestHelper.createGuestUser(guestUserId, productId))
      res.json({ status: true,from })
    } catch (error) { 
      res.status(500).json({ Message: "Internal server error" })
    }
  },
  changeCartProductQuantity: async (req, res) => {
    try {
      const { userId } = req.body
      if(req.session.user){
        const response = await cartHelpers.changeCartQuantity(req.body)
        response.total = await cartHelpers.findTotalAmout(userId)
        res.json(response)   
      } else {
        const guestUser = req.session.guestUser?.id
        const response = await cartHelpers.changeCartQuantityForGuest(guestUser,req.body)
        response.total = await cartHelpers.findTotalAmountForGuest(guestUser)
        res.json(response)

      }
    } catch (error) {   
      res.status(500).json("Internal Server Error")
    }
  },
  removeProducts: async (req, res) => {
    try {
      if(req.session.user) {
        const response = await cartHelpers.removeCartProducts(req.body)
        res.json(response)
      } else {
        const guestUser = req.session.guestUser?.id
        const response = await cartHelpers.removeCartProductsGuest(guestUser,req.body)
        res.json(response)
      }
    } catch (error) {
      res.status(500).json("Internal Server Error")
    }
  },
}
