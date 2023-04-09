import express from "express"
const router = express.Router()
import adminValidate from "../validation/adminValidation.js"
import upload from "../middlewares/multer.js"
import sessionCheck from "../middlewares/session-checks.js"
import { loginControler } from "../controlers/adminControlers/loginControler.js"
import { productControler } from "../controlers/adminControlers/productConroler.js"
import { categoryControler } from "../controlers/adminControlers/categoryControler.js"
import { adminUserControlers } from "../controlers/adminControlers/adminUserControler.js"
import { orderControlers } from "../controlers/adminControlers/orderControlers.js"
import { offerControlers } from "../controlers/adminControlers/offerControlers.js"
import { dashboardControler } from "../controlers/adminControlers/dashboardControlers.js"
import { couponControler } from "../controlers/adminControlers/couponControler.js"
import { stockControler } from "../controlers/adminControlers/stockControler.js"
//? ROUTES FOR HANDLING ADMIN LOGIN
//  *router is handling both get and post request by route chaining
router
  .route("/")
  .get(loginControler.adminLoginGet)
  .post(adminValidate.adminLoginValidate, loginControler.adminLoginPost)

//? ADMIN DASHBOARD
router.get(
  "/dashboard",
  sessionCheck.isAdminExist,
  dashboardControler.adminDashboard
)

//? ROUTES FOR HANDLING PRODUCTS
//* upload.array() method is handling the images upload by multer library
//for adding product templates
router
   .route('/dashboard/add-product-templates')
  .get(sessionCheck.isAdminExist,productControler.addProductTemplateGet)
  .post(
    upload.single('product_thumbanil'),
    productControler.addProductTemplatePost
    )
router.get('/dashboard/view-product-templates',productControler.viewProductTemplages)
// For adding products
router
  .get("/dashboard/view-product-template/add-products/:productId",sessionCheck.isAdminExist, productControler.addProducts3Get)
router
  .post(
    "/dashboard/view-product-template/add-products/",
    upload.array("product_image", 10),
    adminValidate.addProductValidate,
    productControler.addProducts3Post
  )

// For viewing products
router.get(
  "/dashboard/view-product-templates/view-child-products/:parentId",
  sessionCheck.isAdminExist,
  productControler.viewProductList
)

//  Edit products
// * @param id is the parameter for the url (it is a product id)
router
  .route("/dashboard/view-product-template/edit-child-product/:id")
  .get(sessionCheck.isAdminExist, productControler.editProductsListGet)
  .post(adminValidate.addProductValidate, productControler.editProductsListPut)

// disable product in list view
router.post(
  "/dashboard/view-product-template/diable-and-enable-products",
  productControler.disableAndEnableProduct
)

// Add offers for individual products
router
  .route("/dashboard/view-product-template/add-offers-for-products")
  .get(offerControlers.addOffersProducts)
  .post(offerControlers.addOffersProductsPost)

// stock management routes
router
  .route("/dashboard/stock-management")
  .get(stockControler.stockManagement)
  .post(sessionCheck.isAdminExist,stockControler.changeProductStock)
// Grid view for the product
router.get(
  "/dashboard/view-products-in-grid",
  sessionCheck.isAdminExist,
  productControler.viewProductsGrid
)

//? ROUTED FOR HANDLING CATEGORIES AND SUB CATEGORIES
// Category management - Add categories
router
  .route("/dashboard/add-product-category")
  .get(sessionCheck.isAdminExist, categoryControler.addCategoryGet)
  .post(categoryControler.addCategoryPost)

// Category management - Edit categories
//* @param id is the parameter for this url (it is a category id)
router
  .route("/dashboard/add-product-category/edit-product-category/:id")
  .get(sessionCheck.isAdminExist, categoryControler.editCategoryGet)
  .post(categoryControler.editCategoryPut)

// Category management - Delete category
//* @params id is the parameter for this url (it is the category id)
router.get(
  "/dashboard/add-product-category/delete-product-category/:id",
  categoryControler.deleteProductCategory
)

