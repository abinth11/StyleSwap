let db = require('../config/connection');
let collection = require('../config/collections')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
module.exports = {
    regisUserUser: (userData) => {
        userData.active = true;
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            let checkedEmail = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email });
            let phoneNumber = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData.mobile })
            if (checkedEmail) {
                resolve(checkedEmail)
            }
            else if (phoneNumber) {
                resolve(phoneNumber)
            }
            else {
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve({ status: true, userData })
                })
            }
        })
    },
    loginUser: (userData) => {
        return new Promise(async (res, rej) => {
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData.mobile })
            if (!user?.active) {
                response.block = true;
                res(response)
            }
            else if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login success")
                        response.user = user;
                        response.status = true;
                        res(response);
                    }
                    else {
                        console.log("login failed")
                        res({ incorrectPassword: "Wrong password" })
                    }
                })
            }
            else {
                console.log("login failed");
                res({ loginError: false });
            }
        })
    },
    loginWthOTP: (userData) => {
        return new Promise(async (res, rej) => {
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData.mobile })
            if (!user.active) {
                response.block = true;
                res(response)
            }
            else if (user) {
                response.user = user;
                response.status = true;
                res(response);
            }
            else {
                console.log("login failed");
                res({ loginError: false });
            }
        })
    },
    viewProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        })
    }
    ,
    viewCurrentProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: ObjectId(productId) }).toArray();
            // console.log(product[0])
            resolve(product[0]);
        })
    },
    getLoginedUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            resolve(user);
        })
    },
    editProfile: (userId, userData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) },
                {
                    $set: {
                        name: userData.name,
                        mobile: userData.mobile,
                        email: userData.email
                    }
                }).then((data) => {
                    resolve(data);
                })
        })
    },
    addNewAddress: (address) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).insertOne(address).then((data) => {
                resolve(data)
            })
        })
    },
    getUserAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let addresses = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: userId }).toArray();
            resolve(addresses);
        })
    },
    addressDelete: (addressId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ _id: ObjectId(addressId) })
            resolve();

        })
    },
    addToCart: (productId, userId) => {
        let product = {
            item: ObjectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ userId: ObjectId(userId) });
            console.log(userCart)
            console.log(ObjectId(productId))
            if (userCart) {
                console.log("user cart exist")
                let isProsuctExist = userCart?.products.findIndex(product => {
                    return product.item == productId
                })
                console.log(isProsuctExist);
                if (isProsuctExist != -1) {
                    console.log("product is already exist")
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ userId: ObjectId(userId), 'products.item': ObjectId(productId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then(() => {
                                resolve()
                            })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ userId: ObjectId(userId) }, {
                        $push: {
                            products: product
                        }
                    }).then((response) => {
                        console.log("updated user cart")
                        resolve(response);
                    })
                }
            }
            else {
                console.log("new cart created")
                let cart = {
                    userId: ObjectId(userId),
                    products: [product]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cart).then((response) => {
                    console.log("added product into the cart");
                    resolve(response);
                })
            }
        })
    },
    getcartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    "$match": {
                        "userId": ObjectId(userId)
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
                }
            ]
            ).toArray()
            resolve(cartItems);
        })
    },
    getCartProductsCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count;
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ userId: ObjectId(userId) })
            count = userCart?.products.length;
            resolve(count);
        })
    },
    changeCartQuantity: (productData) => {
        return new Promise((resolve, reject) => {
            let { cartId, productId, count, quantity } = productData
            count = parseInt(count);
            quantity = parseInt(quantity);
            if (count == -1 && quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId) },
                    {
                        $pull: { products: { item: ObjectId(productId) } }
                    }).then(() => {
                        resolve({ removed: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .findOneAndUpdate({ _id: ObjectId(cartId), 'products.item': ObjectId(productId) },
                        {
                            $inc: { 'products.$.quantity': count }
                        }).then((response) => {
                            resolve({ status: true })
                        })
            }
        })
    },
    removeCartProducts: (cartInfo) => {
        return new Promise((resolve, reject) => {
            let { cartId, productId } = cartInfo
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId) },
                {
                    $pull: { products: { item: ObjectId(productId) } }
                }).then(() => {
                    resolve({ removed: true })
                })
        })
    },
    findTotalAmout: (userId) => {
        return new Promise(async (resolve, reject) => {
            let totalAmout = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    "$match": {
                        "userId": ObjectId(userId)
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
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.product_price'] } }
                    }
                }
            ]
            ).toArray()
            resolve(totalAmout[0]);

        })
    },
    getAllProductsUserCart: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ userId: ObjectId(userId) })
            resolve(cart);

        })
    },
    placeOrders: (orderInfo, product, totalPrice) => {
        return new Promise((resolve, reject) => {
            console.log(orderInfo, product, totalPrice);
            let orderStatus = orderInfo.payment_method == 'cod' ? 'placed' : 'pending';
            let order = {
                userId: ObjectId(orderInfo.userId),
                name: orderInfo.name,
                mobile: orderInfo.mobile,
                deliveryAddressId: ObjectId(orderInfo.address),
                paymentMethod: orderInfo.payment_method,
                totalPrice: totalPrice?.total,
                orderStatus: orderStatus,
                status:"placed",
                date: new Date(),
                deliveryDetails: {
                    mobile_no: orderInfo.mobile_,

                },
                products: product?.products
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(order).then((resp) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ userId: ObjectId(orderInfo.userId) }).then((response) => {
                    resolve(response);
                })
            })
        })
    },
    getCurrentUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    "$match": {
                        "userId": ObjectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: '$status',
                        date: '$date',
                        totalPrice: '$totalPrice'
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
                        status: 1,
                        date: 1,
                        totalPrice: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
            ]).toArray();
            resolve(orders)
        })
    },
    getAllAddresses: (userId) => {
        // console.log(userId);
        return new Promise(async (resolve, reject) => {
            let addresses = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: userId }).toArray()
            resolve(addresses);
        })

    },
    cancellUserOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                $set: {
                    status: "cancelled"
                }
            }).then((response) => {
                resolve();

            })
        })
    },
    getUserDetails: (userId) => {
        return new Promise(async(resolve,reject)=>{
           let userInfo=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
           resolve(userInfo)
        })

    },
    updateUserDetails:(userInfo)=>{
        console.log(userInfo)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userInfo.userId)},{
                $set:{
                    name:userInfo.fname,
                    email:userInfo.email,
                    mobile:userInfo.mobile,
                }
            }).then((response)=>{
                resolve(response);
            })
        })
     
    },
    changeUserPassword: (userId, passwordInfo) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            let currentPassword= passwordInfo.password
            console.log(currentPassword)
            let newPassword = passwordInfo.npassword;
            let confirmPassword = passwordInfo.cpassword;
            let hashedNewPassword = await bcrypt.hash(passwordInfo.npassword, 10)
            console.log(user);
            if (user) {
                bcrypt.compare(currentPassword, user.password).then((status) => {
                    if(!status){
                        resolve({ invalidCurrentPassword: true })
                    }
                    if (newPassword != confirmPassword) {
                        resolve({ passwordMismatchnewAndConfirm: true })
                    }
                    else if (status) {
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                            $set: {
                                password: hashedNewPassword
                            }
                        }).then((response) => {
                            resolve(response)

                        })
                    }
                })
            } else {
                resolve({ passwordNotUpdated:true })
            }
        })
    }
}