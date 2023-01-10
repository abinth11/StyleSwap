let db = require('../config/connection');
let collection = require('../config/collections')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
let twilio = require('../middlewares/twilio')
// let objectId = require('mongodb').ObjectId
module.exports = {
    regisUserUser: (userData) => {
        // console.log(userData);
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
                    // console.log(data)
                    // console.log(userData)
                    // console.log("successfully registered the user...")
                    resolve({ status: true, userData })
                    // resolve(userData);
                })

            }
        })

    },
    loginUser: (userData) => {
        return new Promise(async (res, rej) => {
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData.mobile })
            if (!user.active) {
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
            console.log(product[0])
            resolve(product[0]);
        })

    }

}