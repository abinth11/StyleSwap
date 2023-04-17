import { wishListHelper } from "../../helpers/userHelpers/wishListHelpers.js"
export const wishListController = {
    addToWishList:async (req,res) =>{
        try {
          if(req.session.user){
            const { productId } = req.params
            const userId = req.session.user?._id
            const response = await wishListHelper.addToWhishList(productId, userId)
            response.status = true
            res.json(response)
          } else {
            res.json({status:false})
          }   
          } catch (error) {
            res.status(500).json({ Message: "Internal server error" })
          }
    },
      userWishlistGet: async (req, res) => {
    try {
        const userId = req.session.user._id
        const wishItems = await wishListHelper.getProductsDetailsOfWishList(userId)
        res.render("users/wishList",{wishItems,user:userId})
    } catch (error) {
      res.render("users/wishList", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  removeProducts: async (req, res) => {
    try {
      const {productId } = req.params
      const userId = req.session.user._id
      const response = await wishListHelper.removeProducts(productId,userId)
      res.json(response)
    } catch (error) {
      res.status(500).json("Internal Server Error")
    }
  },


}