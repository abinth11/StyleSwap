import { v4 as uuidv4 } from "uuid"
import userHelpers from "../../helpers/user-helpers.js"
export const cartControlers = {
    userCartGet: async (req, res) => {
        try {
          const user = req.session.user?._id
          const guestUser = req.session.guestUser?.id
          // console.log(user, guestUser)
          if (user) {
            const cartItems = await userHelpers.getcartProducts(
              req.session.user._id
            )
            console.log(cartItems)
            const totalAmout = await userHelpers.findTotalAmout(
              req.session.user._id
            )
            let saved = 0
            if (totalAmout) {
              saved = totalAmout.total - totalAmout.offerTotal
            }
            const cartId = cartItems?._id
            res.render("users/shop-cart", {
              cartItems,
              user: req.session.user,
              totalAmout,
              cartId,
              saved,
            })
          } else if (guestUser) {
            // console.log(guestUser)
            console.log("guest user cart")
            const cartItems = await userHelpers.getGuestUserCartProducts(
              req.session.guestUser.id
            )
            console.log(cartItems)
            res.render("users/shop-cart", { cartItems, guestUser })
          }
        } catch (error) {
          console.error(error)
          res.status(500).send("Internal Server Error")
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
          userId && (await userHelpers.addToCart(productId, userId, guestUserId))
          guestUserId &&
            (await userHelpers.createGuestUser(guestUserId, productId))
          res.json({ status: true })
        } catch (error) {
          console.error(error)
          res.status(500).json({ Message: "Internal server error" })
        }
      },
      changeCartProductQuantity: async (req, res) => {
        try {
          const { userId } = req.body
          const response = await userHelpers.changeCartQuantity(req.body)
          console.log(response)
          response.total = await userHelpers.findTotalAmout(userId)
          const subtotal = await userHelpers.findSubTotal(userId)
          response.subtotal = subtotal
          res.json(response)
        } catch (error) {
          console.error(error)
          res.status(500).send("Internal Server Error")
        }
      },
      removeProducts: async (req, res) => {
        try {
          const response = await userHelpers.removeCartProducts(req.body)
          res.json(response)
        } catch (error) {
          console.error(error)
          res.status(500).send("Internal Server Error")
        }
      },

}