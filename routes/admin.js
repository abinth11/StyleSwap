var express = require('express');
var router = express.Router();
let adminControler = require('../controlers/admin-controlers');
let adminValidate=require('../validation/adminValidation')
let multer = require('../middlewares/multer');
let sessionExists=require('../middlewares/session-checks')

/* GET users listing. */
router.get('/',sessionExists.adminCheck,adminControler.adminLoginGet)

//Admin Login post method
router.post('/adminLogin',adminValidate.adminLoginValidate,adminControler.adminLoginPost)

//Admin dashboard
router.get('/dashboard',adminControler.adminDashboard);

//Admin add product get and post methods
router.route('/addProduct1')
.get(adminControler.addProducts1Get)
.post(adminValidate.addProductValidate,multer.uploadImage.array('images',3),adminControler.addProducts1Post)

router.route('/addProduct2')
.get(adminControler.addProducts2Get)

//For adding products like clothes and shoes
router.route('/addProduct3')
.get(adminControler.addProducts3Get)
.post(adminValidate.addProductValidate,adminControler.addProducts3Post)

router.route('/addProduct4')
.get(adminControler.addProducts4Get)

//view products in list view 
router.get('/viewPoductsList',adminControler.viewProductList)

//edit products in list veiw
router.route('/editProductsList/:id')
.get(adminControler.editProductsListGet)
.post(adminValidate.addProductValidate,adminControler.editProductsListPut)

//disable product in list view
router.post('/diableAndEnableProduct',adminControler.disableAndEnableProduct)

//view products in grid
router.get('/viewProductsGrid',adminControler.viewProductsGrid);

//view products grid 2
router.get('/viewProductsGrid2',adminControler.viewProductsGrid2)

//view Users 
router.get('/viewUsers',adminControler.viewUsers)

//Block users
router.post('/bockAndUnblockUsers',adminControler.blockAndUnblockUsers)

//Blocked users
router.get('/blockedUsers',adminControler.getBlockedUsers)

//Category management add categories
router.route('/addProductCategory')
.get(adminControler.addCategoryGet)
.post(adminControler.addCategoryPost)


//Category management edit categories
router.route('/editProdutCategory/:id')
.get(adminControler.editCategoryGet)
.post(adminControler.editCategoryPut)

//Delete category
router.get('/deleteProductCategory/:id',adminControler.deleteProductCategory)

router.post('/checkBoxtest',(req,res)=>{
    console.log(req.body)
})

//Logout admin from the page
router.get('/logoutAdmin',adminControler.logoutAdmin)

// router.post('/uploadImages',multer.uploadImage.array('images',3),(req,res)=>{
//     res.status(500).json(error);
//     console.log("images uploaded")
// })



module.exports = router;
