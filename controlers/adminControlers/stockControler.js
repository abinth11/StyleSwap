import { stockHelper } from "../../helpers/adminHelpers/stockHelper.js"
export const stockControler = {
    stockManagement: async (req, res) => {
        try {
          const allProducts = await stockHelper.getAllProductsAndOutofStock()
          res.render("admin/stock-management", { allProducts })
        } catch (error) {
          res.status(500).json({ Message: "Internal Server Error" })
        }
      },
      changeProductStock: async (req, res) => {
        try {
          const { productId, quantity } = req.body
          const response = await stockHelper.updateProductStock(
            productId,
            quantity
          )
          response
            ? res.status(200).json({ response, Message: "Updated successfully" })
            : res
                .status(500)
                .json({
                  Message: "Something went wrong while updating the document..",
                })
        } catch (error) {
          res.status(500).json({ Message: "Internal server Error" })
        }
      },
}