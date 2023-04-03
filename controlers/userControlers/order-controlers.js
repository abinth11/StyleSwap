import userHelpers from "../../helpers/user-helpers.js"

export const orderControler = {
    getUserOrders: async (req, res) => {
        try {
          let orderGroup = await userHelpers.getOrderedGroup(req.session.user._id)
          orderGroup = orderGroup.reverse()
          res.render("users/shop-orders", { orderGroup })
        } catch (error) {
          console.log(error)
          res.render("users/shop-orders", { warningMessage: "Internal Server Error Please try again later..."})
        }
      },
      viewOrderBundle: async (req, res) => {
        try {
          const orderId = req.params.id
          const orderDetails = await userHelpers.getCurrentUserOrders(orderId)
          console.log(orderDetails)
          console.log(orderDetails.products)
          res.render("users/order-bundle", { orderDetails })
        } catch (error) {
          console.log(error)
          res.render("users/order-bundle", { warningMessage: "Internal Server Error Please try again later..."})
        }
      },
      cancellOrders: async (req, res) => {
        try {
          const { orderId, reason } = req.body
          console.log(req.body)
          userHelpers.cancellUserOrder(orderId, reason).then(() => {
            res.redirect("/view-orders")
          })
        } catch (error) {
          console.log(error)
          res.render("users/shop-orders", { warningMessage: "Internal Server Error Please try again later..."})
        }
      },
      trackOrders: async (req, res) => {
        try {
          const order = await userHelpers.getOrderStatus(req.params.id)
          const statusDates = await userHelpers.getStatusDates(req.params.id)
          res.render("users/track-order", { order, statusDates })
        } catch (error) {
          console.log(error)
          res.render("users/track-order", { warningMessage: "Internal Server Error Please try again later..."})
        }
      },
}