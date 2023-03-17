const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const Razorpay = require('razorpay')
let sotoredAmount
module.exports = {
  regisUserUser: (userData) => {
    userData.active = true
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10)
      const checkedEmail = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
      const phoneNumber = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData.mobile })
      if (checkedEmail) {
        resolve(checkedEmail)
      } else if (phoneNumber) {
        resolve(phoneNumber)
      } else {
        db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
          resolve({ status: true, userData })
        })
      }
    })
  },
  loginUser: (userData) => {
    return new Promise(async (res, rej) => {
      const response = {}
      const user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData.mobile })
      if (!user?.active) {
        response.block = true
        res(response)
      } else if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log('login success')
            response.user = user
            response.status = true
            res(response)
          } else {
            console.log('login failed')
            res({ incorrectPassword: 'Wrong password' })
          }
        })
      } else {
        console.log('login failed')
        res({ loginError: false })
      }
    })
  },
  loginWthOTP: (userData) => {
    return new Promise(async (res, rej) => {
      const response = {}
      const user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData.mobile })
      if (!user.active) {
        response.block = true
        res(response)
      } else if (user) {
        response.user = user
        response.status = true
        res(response)
      } else {
        console.log('login failed')
        res({ loginError: false })
      }
    })
  },
  viewProduct: () => {
    return new Promise(async (resolve, reject) => {
      const products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
      resolve(products)
    })
  },
  viewCurrentProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      const product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: ObjectId(productId) }).toArray()
      // console.log(product[0])
      resolve(product[0])
    })
  },
  getLoginedUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
      resolve(user)
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
          resolve(data)
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
      const addresses = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId }).toArray()
      resolve(addresses)
    })
  },
  getCurrentAddress: (addressId) => {
    return new Promise(async (resolve, reject) => {
      const address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: ObjectId(addressId) })
      resolve(address)
    })
  },
  addressDelete: (addressId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ _id: ObjectId(addressId) })
      resolve()
    })
  },
  editAddress: (addressId, addressInfo) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ _id: ObjectId(addressId) }, {
        $set: {
          name: addressInfo.name,
          mobile: addressInfo.mobile,
          pincode: addressInfo.pincode,
          locality: addressInfo.locality,
          address: addressInfo.address,
          city: addressInfo.city,
          state: addressInfo.state,
          landmark: addressInfo.landmark,
          alternatePhone: addressInfo.alternatePhone
        }
      }).then((response) => {
        resolve(response)
      })
    })
  },
  addToCart: (productId, userId) => {
    const product = {
      item: ObjectId(productId),
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {
      const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ userId: ObjectId(userId) })
      console.log(userCart)
      console.log(ObjectId(productId))
      if (userCart) {
        console.log('user cart exist')
        const isProsuctExist = userCart?.products.findIndex(product => {
          return product.item == productId
        })
        console.log(isProsuctExist)
        if (isProsuctExist !== -1) {
          console.log('product is already exist')
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
            console.log('updated user cart')
            resolve(response)
          })
        }
      } else {
        console.log('new cart created')
        const cart = {
          userId: ObjectId(userId),
          products: [product]
        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cart).then((response) => {
          console.log('added product into the cart')
          resolve(response)
        })
      }
    })
  },
  // getcartProducts: (userId) => {
  //     return new Promise(async (resolve, reject) => {
  //         let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
  //             {
  //                 "$match": {
  //                     "userId": ObjectId(userId)
  //                 }
  //             },
  //             {
  //                 $unwind: '$products'
  //             },
  //             {
  //                 $project: {
  //                     item: '$products.item',
  //                     quantity: '$products.quantity'
  //                 }
  //             },
  //             {
  //                 "$lookup": {
  //                     "from": collection.PRODUCT_COLLECTION,
  //                     "localField": "item",
  //                     "foreignField": "_id",
  //                     "as": "product"
  //                 }
  //             },
  //             {
  //                 $project: {
  //                     item: 1,
  //                     quantity: 1,
  //                     product: { $arrayElemAt: ['$product', 0] }
  //                 }
  //             },

  //         ]
  //         ).toArray()
  //         resolve(cartItems);
  //     })
  // },
  getCartProductsCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ userId: ObjectId(userId) })
      const count = userCart?.products.length
      resolve(count)
    })
  },
  changeCartQuantity: (productData) => {
    return new Promise((resolve, reject) => {
      let { cartId, productId, count, quantity } = productData
      count = parseInt(count)
      quantity = parseInt(quantity)
      if (count === -1 && quantity === 1) {
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
      const { cartId, productId } = cartInfo
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
      const totalAmout = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: {
            userId: ObjectId(userId)
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
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
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
            offerTotal: {
              $sum: {
                $multiply: [
                  '$quantity',
                  {
                    $cond: {
                      if: { $gt: ['$product.offerPrice', 0] },
                      then: '$product.offerPrice',
                      else: '$product.product_price'
                    }
                  }
                ]
              }
            },
            total: {
              $sum: {
                $multiply: ['$quantity', '$product.product_price']
              }
            }
          }
        }
      ]
      ).toArray()
      // console.log(totalAmout)
      resolve(totalAmout[0])
    })
  },
  findSubTotal: (userId) => {
    return new Promise(async (resolve, reject) => {
      const subtotal = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: {
            userId: ObjectId(userId)
          }
        },
        {
          $unwind: '$products'
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'products.item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $project: {
            _id: '$product._id',
            name: '$product.product_title',
            subtotal: {
              $multiply: ['$products.quantity', '$product.product_price']
            }
          }
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            subtotal: {
              $sum: '$subtotal'
            }
          }
        }
      ]).toArray()
      resolve(subtotal)
    })
  },
  getcartProducts: (userId) => {
    return new Promise(async (resolve, rejcect) => {
      const cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { userId: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $lookup: {
            from: 'products',
            localField: 'products.item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $addFields: {
            offerSubtotal: {
              $cond: {
                if: { $ifNull: ['$product.offerPrice', false] },
                then: { $multiply: ['$product.offerPrice', '$products.quantity'] },
                else: { $multiply: ['$product.product_price', '$products.quantity'] }
              }
            }
          }
        },
        {
          $group: {
            _id: {
              cartId: '$_id',
              productId: '$product._id'
            },
            product_title: { $first: '$product.product_title' },
            product_price: { $first: '$product.product_price' },
            offerPrice: { $first: '$product.offerPrice' },
            quantity: { $sum: '$products.quantity' },
            subtotal: { $sum: { $multiply: ['$products.quantity', '$product.product_price'] } },
            offerSubtotal: { $sum: '$offerSubtotal' }
          }
        },
        {
          $group: {
            _id: '$_id.cartId',
            products: {
              $push: {
                product_id: '$_id.productId',
                product_title: '$product_title',
                product_price: '$product_price',
                offerPrice: '$offerPrice',
                quantity: '$quantity',
                subtotal: '$subtotal',
                offerSubtotal: '$offerSubtotal'
              }
            },
            total: { $sum: '$subtotal' },
            offerTotal: { $sum: '$offerSubtotal' }
          }
        },
        {
          $project: {
            _id: 1,
            products: 1,
            total: 1,
            offerTotal: 1
          }
        }
      ]).toArray()
      resolve(cartItems[0])
    })
  },
  getAllProductsUserCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      const cart = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { userId: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'products.item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: "$product"
        },
        {
          $project: {
            "_id": 0,
            "userId": 1,
            "products": {
              "item": "$products.item",
              "quantity": "$products.quantity",
              "offerPrice": {
                $ifNull: ["$product.offerPrice", "$product.price"]
              }
            }
          }
        },
        {
          $group: {
            "_id": "$userId",
            "products": {
              $push: "$products"
            }
          }
        }
      ]).toArray()
      // console.log(cart)
      // console.log(cart[0].products)
      resolve(cart)
    })
  },
  placeOrders: (orderInfo, products, totalPrice) => {
    return new Promise((resolve, reject) => {
      console.log(totalPrice)
      // console.log(products.products)
      const paymentStatus = orderInfo.payment_method === 'cod' ? 'done' : 'pending'
      const order = {
        userId: ObjectId(orderInfo.userId),
        name: orderInfo.name,
        mobile: orderInfo.mobile,
        deliveryAddressId: ObjectId(orderInfo.deliveryAddress),
        paymentMethod: orderInfo.payment_method,
        totalPrice: totalPrice.total,
        offerTotal: totalPrice.offerTotal,
        priceAfterDiscount: totalPrice.discountPrice,
        paymentStatus,
        status: 'placed',
        date: new Date(),
        deliveryDetails: {
          mobile_no: orderInfo.mobile_
        },
        products: products[0]?.products
      }
      db.get().collection(collection.ORDER_COLLECTION).insertOne(order).then((resp) => {
        db.get().collection(collection.CART_COLLECTION).deleteOne({ userId: ObjectId(orderInfo.userId) }).then((response) => {
          resolve(resp)
        })
      })
    })
  },
  createStatusCollection: (orderId) => {
    return new Promise((resolve, reject) => {
      const key = 'placed'
      const now = new Date()
      const dateString = now.toDateString() // e.g. "Sun Mar 07 2023"
      const status = { [key]: dateString, orderId }
      db.get().collection(collection.ORDER_SATUS).insertOne(status).then((reponse) => {
        // console.log(response)
        resolve(reponse)
      })
    })
  },
  getRazorpay: (orderId, totalAmout) => {
    // totalAmout = parseInt(totalAmout)
    console.log(totalAmout)
    return new Promise((resolve, reject) => {
      const razorpay = new Razorpay({
        key_id: 'rzp_test_ltAM3hZSUBfLfx',
        key_secret: 'gvv1U5AQUyqTxHzkwWIt8M7x'
      })
      const options = {
        amount: totalAmout * 100, // amount in paise
        currency: 'INR',
        receipt: '' + orderId,
        payment_capture: 1
      }

      razorpay.orders.create(options, function (err, order) {
        if (err) {
          console.log(err)
        } else {
          console.log(order)
          resolve(order)
        }
      })
    })
  },
  verifyRazorpayPayments: (paymentInfo) => {
    return new Promise((resolve, reject) => {
      const crypto = require('crypto')
      let hmac = crypto.createHmac('sha256', 'gvv1U5AQUyqTxHzkwWIt8M7x')
      hmac.update(paymentInfo['order[razorpay_order_id]'] + '|' + paymentInfo['order[razorpay_payment_id]'])
      hmac = hmac.digest('hex')
      if (hmac === paymentInfo['order[razorpay_signature]']) {
        resolve({ status: true })
      } else {
        reject(new Error('Payment failed'))
      }
    })
  },
  getPaypal: (orderId, totalAmout) => {
    console.log(totalAmout)
    if (!sotoredAmount) {
      sotoredAmount = totalAmout
    }
    console.log(sotoredAmount)
    return new Promise((resolve, reject) => {
      const paypal = require('paypal-rest-sdk')
      paypal.configure({
        mode: 'sandbox', // sandbox or live
        client_id: 'AZbtScy5kHVy2okDeiOijRVYzqnbrZxhWn_cz9tzKWyxpHmrwV-Qza41PSQ86MNy3azk8n4bDFCofo4t',
        client_secret: 'EIK1cBzckhi8oSS5ZqyhjkYExGq5nbcwPQD-zB3u2QefLmoOu9Q4qVwBqItgOaJ4IHuhuKuybsaIlIKX'
      })
      const createPaymentJson = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        redirect_urls: {
          return_url: 'http://localhost:3000/view-orders',
          cancel_url: 'http://localhost:3000/proceed-to-checkout'
        },
        transactions: [{
          item_list: {
            items: [{
              name: 'item',
              sku: 'item',
              price: sotoredAmount,
              currency: 'USD',
              quantity: 1
            }]
          },
          amount: {
            currency: 'USD',
            total: sotoredAmount
          },
          description: 'This is the payment description.'
        }]
      }
      paypal.payment.create(createPaymentJson, function (error, payment) {
        if (error) {
          console.log(error)
        } else {
          console.log(payment)
          const paypalResponse = { paypal: true }
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              const redirectUrl = payment.links[i].href
              paypalResponse.reUrl = redirectUrl
              resolve(paypalResponse)
            }
          }
        }
      })
    })
  },
  verifyPaypal: () => {
    return new Promise((resolve, reject) => {
      const paypal = require('paypal-rest-sdk')
      const executePaymentJson = {
        payer_id: 'Appended to redirect url',
        transactions: [{
          amount: {
            currency: 'INR',
            total: '1'
          }
        }]
      }
      const paymentId = 'PAYMENT id created in previous step'
      paypal.payment.execute(paymentId, executePaymentJson, function (error, payment) {
        if (error) {
          console.log(error.response)
          throw error
        } else {
          console.log('Get Payment Response')
          console.log(JSON.stringify(payment))
          resolve(payment)
        }
      })
    })
  },
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
        $set: {
          paymentStatus: 'done'
        }
      }).then(() => {
        resolve()
      })
    })
  },
  getCurrentUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      const orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            userId: ObjectId(userId)
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
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
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
        }
      ]).toArray()
      resolve(orders)
    })
  },
  getAllAddresses: (userId) => {
    // console.log(userId);
    return new Promise(async (resolve, reject) => {
      const addresses = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId }).toArray()
      resolve(addresses)
    })
  },
  cancellUserOrder: (orderId, reason) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
        $set: {
          status: 'cancelled',
          reasonTocancell: reason
        }
      }, { upsert: true }).then((response) => {
        resolve()
      })
    })
  },
  getUserDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      const userInfo = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
      resolve(userInfo)
    })
  },
  updateUserDetails: (userInfo) => {
    console.log(userInfo)
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userInfo.userId) }, {
        $set: {
          name: userInfo.fname,
          email: userInfo.email,
          mobile: userInfo.mobile
        }
      }).then((response) => {
        resolve(response)
      })
    })
  },
  changeUserPassword: (userId, passwordInfo) => {
    return new Promise(async (resolve, reject) => {
      const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
      const currentPassword = passwordInfo.password
      console.log(currentPassword)
      const newPassword = passwordInfo.npassword
      const confirmPassword = passwordInfo.cpassword
      const hashedNewPassword = await bcrypt.hash(passwordInfo.npassword, 10)
      console.log(user)
      if (user) {
        bcrypt.compare(currentPassword, user.password).then((status) => {
          if (!status) {
            resolve({ invalidCurrentPassword: true })
          }
          if (newPassword !== confirmPassword) {
            resolve({ passwordMismatchnewAndConfirm: true })
          } else if (status) {
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
        resolve({ passwordNotUpdated: true })
      }
    })
  },
  getOrderStatus: (orderId) => {
    // console.log(orderId)
    return new Promise(async (resolve, reject) => {
      const orders = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: ObjectId(orderId) }).toArray()
      // console.log(orders)
      resolve(orders[0])
    })
  },
  getStatusDates: (orderId) => {
    return new Promise(async (resolve, reject) => {
      const dates = await db.get().collection(collection.ORDER_SATUS).findOne({ orderId: orderId })
      resolve(dates)
    })
  },
  getAddressforTrackingPage: (orderId) => {
    console.log(orderId)
    return new Promise(async (resolve, reject) => {
      const deliveryAddress = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            _id: ObjectId(orderId)
          }
        },
        {
          $lookup: {
            from: collection.ADDRESS_COLLECTION,
            localField: 'deliveryAddressId',
            foreignField: '_id',
            as: 'address'
          }
        }
        // {
        //   $unwind: '$address'
        // },
        // {
        //   $project: {
        //     name: 1,
        //     mobile: 1,
        //     address: {
        //       $concat: [
        //         '$address.address',
        //         ', ',
        //         '$address.locality',
        //         ', ',
        //         '$address.city',
        //         ', ',
        //         '$address.state',
        //         ', ',
        //         '$address.pincode'
        //       ]
        //     }
        //   }
        // }
      ]).toArray()
      console.log(deliveryAddress)
    })
  },
  getOrdersProfile: async (orderId) => {
    const orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: ObjectId(orderId) }).toArray()
    return orders
  },
  getProductsWithSameId: (orderId) => {
    return new Promise(async (resolve, reject) => {
      const products = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            _id: ObjectId(orderId)
          }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            proId: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'proId',
            foreignField: '_id',
            as: 'products'
          }
        },
        {
          $project: {
            proId: 1,
            quantity: 1,
            products: { $arrayElemAt: ['$products', 0] }
          }
        }
      ]).toArray()
      resolve(products)
    })
  },
  returnProduct: async (returnInfo) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(returnInfo.orderId) }, {
        $set: {
          returnReason: returnInfo.reason,
          returnStatus: 'pending'
        }
      }, { upsert: true }).then((response) => {
        resolve(response)
      })
    })
  },
  createWallet: (userInfo, userId) => {
    const now = new Date()
    const currentDateTime = now.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
    const wallet = {}
    wallet.userid = userId._id
    wallet.name = userInfo.name
    wallet.email = userInfo.email
    wallet.mobile = userInfo.mobile
    wallet.active = userInfo.active
    wallet.balance = 0
    wallet.transactions = []
    wallet.createdAt = currentDateTime
    wallet.updatedAt = currentDateTime
    db.get().collection(collection.WALLET).insertOne(wallet)
  },
  getWalletData: async (userId) => {
    const wallet = await db.get().collection(collection.WALLET).findOne({ userid: ObjectId(userId) })
    return wallet
  },
  getUserWallet: async (orderId, total, userId) => {
    console.log(orderId, userId)
    console.log(total)
    const walletCollection = await db.get().collection(collection.WALLET)
    const ordersCollection = await db.get().collection(collection.ORDER_COLLECTION)
    const balance = await walletCollection.findOne({ userid: ObjectId(userId) }, { balance: 1 })
    if (balance && balance.balance >= total) {
      const paymentStatusUpdated = await ordersCollection.updateOne({ _id: ObjectId(orderId) }, { $set: { paymentStatus: 'done' } })
      if (paymentStatusUpdated.modifiedCount === 1) {
        const updatedBalance = balance.balance - total
        await walletCollection.updateOne({ userid: ObjectId(userId) }, { $set: { balance: updatedBalance, type: 'debited' } })
        return updatedBalance
      }
    }
    console.log(balance)
    return null
  }
}
