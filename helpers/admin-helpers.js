let db = require('../config/connection');
let collection = require('../config/collections');
let objectId = require('mongodb').ObjectId
let multer = require('../middlewares/multer');
const { ORDER_COLLECTION } = require('../config/collections');
const { NewKeyInstance } = require('twilio/lib/rest/api/v2010/account/newKey');
module.exports = {
    adminLogin: (adminInfo) => {
        return new Promise((async (resolve, reject) => {
            let response = {}
            var admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminInfo.email })
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
        product.product_price = parseInt(product.product_price)
        return new Promise((resolve, reject) => {
            product.isActive = true;
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
                resolve(data, product);
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
            productDetails.product_price = parseInt(productDetails.product_price)
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(productId) }, {
                    $set: {
                        product_title: productDetails.product_title,
                        product_sku: productDetails.product_sku,
                        product_color: productDetails.product_color,
                        product_size: productDetails.product_size,
                        product_brand: productDetails.product_brand,
                        product_description: productDetails.product_description,
                        product_price: productDetails.product_price,
                        product_status: productDetails.product_status
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
        let { userId, currentStat } = userInfo;
        return new Promise(async (resolve, reject) => {
            if (currentStat == 'false') {
                currentStat = true;
            }
            else {
                currentStat = false;
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
    blockedUsers: () => {
        return new Promise(async (resolve, reject) => {
            let blockeduser = await db.get().collection(collection.USER_COLLECTION).find({ active: false }).toArray();
            resolve(blockeduser)
        })
    },
    addCategories: (categoryInfo) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryInfo).then((response) => {
                resolve(response);
            })
        })
    },
    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find({}).toArray();
            resolve(categories);
        })
    },
    getCurrentCategory: (catId) => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(catId) })
            resolve(category)
        })
    },
    updateCurrentCategory: (catId, catData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectId(catId) },
                {
                    $set: {
                        product_name: catData.product_name,
                        product_slug: catData.product_slug,
                        product_parent: catData.product_parent,
                        product_description: catData.product_description
                    }
                }).then((response) => {
                    resolve(response);
                })
        })
    },
    deleteProductCategory: (catId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(catId) })
            resolve(catId);
        })
    },
    disableEnableProduct: (productId, isActive) => {
        return new Promise(async (resolve, reject) => {
            if (isActive == 'false') {
                isActive = true;
            }
            else {
                isActive = false;
            }
            let status = await db.get().collection(collection.PRODUCT_COLLECTION).findOneAndUpdate({ _id: objectId(productId) }, {
                $set: {
                    isActive: isActive
                }
            });
            resolve(status);
        })
    },
    getAllUserOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = db.get().collection(collection.ORDER_COLLECTION).find({}).toArray();
            resolve(orders);
        })

    },

    ISO_to_Normal_Date: (orders) => {
        let options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
        };
        for (let i = 0; i < orders.length; i++) {
            let isoDate = orders[i].date
            let daTe = new Date(isoDate);
            orders[i].date = daTe.toLocaleString("en-US", options);
        }
        return orders;

    },
    changeOrderStatus: (orderInfo) => {
        return new Promise((resolve, reject) => {
            let { orderId, currentStatus, newStatus } = orderInfo;
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        status: newStatus
                    }
                }).then((response) => {
                    resolve(response);
                })
        })
    },
    getallUserDetails: () => {
        return new Promise(async (resolve, reject) => {
            let userDetails = db.get().collection(ORDER_COLLECTION).aggregate([
                {
                    "$match": {
                        "orderId": objectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    "$lookup": {
                        "from": collection.PRODUCT_COLLECTION,
                        "localField": "item",
                        "foreignField": "_id",
                        "as": "product"
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },

            ])
        })
    }
    // searchUsers:(name)=>{
    //     return new Promise((resolve,reject)=>{
    //         db.get().collection(collection.USER_COLLECTION).findOne({name:name}).then((data)=>{
    //             console.log(data);
    //             resolve(data);
    //         })
    //     })
    // }
}