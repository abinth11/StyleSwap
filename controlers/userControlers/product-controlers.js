import fetchcallHelpers from "../../helpers/fetch-apis.js"
import { userProductHelpers } from "../../helpers/userHelpers/userProductHelpers.js"
import { orderHelpers } from "../../helpers/userHelpers/orderHelpers.js"
import otherHelpers from "../../helpers/otherHelpers.js"
import HttpStatusCodes from "../../contants/httpStatusCodes.js"
export const productControler = {
  changeProduct: async (req, res) => {
    try {
      const { productId, parentId } = req.body
      const parent = await userProductHelpers.findParent(parentId)
      const product = await userProductHelpers.viewCurrentProduct(productId)
      const allowedColors = ["red", "green", "blue", "yellow", "black","maroon"]
      const availabeColors = parent.availabeColors
      const availabeSizes = parent.availabeSizes
      res.status(HttpStatusCodes.OK).json({
        product,
        allowedColors,
        availabeColors,
        availabeSizes,
      })
    } catch (error) {
      res 
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .json({ Message: "Error while changing product color", error: true })
    }
  },
  shopProductRight: async (req, res) => {
    try {
      const { productId, parentId } = req.query
      const parent = await userProductHelpers.findParent(parentId)
      const product = await userProductHelpers.viewCurrentProduct(productId)
      const userId = req.session?.user?._id
      const allowedColors = ["red", "green", "blue", "yellow", "black"]
      const availabeColors = parent.availabeColors
      const availabeSizes = parent.availabeSizes
      let reviews = 0
      if (product?.ratings?.length) {
        reviews = product.ratings.length
      }
      res.render("users/shop-product-right", {
        user: req.session.user,
        product,
        reviews,
        allowedColors,
        availabeColors,
        availabeSizes,
        parentId,
        userId, 
        parent
      })
    } catch (error) {
      res.render("users/shop-product-right", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  mensCategory: async (req, res) => {
    try {
      const products = await userProductHelpers.getMensProducts()
      const numberofProducts = products.length
      res.render("users/shop-men", { products, numberofProducts })
    } catch (error) {
      res.render("users/shop-men", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  womensCategory: async (req, res) => {
    try {
      const products = await userProductHelpers.getWomensProducts()
      const numberofProducts = products.length
      res.render("users/shop-womens", { products, numberofProducts })
    } catch (error) {
      res.render("users/shop-womens", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  kidsCategory: async (req, res) => {
    try {
      const products = await userProductHelpers.getKidsProducts()
      const numberofProducts = products.length
      res.render("users/shop-womens", { products, numberofProducts })
    } catch (error) {
      res.render("users/shop-womens", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  serchProductsWithRedis: async (req,res) => {
    try {
      const {q:searchValue} = req.query
      const response = await otherHelpers.getProductsWithRedis(searchValue)
      if (response?.products && response.products.length > 7) {    
        response.products = response.products.slice(0,7)
      }
      response?.products  
      ?res.status(HttpStatusCodes.OK).json(response)
      :res.status(HttpStatusCodes.BAD_REQUEST).json({"Message":"Result not found"})
    } catch (err) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({Message:"failed to search the product"})
    }
  },
  addRatingForProducts: async (req, res) => {
    try {
      if (req.session?.user?._id) {
        const userInfo = req.session.user
        const response = await userProductHelpers.addRatingForProducts(
          req.body,
          userInfo
        )
        res.json(response)
      } else {
        res.json({ Message: "Please login to add a review ", status: false })
      }
    } catch (error) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error while adding rating" })
    }
  },
  editRating: async (req,res) => {
    try {
      const userId = req.session.user._id
      const response = await userProductHelpers.editReviews(req.body,userId)
      response.acknowledged
      ?res.status(HttpStatusCodes.OK).json({status:true,"Message":"Updated comment"})
      :res.status(HttpStatusCodes.BAD_REQUEST).json({status:false,"Message":"Error while updating comment"})
    } catch (error) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" })
    }

  },
  getSizeAndColor: async (req, res) => {
    try {
      const { productId } = req.params
      const response = await fetchcallHelpers.checkOutofStock(productId)
      if (response.stock) {
        const sizeAndColor = await fetchcallHelpers.getSizeAndColor(productId)
        const colors = sizeAndColor.availabeColors
        const sizes = sizeAndColor.availabeSizes
        res.status(HttpStatusCodes.OK).json({ colors, sizes, stock: true })
      } else {
        res.status(HttpStatusCodes.OK).json(response)
      }
    } catch (error) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ Message: "Internal server error", status: error })
    }
  },
  viewMoreProducts: async (req, res) => {
    try {
      const orderedProductsWithSameId =
        await orderHelpers.getProductsWithSameId(req.params.id)
      res.render("users/view-more-orders", { orderedProductsWithSameId })
    } catch (error) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" })
    }
  },
  returnProducts:async (req, res) => {
    try {
        const response = await orderHelpers.returnProduct(req.body)
        response.modifiedCount
        ?res.status(HttpStatusCodes.OK).json({status:true,Message:"Successfully requested for return"})
        :res.status(HttpStatusCodes.BAD_REQUEST).json({status:false,Message:"Return request failed.."})
    } catch (error) {
      res.render("users/view-orders", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
}
