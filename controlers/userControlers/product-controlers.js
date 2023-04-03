import userHelpers from "../../helpers/user-helpers.js"
import fetchcallHelpers from "../../helpers/fetch-apis.js"
import { createIndexForAlgolia, searchWithAlgolia} from "../../config/algoliasearch.js"
export const productControler = {
    changeProduct: async (req, res) => {
        try {
          const { productId, parentId } = req.body
          const parent = await userHelpers.findParent(parentId)
          const product = await userHelpers.viewCurrentProduct(productId)
          const allowedColors = ["red", "green", "blue", "yellow", "black"]
          const availabeColors = parent.availabeColors
          const availabeSizes = parent.availabeSizes
          res.status(200).json({
            product,
            allowedColors,
            availabeColors,
            availabeSizes,
          })
        } catch (error) {
          res
            .statu(500)
            .json({ Message: "Error while changing product color", error: true })
        }
      },
      shopProductRight: async (req, res) => {
        try {
          const { productId, parentId } = req.query
          const parent = await userHelpers.findParent(parentId)
    
          const product = await userHelpers.viewCurrentProduct(productId)
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
          })
        } catch (error) {
          console.error(error)
          res.render("users/shop-product-right", {
            warningMessage: "Internal Server Error Please try again later...",
          })
        }
      },
      mensCategory: async (req, res) => {
        try {
          const products = await userHelpers.getMensProducts()
          console.log(products)
          const numberofProducts = products.length
          res.render("users/shop-men", { products, numberofProducts })
        } catch (error) {
          console.log(error)
          res.render("users/shop-men", { warningMessage: "Internal Server Error Please try again later..."})
        }
      },
      womensCategory: async (req, res) => {
        try {
          const products = await userHelpers.getWomensProducts()
          console.log(products)
          const numberofProducts = products.length
          res.render("users/shop-womens", { products, numberofProducts })
        } catch (error) {
          console.log(error)
          res.render("users/shop-womens", { warningMessage: "Internal Server Error Please try again later..."})
        }
      },
      kidsCategory: async (req, res) => {
        try {
          const products = await userHelpers.getKidsProducts()
          const numberofProducts = products.length
          res.render("users/shop-womens", { products, numberofProducts })
        } catch (error) {
          console.log(error)
          res.render("users/shop-womens", { warningMessage: "Internal Server Error Please try again later..."})
        }
      },
      indexProducts: async (req, res) => {
        //* function to index the products from database for searching
        const result = await createIndexForAlgolia()
        console.log(result)
        res.json(result)
      },
      searchProducts: async (req, res) => {
        try {
          const query = req.query.q
          console.log(query)
          const { hits } = await searchWithAlgolia(query)
          console.log(hits)
          if (hits.length === 0) {
            res.status(404).json({ message: "No results found" })
          } else {
            res.json(hits)
          }
        } catch (error) {
          console.error(error)
          res.status(500).json({ message: "Error while searching data" })
        }
      },
      addRatingForProducts: async (req, res) => {
        try {
          console.log(req.body)
          if (req.session?.user?._id) {
            const userInfo = req.session.user
            const response = await userHelpers.addRatingForProducts(
              req.body,
              userInfo
            )
            console.log(response)
            res.json(response)
          } else {
            res.json({ Message: "Please login to add a review ", status: false })
          }
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Error while adding rating" })
        }
      },
      getSizeAndColor: async (req, res) => {
        try {
          const { productId } = req.params
          const response = await fetchcallHelpers.checkOutofStock(productId)
          console.log(response)
          if (response.stock) {
            const sizeAndColor = await fetchcallHelpers.getSizeAndColor(productId)
            const colors = sizeAndColor.availabeColors
            const sizes = sizeAndColor.availabeSizes
            res.status(200).json({ colors, sizes, stock: true })
          } else {
            res.status(200).json(response)
          }
        } catch (error) {
          res.status(500).json({ Message: "Internal server error", status: error })
        }
      },
      viewMoreProducts: async (req, res) => {
        try {
          const orderedProductsWithSameId = await userHelpers.getProductsWithSameId(
            req.params.id
          )
          console.log(orderedProductsWithSameId)
          res.render("users/view-more-orders", { orderedProductsWithSameId })
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Internal server error" })
        }
      },
      returnProducts: (req, res) => {
        try {
          userHelpers.returnProduct(req.body)
        } catch (error) {
          console.log(error)
          res.render("users/view-orders", { warningMessage: "Internal Server Error Please try again later..."})
        }
      },
}