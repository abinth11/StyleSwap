const db = require('../config/connection')
const collection = require('../config/collections')
const objectId = require('mongodb').ObjectId
module.exports = {
  adminLogin: async (adminInfo) => {
    try {
      const response = {}
      const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminInfo.email })
      if (admin) {
        if (adminInfo.password === admin.password) {
          console.log('login successful')
          response.admin = admin
          response.status = true
          return response
        } else {
          console.log('login error')
          return { status: false }
        }
      } else {
        console.log('login failed')
        return { notExist: true }
      }
    } catch (error) {
      console.log('login error', error)
      throw new Error('Login failed')
    }
  },
  addProducts: async (product) => {
    const { productPrice, ...rest } = product
    const productData = { ...rest, product_price: parseInt(productPrice), offerPrice: parseInt(productPrice), isActive: true }
    try {
      const result = await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData)
      return { ...result, productData }
    } catch (error) {
      throw new Error('Failed to add product')
    }
  },
  viewProduct: async () => {
    try {
      const products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
      return products
    } catch (error) {
      throw new Error('Failed to retrieve products')
    }
  },
  getProductDetails: async (productId) => {
    try {
      const product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) })
      return product
    } catch (error) {
      throw new Error('Failed to retrieve product details')
    }
  },
  updateProductsList: async (productId, productDetails) => {
    productDetails.product_price = parseInt(productDetails.product_price)
    try {
      await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
        { _id: objectId(productId) },
        {
          $set: {
            ...productDetails
          }
        }
      )
      return
    } catch (error) {
      throw new Error('Failed to update product details')
    }
  },
  viewAllUser: async () => {
    try {
      const users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
      return users
    } catch (error) {
      throw new Error(error)
    }
  },
  blockUnblockUsers: async (userInfo) => {
    let { userId, currentStat } = userInfo
    try {
      if (currentStat === 'false') {
        currentStat = true
      } else {
        currentStat = false
      }
      // currentStat = currentStat === 'false' ? 'true' : 'false'
      await db.get().collection(collection.USER_COLLECTION).updateOne(
        { _id: objectId(userId) },
        { $set: { active: currentStat } }
      )
      return currentStat
    } catch (error) {
      throw new Error(error)
    }
  },
  blockedUsers: async () => {
    try {
      const blockedUsers = await db.get().collection(collection.USER_COLLECTION).find({ active: false }).toArray()
      return blockedUsers
    } catch (error) {
      throw new Error(error)
    }
  },
  addCategories: async (categoryInfo) => {
    const response = await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryInfo)
    return response
  },
  getAllCategories: async () => {
    try {
      const categories = await db.get().collection(collection.CATEGORY_COLLECTION).find({}).toArray()
      return categories
    } catch (error) {
      throw new Error(error)
    }
  },
  getCurrentCategory: async (catId) => {
    try {
      const category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(catId) })
      return category
    } catch (error) {
      throw new Error(error)
    }
  },
  updateCurrentCategory: async (catId, catData) => {
    try {
      const response = await db.get().collection(collection.CATEGORY_COLLECTION).updateOne(
        { _id: objectId(catId) },
        {
          $set: {
            product_name: catData.product_name,
            product_slug: catData.product_slug,
            product_parent: catData.product_parent,
            product_description: catData.product_description
          }
        }
      )
      return response
    } catch (error) {
      console.log(error)
      throw new Error('Error updating category')
    }
  },
  deleteProductCategory: async (catId) => {
    try {
      await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(catId) })
      return catId
    } catch (error) {
      throw new Error(error)
    }
  },
  disableEnableProduct: async (productId, isActive) => {
    try {
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
      return status
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getAllUserOrders: async () => {
    try {
      const orders = await db.get().collection(collection.ORDER_COLLECTION).find({}).toArray()
      return orders
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getCurrentOrderMore: async (orderId) => {
    try {
      const orders = db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectId(orderId) }).toArray()
      return orders
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getCurrentProducts: async (orderId) => {
    try {
      const order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
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
      return order
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
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
    const updatedOrders = orders.map(order => {
      const isoDate = order.date
      const date = new Date(isoDate)
      order.date = date.toLocaleString('en-US', options)
      return order
    })
    return updatedOrders
  },
  changeOrderStatus: async (orderInfo) => {
    try {
      const { orderId, newStatus } = orderInfo
      const order = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectId(orderId) }).toArray()
      const response = db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
        {
          $set: {
            status: newStatus
          }
        })
      if (response) {
        const now = new Date()
        const dateString = now.toDateString() // e.g. "Sun Mar 07 2023"
        const timeString = now.toLocaleTimeString() // e.g. "2:37:42 PM"
        const dateTimeString = `${timeString} ${dateString}` // e.g. "Sun Mar 07 2023 2:37:42 PM"
        const key = `${newStatus}`
        const status = { [key]: dateTimeString, orderId }
        if (order) {
          db.get().collection(collection.ORDER_SATUS).updateOne({ orderId }, {
            $set: {
              [key]: dateTimeString
            }
          }, { upsert: true })
        } else {
          db.get().collection(collection.ORDER_SATUS).insertOne({ status })
        }
        return response
      }
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getallUserAddress: async (orderId) => {
    try {
      const userDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
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
      return userDetails[0]
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getReturnedOrders: async () => {
    try {
      const returnedOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ returnReason: { $exists: true } }).toArray()
      return returnedOrders
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  changeReturnStatus: async (returnInfo) => {
    const { orderId } = returnInfo
    try {
      const response = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
        {
          $set: {
            returnStatus: returnInfo.newStatus
          }
        })
      return response
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  setPickUpDate: async (pickupInfo) => {
    try {
      const response = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(pickupInfo.orderId) }, {
        $set: {
          pickupDate: pickupInfo.pickupdate
        }
      }, { upsert: true })
      return response
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  addOffer: async (offerInfo) => {
    try {
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
                { $subtract: ['$product_price', '$offerPrice'] },
                100,
                { $divide: [1, '$product_price'] }
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
            offerPercentage: { $round: ['$offerPercentage', 2] }
          }
        }
      ]).toArray()
      if (offerExists.length) {
        return offerExists
      }
      const response = await db.get().collection(collection.PRODUCT_COLLECTION).updateMany(
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
      )
      return response
    } catch (err) {
      console.log(err)
      throw err
    }
  },
  replaceOfers: (replaceInfo) => {
    try {
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
      )
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  checkOfferExpiration: () => {
    try {
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
      )
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  addOfferToProducts: (offerInfo) => {
    try {
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
      )
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  calculateTotalRevenue: async () => {
    try {
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
      if (revenue.length) {
        return revenue[0]?.totalRevenue
      } else {
        return 0
      }
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  calculateTotalOrders: async () => {
    try {
      const orders = await db.get().collection(collection.ORDER_COLLECTION).countDocuments()
      return orders
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  calculateTotalNumberOfProducts: async () => {
    try {
      const products = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments()
      return products
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  calculateMonthlyEarnings: async () => {
    try {
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
      if (monthlyIncome.length) {
        return monthlyIncome[0]?.totalRevenue
      } else {
        return 0
      }
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  refundAmont: async (refundInfo) => {
    try {
      const userId = objectId(refundInfo.userId)
      const refundAmount = parseInt(refundInfo.amount)
      const orderId = refundInfo.orderId
      const result = await db.get().collection(collection.WALLET).updateOne(
        { userid: userId },
        {
          $inc: { balance: refundAmount },
          $push: {
            transactions: {
              $each: [{ orderId, amount: refundAmount, type: 'credited' }],
              $position: 0
            }
          }
        }
      )
      return result
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  updateRefundStatus: (orderId) => {
    try {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
        $set: {
          refundStatus: 'completed'
        }
      }, { upsert: true })
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
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
