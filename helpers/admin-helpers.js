let db = require('../config/connection');
let collection = require('../config/collections');
let objectId = require('mongodb').ObjectId
let multer = require('../middlewares/multer')

module.exports = {
    adminLogin: (adminInfo) => {
        // console.log(adminInfo.email)
        return new Promise((async (resolve, reject) => {
            let response = {}
            var admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminInfo.email })
            // console.log(admin)
            if (admin) {
                if (adminInfo.password == admin.password) {
                    console.log('login successfull')
                    response.admin = admin;
                    response.status = true;
                    resolve(response)

                }
                else {
                    console.log("login error");
                    resolve({ status: false });
                }

            }
            else {
                console.log("login failed");
                resolve({ notExist: true })
            }
        }))

    },
    addProducts: (product) => {
        // console.log(product);
        return new Promise((resolve, reject) => {
            product.isActive=true;
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
                resolve(data,product);
            })
        })
    },
    viewProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        })

    },
    getProductDetails: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProductsList: (productId, productDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(productId) }, {
                    $set: {
                        product_title: productDetails.product_title,
                        product_sku: productDetails.product_sku,
                        product_color:productDetails.product_color,
                        product_size:productDetails.product_size,
                        product_brand:productDetails.product_brand,
                        product_description:productDetails.product_description,
                        product_price:productDetails.product_price,
                        product_status:productDetails.product_status
                    }
                }).then(() => {
                    resolve();
                })
        })
    },
    viewAllUser: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(users);
        })
    },
    blockUnblockUsers: (userInfo) => {
        let {userId,currentStat}=userInfo;
        return new Promise(async (resolve, reject) => {
            if(currentStat=='false')
            {
                currentStat=true;
            }
            else{
                currentStat=false;
            }
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    active: currentStat
                }
            }).then(() => {
                resolve(userInfo.currentStat)
            })


        })

    },
    blockedUsers:()=>{
        return new Promise(async(resolve,reject)=>{
           let blockeduser=await db.get().collection(collection.USER_COLLECTION).find({active:false}).toArray();
           resolve(blockeduser)
        })

    },
    addCategories:(categoryInfo)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryInfo).then((response)=>{
            resolve(response);
        })
    })
    },
    getAllCategories:()=>{
        return new Promise(async(resolve,reject)=>{
           let categories=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
           resolve(categories);
        })
    },
    getCurrentCategory:(catId)=>{
        return new Promise(async(resolve,reject)=>{
        let category= await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)})
        resolve(category)
        })
    },
    updateCurrentCategory:(catId,catData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},
            {
                $set:{
                    product_name:catData.product_name,
                    product_slug:catData.product_slug,
                    product_parent:catData.product_parent,
                    product_description:catData.product_description

                }
            }).then((response)=>{
                resolve(response);
            })
        })

    },
    deleteProductCategory:(catId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(catId)})
            resolve(catId);
        })
    },
    disableEnableProduct:(productId,isActive)=>{
        // console.log(isActive,productId)
        return new Promise(async(resolve,reject)=>{
            // console.log(isActive)
            if(isActive=='false')
            {
                isActive=true;
            }
            else{
                isActive=false;
            }
            // console.log(isActive)
          let status =  await db.get().collection(collection.PRODUCT_COLLECTION).findOneAndUpdate({_id:objectId(productId)},{
                $set:{
                    isActive:isActive
                }
            });
            resolve(status);

        })    
    },
    // searchUsers:(name)=>{
    //     return new Promise((resolve,reject)=>{
    //         db.get().collection(collection.USER_COLLECTION).findOne({name:name}).then((data)=>{
    //             console.log(data);
    //             resolve(data);
    //         })
    //     })
    // }
}