import adminHelpers from '../helpers/admin-helpers.js'
import { validationResult } from 'express-validator'
import otherHelpers from '../helpers/otherHelpers.js'
import generateReport from '../middlewares/salesReport.js'
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'
import { uploadImages, uploadSingle } from '../config/cloudinary.js'
const adminControler = {
  adminLoginGet: (req, res) => {
    const { admin, loginError } = req.session
    if (admin) {
      return res.redirect('/admin/dashboard')
    }
    res.render('admin/loginAdmin', { loginErr: loginError })
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
        req.session.loginError = 'Invalid email address...'
        res.json({ status: false })
      } else {
        req.session.loginError = 'Incorrect password '
        res.json({ status: false })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Server Error' })
    }
  },
  adminDashboard: async (req, res) => {
    try {
      const [
        totoalRevenue,
        totalOrders,
        totalProducts,
        monthlyEarnings
      ] = await Promise.all([
        adminHelpers.calculateTotalRevenue(),
        adminHelpers.calculateTotalOrders(),
        adminHelpers.calculateTotalNumberOfProducts(),
        adminHelpers.calculateMonthlyEarnings()
      ])
      const formattedRevenue = otherHelpers.currencyFormatter(totoalRevenue)
      const formattedMonthlyEarnings = otherHelpers.currencyFormatter(monthlyEarnings)
      res.render('admin/index', {
        totoalRevenue: formattedRevenue,
        totalOrders,
        totalProducts,
        monthlyEarnings: formattedMonthlyEarnings
      })
    } catch (error) {
      console.log(error)
      res.render('error', { message: 'Error fetching dashboard data' })
    }
  },
  addProducts3Get: async (req, res) => {
    try {
      const category = await adminHelpers.getAllCategories()
      res.render('admin/add-product3', { category, productAddingErr: req.session.addProductError, productAddingSucc: req.session.addProductSuccess, Prostatus: req.session.addProductStatus })
      req.session.addProductError = null
      req.session.addProductStatus = null
      req.session.addProductSuccess = null
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  addProducts3Post: async (req, res) => {
    const { body, files } = req
    console.log(body)
    console.log(files)
    const { errors } = validationResult(req)
    console.log(errors)
    try {
      if (errors.length === 0) {
        // Process the uploaded files and respond to the client
        cloudinary.config({
          cloud_name: process.env.CLOUD_NAME,
          api_key: process.env.API_KEY,
          api_secret: process.env.API_SECRET
        })
        async function uploadImages(images) {
          const urls = []
          for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.uploader.upload(images[i].path)
            urls.push(result.secure_url)
          }
          return urls
        }
        uploadImages(files)
          .then(async (urls) => {
            // Store the URLs in your database here
            // console.log(urls)
            await adminHelpers.addProducts(body, urls)
            req.session.addProductSuccess = 'Successfully added product you can add another product...'
            req.session.addProductStatus = true
            res.redirect('/admin/dashboard/view-products-in-list/add-products')
          })
          .catch((error) => {
            console.log(error)
          })
      } else {
        req.session.addProductError = errors
        res.redirect('/admin/dashboard/view-products-in-list/add-products ')
      }
    } catch (err) {
      console.error(err)
      req.session.addProductStatus = false
      req.session.save(() => {
        res.redirect('/admin/dashboard/add-product-category')
      })
      throw err
    }
  },
  viewProductList: (req, res) => {
    adminHelpers.viewProduct().then((products) => {
      res.render('admin/view-product-list', { products })
    })
  },
  editProductsListGet: (req, res) => {
    const productId = req.params.id
    adminHelpers.getProductDetails(productId).then(product => {
      console.log(product)
      res.render('admin/edit-product', { product, Prostatus: req.session.updateProductStatus, updateErr: req.session.updateProductError, updateMsg: req.session.updateMsg })
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
        req.session.updateMsg = 'Product updated successfully..'
        res.redirect('/admin/dashboard/view-products-in-list')
        if (req.files) {
          const image = req.files.product_image
          const objId = req.params.id
          image.mv(`./public/post-images/${objId}.jpg`)
        }
      } else {
        req.session.updateProductStatus = false
        return res.redirect(`/admin/dashboard/view-product-list/edit-products-list/${productId}`)
      }
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
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
      res.status(500).send('Internal Server Error')
    }
  },
  viewProductsGrid: (req, res) => {
    res.render('admin/view-products-grid')
  },
  addCategoryGet: async (req, res) => {
    try {
      const category = await adminHelpers.getAllCategories()
      res.render('admin/view-products-category', {
        category,
        deletedCategory: req.session.categoryDeleted,
        addedCategory: req.session.addedCategory
      })
      req.session.categoryDeleted = req.session.addedCategory = null
    } catch (error) {
      console.log(error)
      res.status(500).send('Internal Server Error')
    }
  },
  addCategoryPost: (req, res) => {
    try {
      const { body } = req
      adminHelpers.addCategories(body)
        .then(() => {
          req.session.addedCategory = 'Added Category you can add another one'
          res.redirect('/admin/dashboard/add-product-category')
        })
    } catch (error) {
      console.log(error)
    }
  },
  editCategoryGet: (req, res) => {
    try {
      const { id } = req.params
      adminHelpers.getCurrentCategory(id)
        .then((category) => {
          console.log(category)
          res.render('admin/edit-product-category', { category })
        })
    } catch (error) {
      console.log(error)
    }
  },
  editCategoryPut: (req, res) => {
    const { id } = req.params
    adminHelpers.updateCurrentCategory(id, req.body)
      .then((status) => {
        console.log(status)
        res.redirect('/admin/dashboard/add-product-category')
      })
  },
  deleteProductCategory: (req, res) => {
    const { id } = req.params
    adminHelpers.deleteProductCategory(id)
      .then(() => {
        req.session.categoryDeleted = 'Deleted Category'
        res.redirect('/admin/dashboard/add-product-category')
      })
  },
  viewUsers: (req, res) => {
    adminHelpers.viewAllUser().then((users) => {
      res.render('admin/view-users', { users })
    })
  },
  blockAndUnblockUsers: (req, res) => {
    adminHelpers.blockUnblockUsers(req.body).then((userStat) => {
      res.json(userStat)
    })
  },
  getBlockedUsers: (req, res) => {
    adminHelpers.blockedUsers().then((blockeduser) => {
      res.render('admin/blocked-users', { blockeduser })
    })
  },
  viewAllOrders: async (req, res) => {
    const orders = await adminHelpers.getAllUserOrders()
    console.log(orders)
    const odr = adminHelpers.ISO_to_Normal_Date(orders)
    res.render('admin/page-orders-1', { odr })  
  },
  viewOrderDetails: async (req, res) => {
    const orderDetails = await adminHelpers.getCurrentProducts(req.params.id)
    // let orders = adminHelpers.ISO_to_Normal_Date(odr)
    console.log(orderDetails)
    res.render('admin/view-more-orders', { orderDetails })
  },
  changeProductStatus: (req, res) => {
    adminHelpers.changeOrderStatus(req.body).then(() => {
      res.redirect('/admin/admin-view-orders')
    })
  },
  orderReturn: async (req, res) => {
    const odr = await adminHelpers.getReturnedOrders()
    const returnOrders = adminHelpers.ISO_to_Normal_Date(odr)
    res.render('admin/order-return', { returnOrders })
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
    res.render('admin/offer-category')
  },
  addOffersPost: (req, res) => {
    adminHelpers.addOffer(req.body).then((response) => {
      res.json(response)
    })
  },
  replaceOfers: (req, res) => {
    adminHelpers.replaceOfers(req.body)
  },
  addOffersProducts: (req, res) => {
    res.render('admin/offer-products', { prodInfo: req.query })
  },
  addOffersProductsPost: (req, res) => {
    adminHelpers.addOfferToProducts(req.body).then(()=>{
      res.redirect('/admin/dashboard/view-product-list/add-offers-for-products')
    })
  },
  viewOffers: (req, res) => {
    res.render('admin/view-offers')

  },
  makeReport: async (req, res) => {
    const { format } = req.body
    // Check if format field is present
    if (!format) {
      return res.status(400).send('Format field is required')
    }
    // Generate the sales report using your e-commerce data
    const salesData = {}
    try {
      salesData.totalRevenue = await adminHelpers.calculateTotalRevenue()
      salesData.totalOrders = await adminHelpers.calculateTotalOrders()
      salesData.totalProducts = await adminHelpers.calculateTotalNumberOfProducts()
      salesData.monthlyEarnings = await adminHelpers.calculateMonthlyEarnings()
    } catch (err) {
      console.log('Error calculating sales data:', err)
      return res.status(500).send('Error calculating sales data')
    }
    try {
      // Convert the report into the selected file format and get the name of the generated file
      const reportFile = await generateReport(format, salesData)
      // Set content type and file extension based on format
      let contentType, fileExtension
      if (format === 'pdf') {
        contentType = 'application/pdf'
        fileExtension = 'pdf'
      } else if (format === 'excel') {
        console.log('proper format')
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileExtension = 'xlsx'
      } else {
        return res.status(400).send('Invalid format specified')
      }
      // Send the report back to the client and download it
      res.setHeader('Content-Disposition', `attachment; filename=sales-report.${fileExtension}`)
      res.setHeader('Content-Type', contentType)
      const fileStream = fs.createReadStream(reportFile)
      fileStream.pipe(res)
      fileStream.on('end', () => {
        console.log('File sent successfully!')
        // Remove the file from the server
        fs.unlink(reportFile, (err) => {
          if (err) {
            console.log('Error deleting file:', err)
          } else {
            console.log('File deleted successfully!')
          }
        })
      })
    } catch (err) {
      console.log('Error generating report:', err)
      return res.status(500).send('Error generating report')
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
      res.status(500).send('Internal Server Error')
    }
  },
  addProductsVariants: (req, res) => {
    try {
      res.render('admin/product-variants')
    } catch (error) {
      console.log(error)
    }
  },
  addSubCategoryGet: async (req, res) => {
    try {
      const subCategories = await adminHelpers.getAllSubCategories()
      res.render('admin/add-sub-category', { subCategories })
    } catch (error) {
      console.log(error)
      res.status(500).send('Internal server error')

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
      res.status(500).send('Internal Server Error')
    }
  },
  editSubCategory: (req, res) => {
    console.log(req.body)

  },
  deleteSubCategory: async (req, res) => {
    try {
      const response = await adminHelpers.deleteSubCategory(req.params.id)
      res.status(200).json({ message: response });
    } catch (error) {
      console.log(error)
      res.status(500).send('Internal server error')
    }
  },
  addCouponTemplate: ( req, res) => {
    try {
      res.render('admin/add-coupon')
    } catch (error) {
      console.log(error)
    }
  },
  addCouponTemplatePost: (req, res) => {
    try {
      console.log(req.body)
      console.log(req.file)
      uploadSingle(req.file).then(async (urls) => {
        console.log(urls)
        adminHelpers.addCouponTemplate(req.body,urls).then((response)=> {
          console.log(response)
          res.redirect('/admin/dashboard/add-coupon')
        })
  })
  .catch((error) => {
    console.log(error)
  })
      console.log(req.body)
    } catch (error) {
      console.log(error)
    }
  },
  viewCoupons: async (req, res) => {
    try {
      const coupons = await adminHelpers.getAllCoupons()
      res.render('admin/view-coupon', { coupons })
    } catch (error) {
      console.log(error)
    }
  },
  logoutAdmin: (req, res) => {
    req.session.admin = null
    res.redirect('/admin')
  }
}
export default adminControler
