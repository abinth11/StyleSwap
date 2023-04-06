import { orderHelpers } from "../../helpers/userHelpers/orderHelpers.js"
export const orderControler = {
  getUserOrders: async (req, res) => {
    try {
      let orderGroup = await orderHelpers.getOrderedGroup(req.session.user._id)
      orderGroup = orderGroup.reverse()
      res.render("users/shop-orders", { orderGroup })
    } catch (error) {
      console.log(error)
      res.render("users/shop-orders", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  viewOrderBundle: async (req, res) => {
    try {
      const orderId = req.params.id
      const orderDetails = await orderHelpers.getCurrentUserOrders(orderId)
      console.log(orderDetails)
      console.log(orderDetails.products)
      res.render("users/order-bundle", { orderDetails })
    } catch (error) {
      console.log(error)
      res.render("users/order-bundle", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  cancellOrders: async (req, res) => {
    try {
      const { orderId, reason } = req.body
      console.log(req.body)
      orderHelpers.cancellUserOrder(orderId, reason).then(() => {
        res.redirect("/view-orders")
      })
    } catch (error) {
      console.log(error)
      res.render("users/shop-orders", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  trackOrders: async (req, res) => {
    try {
      const order = await orderHelpers.getOrderStatus(req.params.id)
      const statusDates = await orderHelpers.getStatusDates(req.params.id)
      console.log(order)
      res.render("users/track-order", { order, statusDates })
    } catch (error) {
      console.log(error)
      res.render("users/track-order", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
}
