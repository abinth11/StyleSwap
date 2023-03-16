const db = require('../config/connection')
const collection = require('../config/collections')
const objectId = require('mongodb').ObjectId
const { ORDER_COLLECTION } = require('../config/collections')
const { response } = require('express')
module.exports = {
  adminLogin: (adminInfo) => {
    return new Promise(async (resolve, reject) => {
      const response = {}
      const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminInfo.email })
      if (admin) {
        if (adminInfo.password === admin.password) {
          console.log('login successfull')
          response.admin = admin
          response.status = true
          resolve(response)
        } else {
          console.log('login error')
          resolve({ status: false })
        }
      } else {
        console.log('login failed')
        resolve({ notExist: true })
      }
    })
  },
  addProducts: (product) => {
    product.product_price = parseInt(product.product_price)
    product.offerPrice = parseInt(product.product_price)
    return new Promise((resolve, reject) => {
      product.isActive = true
      db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
        resolve(data, product)
      })
    })
  },
  viewProduct: () => {
    return new Promise(async (resolve, reject) => {
      const products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
      resolve(products)
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
          resolve()
        })
    })
  },
  viewAllUser: () => {
    return new Promise(async (resolve, reject) => {
      const users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
      resolve(users)
    })
  },
  blockUnblockUsers: (userInfo) => {
    let { userId, currentStat } = userInfo
    return new Promise(async (resolve, reject) => {
      if (currentStat === 'false') {
        currentStat = true
      } else {
        currentStat = false
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
      const blockeduser = await db.get().collection(collection.USER_COLLECTION).find({ active: false }).toArray()
      resolve(blockeduser)
    })
  },
  addCategories: (categoryInfo) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryInfo).then((response) => {
        resolve(response)
      })
    })
  },
  getAllCategories: () => {
    return new Promise(async (resolve, reject) => {
      const categories = await db.get().collection(collection.CATEGORY_COLLECTION).find({}).toArray()
      resolve(categories)
    })
  },
  getCurrentCategory: (catId) => {
    return new Promise(async (resolve, reject) => {
      const category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(catId) })
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
          resolve(response)
        })
    })
  },
  deleteProductCategory: (catId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(catId) })
      resolve(catId)
    })
  },
  disableEnableProduct: (productId, isActive) => {
    return new Promise(async (resolve, reject) => {
      if (isActive === 'false') {
        isActive = true
      } else {
        isActive = false
      }
      const status = await db.get().collection(collection.PRODUCT_COLLECTION).findOneAndUpdate({ _id: objectId(productId) }, {
        $set: {
          isActive
        }
      })
      resolve(status)
    })
  },
  getAllUserOrders: () => {
    return new Promise(async (resolve, reject) => {
      const orders = db.get().collection(collection.ORDER_COLLECTION).find({}).toArray()
      resolve(orders)
    })
  },
  getCurrentOrderMore: (orderId) => {
    return new Promise(async (resolve, reject) => {
      const orders = db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectId(orderId) }).toArray()
      resolve(orders)
    })
  },
  getCurrentProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      const order = await db.get().collection(ORDER_COLLECTION).aggregate([
        {
          $match: {
            _id: objectId(orderId)
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
        }
      ]).toArray()
      resolve(order)
    })
  },
  ISO_to_Normal_Date: (orders) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    }
    for (let i = 0; i < orders.length; i++) {
      const isoDate = orders[i].date
      const daTe = new Date(isoDate)
      orders[i].date = daTe.toLocaleString('en-US', options)
    }
    return orders
  },
  changeOrderStatus: (orderInfo) => {
    return new Promise(async (resolve, reject) => {
      const { orderId, currentStatus, newStatus } = orderInfo
      const order = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectId(orderId) }).toArray();
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
        {
          $set: {
            status: newStatus
          }
        }).then((response) => {
          const now = new Date()
          const dateString = now.toDateString() // e.g. "Sun Mar 07 2023"
          const timeString = now.toLocaleTimeString() // e.g. "2:37:42 PM"
          const dateTimeString = `${timeString} ${dateString}` // e.g. "Sun Mar 07 2023 2:37:42 PM"
          const key = `${newStatus}`
          const status = { [key]: dateTimeString, orderId }
          if (order) {
            db.get().collection(collection.ORDER_SATUS).updateOne({ orderId: orderId }, {
              $set: {
                [key]: dateTimeString
              }
            }, { upsert: true })
          } else {
            db.get().collection(collection.ORDER_SATUS).insertOne({ status })
          }
          resolve(response)
        })
    })
  },
  getallUserAddress: (orderId) => {
    return new Promise(async (resolve, reject) => {
      const userDetails = await db.get().collection(ORDER_COLLECTION).aggregate([
        {
          $match: {
            _id: objectId(orderId)
          }
        },
        {
          $project: {
            addressId: '$deliveryAddressId'
          }
        },
        {
          $lookup: {
            from: collection.ADDRESS_COLLECTION,
            localField: 'addressId',
            foreignField: '_id',
            as: 'address'
          }
        },
        {
          $project: {
            address: { $arrayElemAt: ['$address', 0] }
          }
        }
      ]).toArray()
      resolve(userDetails[0])
      // console.log(userDetails)
    })
  },
  getReturnedOrders: () => {
    return new Promise(async (resolve, reject) => {
      const returnedOrders = db.get().collection(collection.ORDER_COLLECTION).find({ returnReason: { $exists: true } }).toArray()
      resolve(returnedOrders)
    })
  },
  changeReturnStatus: (returnInfo) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(returnInfo.orderId) },
        {
          $set: {
            returnStatus: returnInfo.newStatus
          }
        }).then((response) => {
          resolve(response)
        })
    })
  },
  setPickUpDate: (pickupInfo) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(pickupInfo.orderId) }, {
        $set: {
          pickupDate: pickupInfo.pickupdate
        }
      }, { upsert: true })
      resolve(response)
    })
  },
  addOffer: (offerInfo) => {
    return new Promise(async (resolve, reject) => {
      const offerExists = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
        {
          $match: { offerEndDate: { $exists: true }, product_category: offerInfo.category }
        },
        {
          $project: {
            _id: 1,
            product_price: 1,
            offerPrice: 1,
            offerEndDate: 1,
            offerStartDate: 1,
            product_category: 1,
            offerPercentage: {
              $multiply: [
                { $subtract: ["$product_price", "$offerPrice"] },
                100,
                { $divide: [1, "$product_price"] }
              ]
            }
          }
        },
        {
          $project: {
            _id: 1,
            product_price: 1,
            offerPrice: 1,
            offerEndDate: 1,
            offerStartDate: 1,
            product_category: 1,
            offerPercentage: { $round: ["$offerPercentage", 2] }
          }
        }
      ]).toArray()
      if (offerExists.length) {
        resolve(offerExists)
      } else {
        db.get().collection(collection.PRODUCT_COLLECTION).updateMany(
          { product_category: offerInfo.category },
          [
            {
              $addFields: {
                offerPrice: {
                  $subtract: [
                    '$product_price',
                    { $multiply: ['$product_price', offerInfo.offer_percentage / 100] }
                  ]
                }
              }
            },
            {
              $set: {
                offerPrice: '$offerPrice',
                offerEndDate: offerInfo.end_date,
                offerStartDate: offerInfo.start_date
              }
            }
          ]
        ).then((response) => {
          resolve(response)
        })
      }
    })
  },
  replaceOfers: (replaceInfo) => {
    console.log(replaceInfo)
    const offerPercentage = parseInt(replaceInfo.offer_percentage)
    db.get().collection(collection.PRODUCT_COLLECTION).updateMany(
      { product_category: replaceInfo.category },
      [
        {
          $addFields: {
            offerPrice: {
              $subtract: [
                '$product_price',
                { $multiply: ['$product_price', offerPercentage / 100] }
              ]
            }
          }
        },
        {
          $set: {
            offerPrice: '$offerPrice',
            offerEndDate: replaceInfo.end_date,
            offerStartDate: replaceInfo.start_date
          }
        }
      ]
    ).then((response) => {
      console.log(response)
    })
  },
  checkOfferExpiration: () => {
    const moment = require('moment')
    // Calculate the date when the offer ends
    const offerEndDate = moment().subtract(1, 'days').toDate()
    // Convert offerEndDate to a string in the format 'YYYY-MM-DD'
    const isoOfferEndDate = moment(offerEndDate).format('YYYY-MM-DD')
    // Update the documents whose offer_end_date is in the past
    db.get().collection(collection.PRODUCT_COLLECTION).updateMany(
      {
        offerEndDate: { $lt: isoOfferEndDate }
      },
      {
        $unset: { offerEndDate: 1 },
        $set: {
          offerPrice: null
        }
      }
    ).then((response) => {
      console.log(response)
    })
  },
  addOfferToProducts: (offerInfo) => {
    const productPrice = parseInt(offerInfo.product_price)
    const offerPercentage = parseInt(offerInfo.offer_percentage)
    db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
      { _id: objectId(offerInfo.productId) },
      {
        $set: {
          offerPrice: productPrice - (productPrice * (offerPercentage / 100)),
          offerEndDate: offerInfo.end_date
        }
      }
    ).then((response) => {
      console.log(response)
    })
  },
  calculateTotalRevenue: async () => {
    const revenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $match: {
          status: 'completed',
          returnReason: { $exists: false }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$offerTotal' }
        }
      }
    ]).toArray()
    return revenue[0].totalRevenue
  },
  calculateTotalOrders: async () => {
    const orders = await db.get().collection(collection.ORDER_COLLECTION).countDocuments()
    return orders
  },
  calculateTotalNumberOfProducts: async () => {
    const products = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments()
    return products
  },
  calculateMonthlyEarnings: async () => {
    const monthlyIncome = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $match: {
          status: 'completed',
          returnReason: { $exists: false },
          date: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: '$offerTotal' }
        }
      }
    ]).toArray()
    console.log(monthlyIncome)
    return monthlyIncome[0].monthlyRevenue
  },
  refundAmont: async (refundInfo) => {
    console.log(refundInfo)
    const userId = objectId(refundInfo.userId)
    const refundAmount = parseInt(refundInfo.amount)
    const orderId = refundInfo.orderId
    const result = await db.get().collection(collection.WALLET).updateOne(
      { userid: userId },
      {
        $inc: { balance: refundAmount },
        $push: {
          transactions: {
            $each: [{ orderId, amount: refundAmount }],
            $position: 0
          }
        }
      }
    )
    return result
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
