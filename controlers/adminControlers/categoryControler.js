import { categoryHelpers } from "../../helpers/adminHelpers/categoryHelpers.js"
export const categoryControler = {
    addCategoryGet: async (req, res) => {
        try {
          const category = await categoryHelpers.getAllCategories()
          res.render("admin/view-products-category", {
            category,
            deletedCategory: req.session.categoryDeleted,
            addedCategory: req.session.addedCategory,
          })
          req.session.categoryDeleted = req.session.addedCategory = null
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
      addCategoryPost: (req, res) => {
        try {
          const { body } = req
          categoryHelpers.addCategories(body).then(() => {
            req.session.addedCategory = "Added Category you can add another one"
            res.redirect("/admin/dashboard/add-product-category")
          })
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
      editCategoryGet: (req, res) => {
        try {
          const { id } = req.params
          categoryHelpers.getCurrentCategory(id).then((category) => {
            res.render("admin/edit-product-category", { category })
          })
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
      editCategoryPut: (req, res) => {
        const { id } = req.params
        categoryHelpers.updateCurrentCategory(id, req.body).then(() => {
          res.redirect("/admin/dashboard/add-product-category")
        })
      },
      deleteProductCategory: (req, res) => {
        const { id } = req.params
        categoryHelpers.deleteProductCategory(id).then(() => {
          req.session.categoryDeleted = "Deleted Category"
          res.redirect("/admin/dashboard/add-product-category")
        })
      },
      addSubCategoryGet: async (req, res) => {
        try {
          const subCategories = await categoryHelpers.getAllSubCategories()
          res.render("admin/add-sub-category", { subCategories })
        } catch (error) {
          res.status(500).send("Internal server error")
        }
      },
      addSubCategoryPost: async (req, res) => {
        try {
          const response = await categoryHelpers.addSubCategory(req.body)
          res.status(200).json(response)
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
      editSubCategory: (req) => {
        console.log(req.body)
      },
      deleteSubCategory: async (req, res) => {
        try {
          const response = await categoryHelpers.deleteSubCategory(req.params.id)
          res.status(200).json({ message: response })
        } catch (error) {
          res.status(500).send("Internal server error")
        }
      },
      addProductsVariants: async (req, res) => {
        try {
          const sizes = await categoryHelpers.getAllSize()
          const colors = await categoryHelpers.getAllColor()
          res.render("admin/product-variants", { sizes, colors })
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },
      addColors: async (req, res) => {
        try {
          const response = await categoryHelpers.addColor(req.body)
          response.acknowledged
            ? res
                .status(200)
                .json({ Message: "Successfully adde Color", status: true })
            : res.status(500).json({ Message: "Insertion Failed", status: false })
        } catch (error) {
          res.status(500).json({ Message: "Internal Server Error" })
        }
      },
      addSize: async (req, res) => {
        try {
          const response = await categoryHelpers.addSize(req.body)
          response.acknowledged
            ? res
                .status(200)
                .json({ Message: "Successfully adde Size", status: true })
            : res.status(500).json({ Message: "Insertion Failed", status: false })
        } catch (error) {
          res.status(500).json({ Message: "Internal Server Error" })
        }
      },
    
}