import express from "express"
const router = express.Router()
import adminControler from "../controlers/admin-controlers.js"
import adminValidate from "../validation/adminValidation.js"
import upload from "../middlewares/multer.js"
import sessionCheck from "../middlewares/session-checks.js"

//? ROUTES FOR HANDLING ADMIN LOGIN
//  *router is handling both get and post request by route chaining
router
  .route("/")
  .get(adminControler.adminLoginGet)
  .post(adminValidate.adminLoginValidate, adminControler.adminLoginPost)

//? ADMIN DASHBOARD
router.get(
  "/dashboard",
  sessionCheck.isAdminExist,
  adminControler.adminDashboard
)

//? ROUTES FOR HANDLING PRODUCTS
//* upload.array() method is handling the images upload by multer library
// For adding products
router
  .route("/dashboard/view-products-in-list/add-products")
  .get(sessionCheck.isAdminExist, adminControler.addProducts3Get)
  .post(
    upload.array("product_image", 10),
    adminValidate.addProductValidate,
    adminControler.addProducts3Post
  )

// For viewing products
router.get(
  "/dashboard/view-products-in-list",
  sessionCheck.isAdminExist,
  adminControler.viewProductList
)

//  Edit products
// * @param id is the parameter for the url (it is a product id)
router
  .route("/dashboard/view-product-list/edit-products-list/:id")
  .get(sessionCheck.isAdminExist, adminControler.editProductsListGet)
  .post(adminValidate.addProductValidate, adminControler.editProductsListPut)

// disable product in list view
router.post(
  "/dashboard/view-product-list/diable-and-enable-products",
  adminControler.disableAndEnableProduct
)

// Add offers for individual products
router
  .route("/dashboard/view-product-list/add-offers-for-products")
  .get(adminControler.addOffersProducts)
  .post(adminControler.addOffersProductsPost)

// Grid view for the product
router.get(
  "/dashboard/view-products-in-grid",
  sessionCheck.isAdminExist,
  adminControler.viewProductsGrid
)

//? ROUTED FOR HANDLING CATEGORIES AND SUB CATEGORIES
// Category management - Add categories
router
  .route("/dashboard/add-product-category")
  .get(sessionCheck.isAdminExist, adminControler.addCategoryGet)
  .post(adminControler.addCategoryPost)

// Category management - Edit categories
//* @param id is the parameter for this url (it is a category id)
router
  .route("/dashboard/add-product-category/edit-product-category/:id")
  .get(sessionCheck.isAdminExist, adminControler.editCategoryGet)
  .post(adminControler.editCategoryPut)

// Category management - Delete category
//* @params id is the parameter for this url (it is the category id)
router.get(
  "/dashboard/add-product-category/delete-product-category/:id",
  adminControler.deleteProductCategory
)

// Category management - Add subcategory
router
  .route("/dashboard/add-product-sub-category")
  .get(adminControler.addSubCategoryGet)
  .post(adminControler.addSubCategoryPost)

// Delete sub categories
router.get("/dashboard/delete-sub-category", adminControler.deleteSubCategory)

// Edit subcategory
router.post(
  "/dashboard/add-product-category/edit-sub-category",
  adminControler.editSubCategory
)

// Delete subcategory
//* @params id is the id for this url (it is the sub category id)
router.get(
  "/dashboard/add-product-category/delete-sub-category/:id",
  adminControler.deleteSubCategory
)

// Manage product variants
router.get("/add-product-variants", adminControler.addProductsVariants)

//? ROUTES FOR HANDLING ORDERS
// view and manage orders
router.get("/dashboard/admin-view-orders", adminControler.viewAllOrders)

// change status of ordered products
router.post("/change-product-status", adminControler.changeProductStatus)

// view orders more
//* @params id is the parameter for this url (it is order id)
router.get(
  "/dashboard/admin-view-orders/view-order-details/:id",
  adminControler.viewOrderDetails
)

// order return
router.get(
  "/dashboard/order-return",
  sessionCheck.isAdminExist,
  adminControler.orderReturn
)

//change return status
router.post("/change-return-status", adminControler.changeReturnStatus)

//sett pcickup date
router.post("/set-pick-up-date", adminControler.setPickUpDate)

// amount refund
router.post("/refund-amount", adminControler.refundAmount)

//? ROUTES FOR HANDLING USERS
// view Users
router.get(
  "/dashboard/view-users",
  sessionCheck.isAdminExist,
  adminControler.viewUsers
)

// Block users
router.post(
  "/dashboard/view-users/block-and-unblock-users",
  adminControler.blockAndUnblockUsers
)

// Blocked users
router.get(
  "/dashboard/blocked-users",
  sessionCheck.isAdminExist,
  adminControler.getBlockedUsers
)

//? ROUTES FOR HANDLING OFFRES
// offer management
router
  .route("/dashboard/add-offers-by-category")
  .get(sessionCheck.isAdminExist, adminControler.addOffersGet)
  .post(adminControler.addOffersPost)

//for viewing existing offers
router
  .route("/dashboard/view-offers")
  .get(sessionCheck.isAdminExist, adminControler.viewOffers)

router.post("/replace-offer", adminControler.replaceOfers)

//?ROUTES FOR COUPONS
router
  .route("/dashboard/add-coupon")
  .get(adminControler.addCouponTemplate)
  .post(upload.single("coupon-image"), adminControler.addCouponTemplatePost)

router.route("/dashboard/view-coupons").get(adminControler.viewCoupons)

//? ROUTE FOR CREATING PDF AND EXCEL
// create sales report
router.route("/dashboard/create-report").get(adminControler.makeReportGet).post(adminControler.makeReport)
router
  .route("/dashboard/filter-report")
  .post(adminControler.filterReportData)

//? Routes for fetching the data for graphs and charts
//! error warning (promise errors)
router.get(
  "/data-for-most-selling-product",
  sessionCheck.isAdminExist,
  adminControler.getChartData
)
router.get(
  "/data-for-other-graphs-and-chart",
  sessionCheck.isAdminExist,
  adminControler.getData
)

//? routers for showing the reviews
router.get(
  "/dashboard/user-reviews",
  sessionCheck.isAdminExist,
  adminControler.getUserReviews
)

//? ADMIN LOGOUT
//Logout admin
router.get("/logoutAdmin", adminControler.logoutAdmin)

export default router
