import { uploadSingle, uploadImages } from "../../config/cloudinary.js"
import { validationResult } from "express-validator"
import { productHelpers } from "../../helpers/adminHelpers/productHelpers.js"
import { categoryHelpers } from "../../helpers/adminHelpers/categoryHelpers.js"
export const productControler = {
    addProductTemplateGet: async (req, res) => {
        try {
          const categoires = await categoryHelpers.getAllCategories()
          const subcategories = await categoryHelpers.getAllSubCategories()
          res.render("admin/add-product-template", { categoires, subcategories })
        } catch (error) {
          res.status(500).json({ Message: "Internal Server Error" })
        }
      },
      addProductTemplatePost: async (req, res) => {
        try {
          const { file, body } = req
          uploadSingle(file)
            .then(async (image) => {
              const response = await productHelpers.addProductTemplate(body, image)
              response.acknowledged
                ? res
                    .status(200)
                    .json({
                      status: true,
                      Message: "Successfully added new product",
                    })
                : res
                    .status(500)
                    .json({ status: false, Message: "Failed to add new product" })
            })
            .catch((error) => {
              throw new Error(error)
            })
        } catch (error) {
          res.status(500).json({ Message: "Internal Server Error" })
        }
      },
      viewProductTemplages: async (req, res) => {
        try {
          const productTemplates = await productHelpers.getProductTemplates()
          res.render("admin/view-product-template", { productTemplates })
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
      addProducts3Get: async (req, res) => {
        try {
          const { productId } = req.params
          const category = await categoryHelpers.getAllCategories()
          const sizes = await categoryHelpers.getAllSize()
          const colors = await categoryHelpers.getAllColor()
          res.render("admin/add-product3", {
            category,
            sizes,
            colors,
            productId,
          })
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
      addProducts3Post: async (req, res) => {
        const { body, files } = req
        const { errors } = validationResult(req)
        try {
          if (errors.length) {
            res.json({ Msg: errors, error: true })
          } else {
            uploadImages(files)
              .then(async (urls) => {
                const response = await productHelpers.addProducts(body, urls)
                response.acknowledged
                  ? res
                      .status(200)
                      .json({
                        status: true,
                        Message: "Successfully added new product",
                      })
                  : res
                      .status(500)
                      .json({
                        status: false,
                        Message: "Failed to add new product",
                      })
              })
              .catch((error) => {
                throw new Error(error)
              })
          }
        } catch (err) {
          req.session.addProductStatus = false
          req.session.save(() => {
            res.redirect("/admin/dashboard/add-product-category")
          })
          throw err
        }
      },
      viewProductList: (req, res) => {
        const { parentId } = req.params
        productHelpers.viewProduct(parentId).then((products) => {
          res.render("admin/view-product-list", { products })
        })
      },
      editProductsListGet: (req, res) => {
        const productId = req.params.id
        productHelpers.getProductDetails(productId).then((product) => {
          res.render("admin/edit-product", {
            product,
            Prostatus: req.session.updateProductStatus,
            updateErr: req.session.updateProductError,
            updateMsg: req.session.updateMsg,
          })
          req.session.updateProductError = req.session.updateProductStatus = null
          req.session.updateMsg = false
        })
      },
      editProductsListPut: async (req, res) => {
        try {
          const productId = req.params.id
          const errors = validationResult(req)
          req.session.updateProductError = errors.errors
          if (req.session.updateProductError.length === 0) {
            await productHelpers.updateProductsList(productId, req.body)
            req.session.updateProductStatus = true
            req.session.updateMsg = "Product updated successfully.."
            res.redirect("/admin/dashboard/view-products-in-list")
            if (req.files) {
              const image = req.files.product_image
              const objId = req.params.id
              image.mv(`./public/post-images/${objId}.jpg`)
            }
          } else {
            req.session.updateProductStatus = false
            return res.redirect(
              `/admin/dashboard/view-product-list/edit-products-list/${productId}`
            )
          }
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
      disableAndEnableProduct: async (req, res) => {
        try {
          const { productId, isActive } = req.body
          const resp = await productHelpers.disableEnableProduct(productId, isActive)
          res.json(resp.value)
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
      viewProductsGrid: (req, res) => {
        res.render("admin/view-products-grid")
      },
}