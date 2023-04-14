import { orderHelpers } from "../../helpers/userHelpers/orderHelpers.js"
export const orderControler = {
  getUserOrders: async (req, res) => {
    try {
      let orderGroup = await orderHelpers.getOrderedGroup(req.session.user._id)
      orderGroup = orderGroup.reverse()
      res.render("users/shop-orders", { orderGroup, user:req.session.user})
    } catch (error) {
      res.render("users/shop-orders", {
        warningMessage: "Internal Server Error Please try again later...",
      }) 
    }
  },
  viewOrderBundle: async (req, res) => {
    try {
      const orderId = req.params.id
      const orderDetails = await orderHelpers.getCurrentUserOrders(orderId)
      res.render("users/order-bundle", { orderDetails })
    } catch (error) {
      res.render("users/order-bundle", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  cancellOrders: async (req, res) => {
    try {
      const { orderId, reason } = req.body
      orderHelpers.cancellUserOrder(orderId, reason).then(() => {
        res.redirect("/view-orders")
      })
    } catch (error) {
      res.render("users/shop-orders", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  trackOrders: async (req, res) => {
    try {
      const order = await orderHelpers.getOrderStatus(req.params.id)
      const statusDates = await orderHelpers.getStatusDates(req.params.id)
      res.render("users/track-order", { order, statusDates,user:req.session.user })
    } catch (error) {
      res.render("users/track-order", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
}