// Category management - Add subcategory
router
  .route("/dashboard/add-product-sub-category")
  .get(categoryControler.addSubCategoryGet)
  .post(categoryControler.addSubCategoryPost)

// Delete sub categories
router.get("/dashboard/delete-sub-category", categoryControler.deleteSubCategory)

// Edit subcategory
router.post(
  "/dashboard/add-product-category/edit-sub-category",
  categoryControler.editSubCategory
)

// Delete subcategory
//* @params id is the id for this url (it is the sub category id)
router.get(
  "/dashboard/add-product-category/delete-sub-category/:id",
  categoryControler.deleteSubCategory
)

// Manage product variants
router.get("/dashboard/add-product-variants", categoryControler.addProductsVariants)

router.post('/dashboard/add-color',sessionCheck.isAdminExist,categoryControler.addColors)
router.post('/dashboard/add-size',sessionCheck.isAdminExist,categoryControler.addSize)


//? ROUTES FOR HANDLING ORDERS
// view and manage orders
router.get("/dashboard/admin-view-orders", orderControlers.viewAllOrders)

// change status of ordered products
router.post("/change-product-status", orderControlers.changeProductStatus)

// view orders more
//* @params id is the parameter for this url (it is order id)
router.get(
  "/dashboard/admin-view-orders/view-order-details/:id",
  orderControlers.viewOrderDetails
)

// order return
router.get(
  "/dashboard/order-return",
  sessionCheck.isAdminExist,
  orderControlers.orderReturn
)

//change return status
router.post("/change-return-status", orderControlers.changeReturnStatus)

//sett pcickup date
router.post("/set-pick-up-date", orderControlers.setPickUpDate)

// amount refund
router.post("/refund-amount", orderControlers.refundAmount)

//? ROUTES FOR HANDLING USERS
// view Users
router.get(
  "/dashboard/view-users",
  sessionCheck.isAdminExist,
  adminUserControlers.viewUsers
)

// Block users
router.post(
  "/dashboard/view-users/block-and-unblock-users",
  adminUserControlers.blockAndUnblockUsers
)

// Blocked users
router.get(
  "/dashboard/blocked-users",
  sessionCheck.isAdminExist,
  adminUserControlers.getBlockedUsers
)

//? ROUTES FOR HANDLING OFFRES
// offer management
router
  .route("/dashboard/add-offers-by-category")
  .get(sessionCheck.isAdminExist, offerControlers.addOffersGet)
  .post(offerControlers.addOffersPost)

//for viewing existing offers
router
  .route("/dashboard/view-offers")
  .get(sessionCheck.isAdminExist, offerControlers.viewOffers)

router.post("/replace-offer", offerControlers.replaceOfers)

//?ROUTES FOR COUPONS
router
  .route("/dashboard/add-coupon")
  .get(couponControler.addCouponTemplate)
  .post(upload.single("coupon-image"), couponControler.addCouponTemplatePost)

router.route("/dashboard/view-coupons").get(couponControler.viewCoupons)

//? ROUTE FOR CREATING PDF AND EXCEL
// create sales report
router.route("/dashboard/create-report").get(dashboardControler.makeReportGet).post(dashboardControler.makeReport)
router
  .route("/dashboard/filter-report")
  .post(dashboardControler.filterReportData)

//? Routes for fetching the data for graphs and charts
//! error warning (promise errors)
router.get(
  "/data-for-most-selling-product",
  sessionCheck.isAdminExist,
  dashboardControler.getChartData
)
router.get(
  "/data-for-other-graphs-and-chart",
  sessionCheck.isAdminExist,
  dashboardControler.getData
)

//? routers for showing the reviews
router.get(
  "/dashboard/user-reviews",
  sessionCheck.isAdminExist,
  adminUserControlers.getUserReviews
)

//? FOR PAGINATION  
router.get("/limit-and-skip-documents",orderControlers.paginateUsingLimitAndSkip)

//? ADMIN LOGOUT
//Logout admin
router.get("/logoutAdmin", loginControler.logoutAdmin)

export default router
