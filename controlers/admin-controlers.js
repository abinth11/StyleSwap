const adminHelpers = require('../helpers/admin-helpers')
const { validationResult } = require('express-validator')
const otherHelpers = require('../helpers/otherHelpers')
const generateReport = require('../middlewares/salesReport')
const fs = require('fs')
module.exports = {
  adminLoginGet: (req, res) => {
    if (req.session.admin) {
      res.redirect('/admin/dashboard')
    } else {
      res.render('admin/loginAdmin', { loginErr: req.session.loginError })
      req.session.loginError = null
    }
  },
  adminLoginPost: (req, res) => {
    console.log(req.body)
    adminHelpers.adminLogin(req.body).then((response) => {
      if (response.status) {
        req.session.adminLoggedIn = true
        req.session.admin = response.admin
        res.json({ status: true })
        // res.redirect('/admin/dashboard')
      } else if (response.notExist) {
        req.session.loginError = 'Invalid email address...'
        res.json({ status: false })
        // res.redirect('/admin')
      } else {
        req.session.loginError = 'Incorrect password '
        res.json({ status: false })
        // res.redirect('/admin')
      }
    })
  },
  adminDashboard: async (req, res) => {
    // adminHelpers.checkOfferExpiration()
    let totoalRevenue = await adminHelpers.calculateTotalRevenue()
    const totalOrders = await adminHelpers.calculateTotalOrders()
    const totalProducts = await adminHelpers.calculateTotalNumberOfProducts()
    let monthlyEarnings = await adminHelpers.calculateMonthlyEarnings()
    totoalRevenue = otherHelpers.currencyFormatter(totoalRevenue)
    monthlyEarnings = otherHelpers.currencyFormatter(monthlyEarnings)
    res.render('admin/index', { totoalRevenue, totalOrders, totalProducts, monthlyEarnings })
  },
  addProducts1Get: (req, res) => {
    res.render('admin/add-product')
  },
  addProducts1Post: (req, res) => {
    console.log(req.body)
    // console.log(req.files)
    res.send('uploaded')
    // console.log(req.files)
    // const errors = validationResult(req);
    // console.log(errors);
    // adminHelpers.addProducts(req.body).then((data) => {
    //     console.log(data)
    // })
  },
  addProducts2Get: (req, res) => {
    res.render('admin/add-product2')
  },
  addProducts3Get: (req, res) => {
    adminHelpers.getAllCategories().then((category) => {
      res.render('admin/add-product3', { category, productAddingErr: req.session.addProductError, productAddingSucc: req.session.addProductSuccess, Prostatus: req.session.addProductStatus })
      req.session.addProductError = null
      req.session.addProductStatus = null
      req.session.addProductSuccess = null
    })
  },
  addProducts3Post: (req, res) => {
    console.log(req.body)
    const errors = validationResult(req)
    req.session.addProductError = errors.errors
    if (req.session.addProductError.length === 0) {
      adminHelpers.addProducts(req.body).then((data) => {
        const image = req.files?.product_image
        const objId = data.insertedId
        image.mv('./public/images/' + objId + '.jpg', err => {
          if (!err) {
            req.session.addProductSuccess = 'Successfully added product you can add another product...'
            req.session.addProductStatus = true
            res.redirect('/admin/addProduct3')
          } else {
            req.session.addProductStatus = false
            res.redirect('/admin/addProduct3')
          }
        })
      })
    } else {
      req.session.addProductStatus = false
      res.redirect('/admin/addProduct3')
    }
  },
  addProducts4Get: (req, res) => {
    res.render('admin/add-product4')
  },
  viewProductList: (req, res) => {
    adminHelpers.viewProduct().then((products) => {
      res.render('admin/view-product-list', { products })
    })
  },
  editProductsListGet: (req, res) => {
    const productId = req.params.id
    adminHelpers.getProductDetails(productId).then((product) => {
      console.log(product)
      res.render('admin/edit-product', { product, Prostatus: req.session.updateProductStatus, updateErr: req.session.updateProductError, updateMsg: req.session.updateMsg })
      req.session.updateProductError = null
      req.session.updateProductStatus = null
      req.session.updateMsg = false
    })
  },
  editProductsListPut: (req, res) => {
    const productId = req.params.id
    console.log(req.session)
    const errors = validationResult(req)
    console.log(errors)
    req.session.updateProductError = errors.errors
    if (req.session.updateProductError.length === 0) {
      adminHelpers.updateProductsList(productId, req.body).then(() => {
        req.session.updateProductStatus = true
        req.session.updateMsg = 'Product updated successfully..'
        res.redirect('/admin/viewPoductsList')
        if (req.files) {
          const image = req.files.product_image
          const objId = req.params.id
          image.mv('./public/post-images/' + objId + '.jpg')
        }
      })
    } else {
      req.session.updateProductStatus = false
      res.redirect(`/admin/editProductsList/${productId}`)
    }
  },
  disableAndEnableProduct: (req, res) => {
    const { productId, isActive } = req.body
    adminHelpers.disableEnableProduct(productId, isActive).then((resp) => {
      res.json(resp.value)
      console.log(resp.value)
    })
  },
  viewProductsGrid: (req, res) => {
    res.render('admin/view-products-grid')
  },
  viewProductsGrid2: (req, res) => {
    res.render('admin/view-products-grid2')
  },
  addCategoryGet: (req, res) => {
    adminHelpers.getAllCategories().then((category) => {
      res.render('admin/view-products-category', { category, deletedCategory: req.session.categoryDeleted, addedCategory: req.session.addedCategory })
      req.session.categoryDeleted = null
      req.session.addedCategory = null
    })
  },
  addCategoryPost: (req, res) => {
    console.log(req.body)
    adminHelpers.addCategories(req.body).then((data) => {
      req.session.addedCategory = 'Added Category you can add another one'
      res.redirect('/admin/addProductCategory')
    })
  },
  editCategoryGet: (req, res) => {
    const catId = req.params.id
    adminHelpers.getCurrentCategory(catId).then((category) => {
      res.render('admin/edit-product-category', { category })
    })
  },
  editCategoryPut: (req, res) => {
    const catId = req.params.id
    adminHelpers.updateCurrentCategory(catId, req.body).then((status) => {
      console.log(status)
      res.redirect('/admin/addProductCategory')
    })
  },
  deleteProductCategory: (req, res) => {
    const catId = req.params.id
    adminHelpers.deleteProductCategory(catId).then((response) => {
      console.log(response)
      req.session.categoryDeleted = 'Deleted Category'
      res.redirect('/admin/addProductCategory')
    })
  },
  viewUsers: (req, res) => {
    adminHelpers.viewAllUser().then((users) => {
      res.render('admin/view-users', { users })
    })
  },
  blockAndUnblockUsers: (req, res) => {
    console.log(req.body)
    adminHelpers.blockUnblockUsers(req.body).then((userStat) => {
      console.log(userStat)
      res.json(userStat)
    })
  },
  getBlockedUsers: (req, res) => {
    adminHelpers.blockedUsers().then((blockeduser) => {
      res.render('admin/blocked-users', { blockeduser })
      console.log(blockeduser)
    })
  },
  viewAllOrders: async (req, res) => {
    const orders = await adminHelpers.getAllUserOrders()
    const odr = adminHelpers.ISO_to_Normal_Date(orders)
    console.log(odr[0].products)
    res.render('admin/page-orders-1', { odr })
  },
  viewOrderDetails: async (req, res) => {
    console.log(req.params.id)
    const odr = await adminHelpers.getCurrentOrderMore(req.params.id)
    let orders = adminHelpers.ISO_to_Normal_Date(odr)
    const products = await adminHelpers.getCurrentProducts(req.params.id)
    const address = await adminHelpers.getallUserAddress(req.params.id)
    orders = orders[0]
    console.log(orders)
    // console.log(products)
    res.render('admin/view-more-orders', { orders, products, address })
  },
  changeProductStatus: (req, res) => {
    adminHelpers.changeOrderStatus(req.body).then((response) => {
      res.redirect('/admin/admin-view-orders')
      // console.log(response)
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
      // console.log(response)
    })
  },
  setPickUpDate: (req, res) => {
    // console.log(req.body)
    adminHelpers.setPickUpDate(req.body).then((response) => {
      console.log(response)
    })
  },
  addOffersGet: (req, res) => {
    res.render('admin/offer-category')
  },
  addOffersPost: (req, res) => {
    adminHelpers.addOffer(req.body).then((response) => {
      console.log(response)
      res.json(response)
    })
  },
  replaceOfers: (req, res) => {
    console.log('jsdkfsdkfsjflksdf')
    adminHelpers.replaceOfers(req.body)
  },
  addOffersProducts: (req, res) => {
    res.render('admin/offer-products', { prodInfo: req.query })
  },
  addOffersProductsPost: (req, res) => {
    console.log(req.body)
    adminHelpers.addOfferToProducts(req.body)
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
    const result = await adminHelpers.refundAmont(req.body)
    console.log(result)
    if (result.modifiedCount === 1) {
      res.json({ status: false })
    } else {
      res.json({ status: false })
    }
  },
  logoutAdmin: (req, res) => {
    req.session.admin = null
    res.redirect('/admin')
  }
}
