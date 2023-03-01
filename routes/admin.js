var express = require('express');
var router = express.Router();
let adminControler = require('../controlers/admin-controlers');
let adminValidate = require('../validation/adminValidation')
let {upload} = require('../middlewares/multer');
let sessionCheck = require('../middlewares/session-checks')
/* GET users listing. */
router.get('/', adminControler.adminLoginGet)

//Admin Login post method
router.post('/adminLogin', adminValidate.adminLoginValidate, adminControler.adminLoginPost)

//Admin dashboard
router.get('/dashboard', sessionCheck.isAdminExist, adminControler.adminDashboard);

// Admin add product get and post methods
router.route('/addProduct1')
    .get(sessionCheck.isAdminExist, adminControler.addProducts1Get)
    .post(upload.single('product_image'),adminControler.addProducts1Post)

router.get('/addProduct1',sessionCheck.isAdminExist,adminControler.addProducts1Get)

// const upload = multer({ dest: 'uploads/' });

// router.post('/add-product-1', upload.single('image'), (req, res) => {
//   console.log(req.body);
//   console.log(req.file);
//   console.log('llllllllllllllllll');
//   res.send('File uploaded!');
// });

router.route('/addProduct2')
    .get(sessionCheck.isAdminExist, adminControler.addProducts2Get)

//For adding products like clothes and shoes
router.route('/addProduct3')
    .get(sessionCheck.isAdminExist, adminControler.addProducts3Get)
    .post(adminValidate.addProductValidate, adminControler.addProducts3Post)

router.route('/addProduct4')
    .get(sessionCheck.isAdminExist, adminControler.addProducts4Get)

//view products in list view 
router.get('/viewPoductsList', sessionCheck.isAdminExist, adminControler.viewProductList)

//edit products in list veiw
router.route('/editProductsList/:id')
    .get(sessionCheck.isAdminExist, adminControler.editProductsListGet)
    .post(adminValidate.addProductValidate, adminControler.editProductsListPut)

//disable product in list view
router.post('/diableAndEnableProduct', adminControler.disableAndEnableProduct)

//view products in grid
router.get('/viewProductsGrid', sessionCheck.isAdminExist, adminControler.viewProductsGrid);

//view products grid 2
router.get('/viewProductsGrid2', sessionCheck.isAdminExist, adminControler.viewProductsGrid2)

//view Users 
router.get('/viewUsers', sessionCheck.isAdminExist, adminControler.viewUsers)

//Block users
router.post('/bockAndUnblockUsers', adminControler.blockAndUnblockUsers)

//Blocked users
router.get('/blockedUsers', sessionCheck.isAdminExist, adminControler.getBlockedUsers)

//Category management add categories 
router.route('/addProductCategory')
    .get(sessionCheck.isAdminExist, adminControler.addCategoryGet)
    .post(adminControler.addCategoryPost)


//Category management edit categories
router.route('/editProdutCategory/:id')
    .get(sessionCheck.isAdminExist, adminControler.editCategoryGet)
    .post(adminControler.editCategoryPut)

//Delete category
router.get('/deleteProductCategory/:id', adminControler.deleteProductCategory)

//view and manage orders
router.get('/admin-view-orders', adminControler.viewAllOrders)

// view orders more
router.get('/view-order-details/:id',adminControler.viewOrderDetails)

//change status of ordered products
router.post('/change-product-status', adminControler.changeProductStatus);

router.post('/checkBoxtest', (req, res) => {
    console.log(req.body)
})

//Logout admin 
router.get('/logoutAdmin', adminControler.logoutAdmin)

// router.post('/uploadImages',multer.uploadImage.array('images',3),(req,res)=>{
//     res.status(500).json(error);
//     console.log("images uploaded")
// })



module.exports = router;
