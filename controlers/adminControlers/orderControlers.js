import { orderHelpers } from "../../helpers/adminHelpers/orderHelpers.js"
export const orderControlers = {
    viewAllOrders: async (req, res) => {
        const response = await orderHelpers.getAllUserOrdersCount()
        res.render("admin/page-orders-1", { count: response.count })
      },
      viewOrderDetails: async (req, res) => {
        const orderDetails = await orderHelpers.getCurrentProducts(req.params.id)
        res.render("admin/view-more-orders", { orderDetails })
      },
      changeProductStatus: (req, res) => {
        orderHelpers.changeOrderStatus(req.body).then(() => {
          res.redirect("/admin/admin-view-orders")
        })
      },
      orderReturn: async (req, res) => {
        const returnOrders = await orderHelpers.getReturnedOrders()
        res.render("admin/order-return", { returnOrders })
      },
      changeReturnStatus: (req, res) => {
        orderHelpers.changeReturnStatus(req.body).then((response) => {
          res.json(response)
        })
      },
      setPickUpDate: (req) => {
        orderHelpers.setPickUpDate(req.body)
      },
      refundAmount: async (req, res) => {
        try {
          const { orderId } = req.body
          const result = await orderHelpers.refundAmont(req.body)
          if (result.modifiedCount === 1) {
            orderHelpers.updateRefundStatus(orderId)
            res.json({ status: true })
          } else {
            res.json({ status: false })
          }
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
      paginateUsingLimitAndSkip: async (req, res) => {
        try {
          const limit = 7
          const skip = 7
          const { pageNo } = req.query
          const response = await orderHelpers.paginateUsingLimitAndSkip(
            limit,
            skip,
            pageNo
          )
          response?.length
            ? res.status(200).json(response)
            : res.status(400).json({ Message: "Response not found" })
        } catch (err) {
          res.status(500).send("Internal Server Error")
        }
      },
}