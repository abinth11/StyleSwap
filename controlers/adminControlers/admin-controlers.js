import adminHelpers from "../../helpers/admin-helpers.js"
import { validationResult } from "express-validator"
import generateReport from "../../middlewares/salesReport.js"
import fs from "fs"
import { uploadSingle,uploadImages } from "../../config/cloudinary.js"
const adminControler = {
  adminLoginGet: (req, res) => {
    const { admin, loginError } = req.session
    if (admin) {
      return res.redirect("/admin/dashboard")
    }
    res.render("admin/loginAdmin", { loginErr: loginError })
    req.session.loginError = null
  },
  adminLoginPost: async (req, res) => {
    try {
      const response = await adminHelpers.adminLogin(req.body)
      if (response.status) {
        req.session.adminLoggedIn = true
        req.session.admin = response.admin
        res.json({ status: true })
      } else if (response.notExist) {
        req.session.loginError = "Invalid email address..."
        res.json({ status: false })
      } else {
        req.session.loginError = "Incorrect password "
        res.json({ status: false })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Server Error" })
    }
  },
  adminDashboard: async (req, res) => {
    try {
      const [totalRevenue, totalOrders, totalProducts, monthlyEarnings] =
        await Promise.allSettled([
          adminHelpers.calculateTotalRevenue(),
          adminHelpers.calculateTotalOrders(),
          adminHelpers.calculateTotalNumberOfProducts(),
          adminHelpers.calculateMonthlyEarnings(),
        ]).then((results) =>
          results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value)
        )
      res.render("admin/index", {
        totalRevenue,
        totalOrders,
        totalProducts,
        monthlyEarnings,
      })
    } catch (error) {
      console.log(error)
      res.render("error", { message: "Error fetching dashboard data" })
    }
  },
  addProductTemplateGet: async (req,res) => {
    try{
      const categoires = await adminHelpers.getAllCategories()
      const subcategories = await adminHelpers.getAllSubCategories()
      res.render('admin/add-product-template', {categoires,subcategories})
    } catch (error){
      console.log(error)
      res.status(500).json({Message:"Internal Server Error"})
    }
  },
  addProductTemplatePost: async (req,res) => {
    try{
      const {file,body} = req
      console.log(file)
      uploadSingle(file)
      .then(async (image) => {
        console.log(image)
        const response = await adminHelpers.addProductTemplate(body,image)
        response.acknowledged 
        ?res.status(200).json({status:true,Message:"Successfully added new product"})
        :res.status(500).json({status:false,Message:"Failed to add new product"})
      })
      .catch((error) => {
        console.log(error)
      })
    } catch (error){     
      console.log(error)
      res.status(500).json({Message:"Internal Server Error"})
    }
  },
  viewProductTemplages: async (req,res)=> {
    try {
      const productTemplates = await adminHelpers.getProductTemplates()
      res.render('admin/view-product-template',{ productTemplates})
    }catch (error) {
      console.log(error)
    }

  },
  addProducts3Get: async (req, res) => {
    try {
      const {productId} = req.params
      const category = await adminHelpers.getAllCategories()
      const sizes = await adminHelpers.getAllSize()
      const colors = await adminHelpers.getAllColor()
      res.render("admin/add-product3", {
        category,
        sizes,
        colors,
        productId
      })
    } catch (error) {
      console.error(error)
      res.status(500).send("Internal Server Error")
    }
  },
  addProducts3Post: async (req, res) => {
    const { body, files } = req
    console.log(body)
    console.log(files)
    const { errors } = validationResult(req)
    try {
      if(errors.length) {
        console.log(errors)
        res.json({Msg:errors,error:true})
      } else {
        uploadImages(files)
            .then(async (urls) => {
              // Store the URLs in your database here
              console.log(urls)
              const response = await adminHelpers.addProducts(body, urls)
              console.log(response)
              response.acknowledged 
                ?res.status(200).json({status:true,Message:"Successfully added new product"})
                :res.status(500).json({status:false,Message:"Failed to add new product"})
            })
            .catch((error) => {
              console.log(error)
            })
      }
    } catch (err) {
      console.error(err)
      req.session.addProductStatus = false
      req.session.save(() => {
        res.redirect("/admin/dashboard/add-product-category")
      })
      throw err
    }
  },
  viewProductList: (req, res) => {
    const {parentId} = req.params
    adminHelpers.viewProduct(parentId).then((products) => {
      console.log(products)
      res.render("admin/view-product-list", { products })
    })
  },
  editProductsListGet: (req, res) => {
    const productId = req.params.id
    adminHelpers.getProductDetails(productId).then((product) => {
      console.log(product)
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
      console.log(req.session)
      const errors = validationResult(req)
      console.log(errors)
      req.session.updateProductError = errors.errors
      if (req.session.updateProductError.length === 0) {
        await adminHelpers.updateProductsList(productId, req.body)
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
      console.error(error)
      res.status(500).send("Internal Server Error")
    }
  },
  disableAndEnableProduct: async (req, res) => {
    try {
      const { productId, isActive } = req.body
      const resp = await adminHelpers.disableEnableProduct(productId, isActive)
      res.json(resp.value)
      console.log(resp.value)
    } catch (error) {
      console.log(error)
      res.status(500).send("Internal Server Error")
    }
  },
  viewProductsGrid: (req, res) => {
    res.render("admin/view-products-grid")
  },
  addCategoryGet: async (req, res) => {
    try {
      const category = await adminHelpers.getAllCategories()
      res.render("admin/view-products-category", {
        category,
        deletedCategory: req.session.categoryDeleted,
        addedCategory: req.session.addedCategory,
      })
      req.session.categoryDeleted = req.session.addedCategory = null
    } catch (error) {
      console.log(error)
      res.status(500).send("Internal Server Error")
    }
  },
  addCategoryPost: (req, res) => {
    try {
      const { body } = req
      adminHelpers.addCategories(body).then(() => {
        req.session.addedCategory = "Added Category you can add another one"
        res.redirect("/admin/dashboard/add-product-category")
      })
    } catch (error) {
      console.log(error)
    }
  },
  editCategoryGet: (req, res) => {
    try {
      const { id } = req.params
      adminHelpers.getCurrentCategory(id).then((category) => {
        console.log(category)
        res.render("admin/edit-product-category", { category })
      })
    } catch (error) {
      console.log(error)
    }
  },
  editCategoryPut: (req, res) => {
    const { id } = req.params
    adminHelpers.updateCurrentCategory(id, req.body).then((status) => {
      console.log(status)
      res.redirect("/admin/dashboard/add-product-category")
    })
  },
  deleteProductCategory: (req, res) => {
    const { id } = req.params
    adminHelpers.deleteProductCategory(id).then(() => {
      req.session.categoryDeleted = "Deleted Category"
      res.redirect("/admin/dashboard/add-product-category")
    })
  },
  viewUsers: (req, res) => {
    adminHelpers.viewAllUser().then((users) => {
      res.render("admin/view-users", { users })
    })
  },
  blockAndUnblockUsers: (req, res) => {
    adminHelpers.blockUnblockUsers(req.body).then((userStat) => {
      res.json(userStat)
    })
  },
  getBlockedUsers: (req, res) => {
    adminHelpers.blockedUsers().then((blockeduser) => {
      res.render("admin/blocked-users", { blockeduser })
    })
  },
  viewAllOrders: async (req, res) => {
    const response = await adminHelpers.getAllUserOrdersCount()
    res.render("admin/page-orders-1", {count:response.count })
  },
  viewOrderDetails: async (req, res) => {
    const orderDetails = await adminHelpers.getCurrentProducts(req.params.id)
    // let orders = adminHelpers.ISO_to_Normal_Date(odr)
    console.log(orderDetails)
    res.render("admin/view-more-orders", { orderDetails })
  },
  paginateUsingLimitAndSkip : async (req,res) => {
    try {
      const limit =7
      const skip = 7
      const {pageNo} = req.query
      console.log(pageNo)
      const response = await adminHelpers.paginateUsingLimitAndSkip(limit,skip,pageNo)
      console.log(response)
      response?.length
      ?res.status(200).json(response)
      :res.status(400).json({"Message":"Response not found"})
    } catch (err) {
      console.log(err)

    }
  },
  changeProductStatus: (req, res) => {
    adminHelpers.changeOrderStatus(req.body).then(() => {
      res.redirect("/admin/admin-view-orders")
    })
  },
  orderReturn: async (req, res) => {
    const odr = await adminHelpers.getReturnedOrders()
    const returnOrders = adminHelpers.ISO_to_Normal_Date(odr)
    res.render("admin/order-return", { returnOrders })
  },
  changeReturnStatus: (req, res) => {
    adminHelpers.changeReturnStatus(req.body).then((response) => {
      res.json(response)
    })
  },
  setPickUpDate: (req, res) => {
    adminHelpers.setPickUpDate(req.body)
  },
  addOffersGet: (req, res) => {
    res.render("admin/offer-category")
  },
  addOffersPost: (req, res) => {
    adminHelpers.addOffer(req.body).then((response) => {
      console.log(response)
      res.json(response)
    })
  },
  replaceOfers: (req, res) => {
    adminHelpers.replaceOfers(req.body)
  },
  addOffersProducts: (req, res) => {
    res.render("admin/offer-products", { prodInfo: req.query })
  },
  addOffersProductsPost: (req, res) => {
    console.log(req.body)
    adminHelpers.addOfferToProducts(req.body).then(() => {
      res.redirect(
        "/admin/dashboard/view-product-list/add-offers-for-products"
      )
    })
  },
  viewOffers: (req, res) => {
    res.render("admin/view-offers")
  },
  makeReportGet: async (req, res) => {
    try {
      // Get the current date
      let currentDate = new Date()
      // Format the date as YYYY-MM-DD string
      let formattedCurrDay = currentDate.toISOString().slice(0, 10) // "YYYY-MM-DD"
      // Set the date to the first day of the month
      let firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      )
      // Format the date as YYYY-MM-DD string
      let formattedFirstDay = firstDayOfMonth.toISOString().slice(0, 10) // "YYYY-MM-DD"

      const totalRevenue = await adminHelpers.calculateTotalRevenueByDate(
        formattedFirstDay,
        formattedCurrDay
      )
      const totalProducts =
        await adminHelpers.calculateTotalNumberOfProductsByDate(
          formattedFirstDay,
          formattedCurrDay
        )
      const totalOrders = await adminHelpers.calculateTotalOrdersByDate(
        formattedFirstDay,
        formattedCurrDay
      )
      const averageOrderValue = await adminHelpers.calculateAverageOrderValue(
        formattedFirstDay,
        formattedCurrDay
      )
      const monthlyEarnings = await adminHelpers.calculateMonthlyEarnings()
      const response = {
        totalRevenue,
        totalProducts,
        totalOrders,
        averageOrderValue,
        monthlyEarnings,
      }
      res.render("admin/create-report", { response })
    } catch (err) {
      console.log(err)
    }
  },
  filterReportData: async (req, res) => {
    try {
      //todo stopped here.. you dumb ...!
      const { from, to } = req.body
      // const [
      //   totalRevenue,
      //   totalOrders,
      //   totalProducts,
      //   monthlyEarnings
      // ] = Promise.allSettled([
      //   await adminHelpers.calculateTotalRevenue(from, to),
      //   await adminHelpers.calculateTotalOrders(from, to),
      //   await adminHelpers.calculateTotalNumberOfProducts(from, to),
      //   await adminHelpers.calculateMonthlyEarnings()
      // ])
      const totalRevenue = await adminHelpers.calculateTotalRevenueByDate(
        from,
        to
      )
      const totalProducts =
        await adminHelpers.calculateTotalNumberOfProductsByDate(from, to)
      const totalOrders = await adminHelpers.calculateTotalOrdersByDate(
        from,
        to
      )
      const averageOrderValue = await adminHelpers.calculateAverageOrderValue(
        from,
        to
      )
      const monthlyEarnings = await adminHelpers.calculateMonthlyEarnings()
      const response = {
        totalRevenue,
        totalProducts,
        totalOrders,
        averageOrderValue,
        monthlyEarnings,
        from,
        to,
      }
      console.log(response)
      res.json(response)
    } catch (error) {
      console.log(error)
      res.status(500).json({ Message: "Internal Server Error" })
    }
  },
  makeReport: async (req, res) => {
    console.log(req.body)
    const {
      format,
      totalRevenue,
      averageOrderValue,
      monthlyEarnings,
      totalOrders,
      numberOfProducts,
      from,
      to,
    } = req.body
    // Check if format field is present
    if (!format) {
      return res.status(400).send("Format field is required")
    }
    // Generate the sales report using your e-commerce data
    const salesData = {
      totalRevenue,
      averageOrderValue,
      monthlyEarnings,
      totalOrders,
      numberOfProducts,
    }
    const date = {
      from,
      to,
    }
    try {
      // Convert the report into the selected file format and get the name of the generated file
      const reportFile = await generateReport(format, salesData, date).catch(
        (err) => {
          console.log(err)
        }
      )
      // Set content type and file extension based on format
      let contentType, fileExtension
      if (format === "pdf") {
        contentType = "application/pdf"
        fileExtension = "pdf"
      } else if (format === "excel") {
        console.log("proper format")
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        fileExtension = "xlsx"
      } else {
        return res.status(400).send("Invalid format specified")
      }
      // Send the report back to the client and download it
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=sales-report.${fileExtension}`
      )
      res.setHeader("Content-Type", contentType)
      const fileStream = fs.createReadStream(reportFile)
      fileStream.pipe(res)
      fileStream.on("end", () => {
        console.log("File sent successfully!")
        // Remove the file from the server
        fs.unlink(reportFile, (err) => {
          if (err) {
            console.log("Error deleting file:", err)
          } else {
            console.log("File deleted successfully!")
          }
        })
      })
    } catch (err) {
      console.log("Error generating report:", err)
      return res.status(500).send("Error generating report")
    }
  },
  refundAmount: async (req, res) => {
    try {
      const { orderId } = req.body
      const result = await adminHelpers.refundAmont(req.body)
      if (result.modifiedCount === 1) {
        adminHelpers.updateRefundStatus(orderId)
        res.json({ status: true })
      } else {
        res.json({ status: false })
      }
    } catch (error) {
      console.log(error)
      res.status(500).send("Internal Server Error")
    }
  },
  addProductsVariants: async (req, res) => {
    try {
      const sizes = await adminHelpers.getAllSize()
      const colors = await adminHelpers.getAllColor()
      console.log(sizes)
      console.log(colors)
      res.render("admin/product-variants", {sizes,colors})
    } catch (error) {
      console.log(error)
    }
  },
  addSubCategoryGet: async (req, res) => {
    try {
      const subCategories = await adminHelpers.getAllSubCategories()
      res.render("admin/add-sub-category", { subCategories })
    } catch (error) {
      console.log(error)
      res.status(500).send("Internal server error")
    }
  },
  addSubCategoryPost: async (req, res) => {
    try {
      console.log(req.body)
      const response = await adminHelpers.addSubCategory(req.body)
      console.log(response)
      res.status(200).json(response)
    } catch (error) {
      console.log(error)
      res.status(500).send("Internal Server Error")
    }
  },
  editSubCategory: (req, res) => {
    console.log(req.body)
  },
  deleteSubCategory: async (req, res) => {
    try {
      const response = await adminHelpers.deleteSubCategory(req.params.id)
      res.status(200).json({ message: response })
    } catch (error) {
      console.log(error)
      res.status(500).send("Internal server error")
    }
  },
  addCouponTemplate: (req, res) => {
    try {
      res.render("admin/add-coupon")
    } catch (error) {
      console.log(error)
    }
  },
  addCouponTemplatePost: (req, res) => {
    try {
      uploadSingle(req.file)
        .then(async (urls) => {
          adminHelpers.addCouponTemplate(req.body, urls).then((response) => {
            console.log(response)
            res.redirect("/admin/dashboard/add-coupon")
          })
        })
        .catch((error) => {
          console.log(error)
        })
      
    } catch (error) {
      console.log(error)
    }
  },
  viewCoupons: async (req, res) => {
    try {
      const coupons = await adminHelpers.getAllCoupons()
      res.render("admin/view-coupon", { coupons })
    } catch (error) {
      console.log(error)
    }
  },
  getChartData: async (req, res) => {
    try {
      const mostSellingProducts = await adminHelpers.mostSellingProducts()
      const chartData = mostSellingProducts.slice(0, 5).map((product) => {
        return {
          name: product.product_details[0].product_title,
          sold: product.sold,
        }
      })
      res.json({ chartData })
    } catch (error) {
      console.log(error)
    }
  },
  getData: async (req, res) => {
    try {
      const [sales, products, visitors, orderStat, paymentStat] =
        await Promise.allSettled([
          adminHelpers.calculateMonthlySalesForGraph(),
          adminHelpers.NumberOfProductsAddedInEveryMonth(),
          adminHelpers.findNumberOfMonthlyVisitors(),
          adminHelpers.orderStatitics(),
          adminHelpers.paymentStat(),
        ]).then((results) =>
          results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value)
        )
      const response = {
        sales,
        products,
        visitors,
        orderStat,
        paymentStat,
      }
      res.json(response)
    } catch (error) {
      console.log(error)
    }
  },
  getUserReviews: async (req, res) => {
    try {
      const userReviews = await adminHelpers.getUserReviews()
      const reviews = userReviews?.reverse()
      res.render("admin/product-review", { reviews })
    } catch (error) {
      console.log(error)
      res.status(500).json({ Message: "Internal Server Error" })
    }
  },
  addColors: async (req, res) => {
    try {
      console.log(req.body)
      const response = await adminHelpers.addColor(req.body)
      response.acknowledged
        ? res.status(200).json({ Message: "Successfully adde Color",status:true})
        : res.status(500).json({ Message: "Insertion Failed",status:false})
    } catch (error) {
      console.log(error)
      res.status(500).json({ Message: "Internal Server Error" })
    }
  },
  addSize: async (req, res) => {
    try {
      console.log(req.body)
      const response = await adminHelpers.addSize(req.body)
      response.acknowledged
      ? res.status(200).json({ Message: "Successfully adde Size",status:true})
      : res.status(500).json({ Message: "Insertion Failed",status:false })
    } catch (error) {
      console.log(error)
      res.status(500).json({ Message: "Internal Server Error" })
    }
  },
  stockManagement:async (req,res) => {
    try {
      const allProducts = await adminHelpers.getAllProductsAndOutofStock()
      res.render('admin/stock-management', {allProducts})
    } catch (error){
      console.log(error)
      res.status(500).json({Message:"Internal Server Error"})
    }
  },
  changeProductStock: async(req, res) => {
    try {
      console.log(req.body)
      const { productId, quantity} = req.body
      const response = await adminHelpers.updateProductStock(productId,quantity)
      console.log(response)
     response
     ?res.status(200).json({response,Message:"Updated successfully"})
     :res.status(500).json({Message:"Something went wrong while updating the document.."})
    } catch(error) {
      console.log(error)
      res.status(500).json({Message:"Internal server Error"})
    }
  },
  logoutAdmin: (req, res) => {
    req.session.admin = null
    res.redirect("/admin")
  },
}
export default adminControler
