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
      const order = await db.get().collection(collection.ORDER_COLLECTION).find({_id: objectId(orderId) }).toArray();
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
