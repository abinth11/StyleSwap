import db from "../config/connection.js"
import collection from "../config/collections.js"
import { ObjectId as objectId } from "mongodb"
import moment from "moment"
import { TodayInstance } from "twilio/lib/rest/api/v2010/account/usage/record/today.js"
const adminHelpers = {
  adminLogin: async (adminInfo) => {
    try {
      const response = {}
      const admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ email: adminInfo.email })
      if (admin) {
        if (adminInfo.password === admin.password) {
          console.log("login successful")
          response.admin = admin
          response.status = true
          return response
        } else {
          console.log("login error")
          return { status: false }
        }
      } else {
        console.log("login failed")
        return { notExist: true }
      }
    } catch (error) {
      console.log("login error", error)
      throw new Error("Login failed")
    }
  },
  addProducts: async (product, urls) => {
    console.log(urls)
    const { product_price: productPrice, ...rest } = product
    const productData = {
      ...rest,
      product_price: parseInt(productPrice),
      offerPrice: parseInt(productPrice),
      addedAt: Date.now(),
      isActive: true,
      images: {
        image1: urls[0],
        image2: urls[1],
        images3: urls[2],
      },
    }
    try {
      const result = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .insertOne(productData)
      return { ...result, productData }
    } catch (error) {
      throw new Error("Failed to add product")
    }
  },
  viewProduct: async () => {
    try {
      const products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray()
      return products
    } catch (error) {
      throw new Error("Failed to retrieve products")
    }
  },
  getProductDetails: async (productId) => {
    try {
      const product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(productId) })
      return product
    } catch (error) {
      throw new Error("Failed to retrieve product details")
    }
  },
  updateProductsList: async (productId, productDetails) => {
    productDetails.product_price = parseInt(productDetails.product_price)
    try {
      await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(productId) },
          {
            $set: {
              ...productDetails,
            },
          }
        )
      return
    } catch (error) {
      throw new Error("Failed to update product details")
    }
  },
  viewAllUser: async () => {
    try {
      const users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray()
      return users
    } catch (error) {
      throw new Error(error)
    }
  },
  blockUnblockUsers: async (userInfo) => {
    let { userId, currentStat } = userInfo
    try {
      if (currentStat === "false") {
        currentStat = true
      } else {
        currentStat = false
      }
      // currentStat = currentStat === 'false' ? 'true' : 'false'
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
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
      const blockedUsers = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find({ active: false })
        .toArray()
      return blockedUsers
    } catch (error) {
      throw new Error(error)
    }
  },
  addCategories: async (categoryInfo) => {
    const response = await db
      .get()
      .collection(collection.CATEGORY_COLLECTION)
      .insertOne(categoryInfo)
    return response
  },
  getAllCategories: async () => {
    try {
      const categories = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find({})
        .toArray()
      return categories
    } catch (error) {
      throw new Error(error)
    }
  },
  getCurrentCategory: async (catId) => {
    try {
      const category = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: objectId(catId) })
      return category
    } catch (error) {
      throw new Error(error)
    }
  },
  updateCurrentCategory: async (catId, catData) => {
    try {
      const response = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { _id: objectId(catId) },
          {
            $set: {
              product_name: catData.product_name,
              product_slug: catData.product_slug,
              product_parent: catData.product_parent,
              product_description: catData.product_description,
            },
          }
        )
      return response
    } catch (error) {
      console.log(error)
      throw new Error("Error updating category")
    }
  },
  deleteProductCategory: async (catId) => {
    try {
      await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: objectId(catId) })
      return catId
    } catch (error) {
      throw new Error(error)
    }
  },
  disableEnableProduct: async (productId, isActive) => {
    try {
      if (isActive === "false") {
        isActive = true
      } else {
        isActive = false
      }
      const status = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOneAndUpdate(
          { _id: objectId(productId) },
          {
            $set: {
              isActive,
            },
          }
        )
      return status
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getAllUserOrders: async () => {
    try {
      const orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({})
        .sort([("date", 1)])
        .toArray()
      return orders
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getCurrentProducts: async (orderId) => {
    try {
      const order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: objectId(orderId),
            },
          },
          {
            $addFields: {
              deliveryAddressId: { $toObjectId: "$deliveryAddressId" },
            },
          },
          {
            $lookup: {
              from: collection.ADDRESS_COLLECTION,
              localField: "deliveryAddressId",
              foreignField: "_id",
              as: "deliveryAddress",
            },
          },
          {
            $addFields: {
              deliveryDetails: {
                $mergeObjects: {
                  $arrayElemAt: ["$deliveryAddress", 0],
                },
              },
            },
          },
          {
            $project: {
              deliveryAddress: 0,
            },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products.item",
              foreignField: "_id",
              as: "products.item",
            },
          },
          {
            $addFields: {
              "products.item": {
                $arrayElemAt: ["$products.item", 0],
              },
            },
          },
          {
            $group: {
              _id: "$_id",
              userId: { $first: "$userId" },
              name: { $first: "$name" },
              mobile: { $first: "$mobile" },
              deliveryAddressId: { $first: "$deliveryAddressId" },
              paymentMethod: { $first: "$paymentMethod" },
              totalPrice: { $first: "$totalPrice" },
              offerTotal: { $first: "$offerTotal" },
              priceAfterDiscount: { $first: "$priceAfterDiscount" },
              paymentStatus: { $first: "$paymentStatus" },
              status: { $first: "$status" },
              date: { $first: "$date" },
              deliveryDetails: { $first: "$deliveryDetails" },
              reasonTocancell: { $first: "$reasonTocancell" },
              returnReason: { $first: "$returnReason" },
              returnStatus: { $first: "$returnStatus" },
              refundStatus: { $first: "$refundStatus" },
              products: { $push: "$products" },
            },
          },
        ])
        .toArray()
      return order[0]
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  ISO_to_Normal_Date: (orders) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    }
    const updatedOrders = orders.map((order) => {
      const isoDate = order.date
      const date = new Date(isoDate)
      order.date = date.toLocaleString("en-US", options)
      return order
    })
    return updatedOrders
  },
  changeOrderStatus: async (orderInfo) => {
    try {
      const { orderId, newStatus } = orderInfo
      const order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ _id: objectId(orderId) })
        .toArray()
      const response = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: newStatus,
            },
          }
        )
      if (response) {
        const now = new Date()
        const dateString = now.toDateString() // e.g. "Sun Mar 07 2023"
        const timeString = now.toLocaleTimeString() // e.g. "2:37:42 PM"
        const dateTimeString = `${timeString} ${dateString}` // e.g. "Sun Mar 07 2023 2:37:42 PM"
        const key = `${newStatus}`
        const status = { [key]: dateTimeString, orderId }
        if (order) {
          db.get()
            .collection(collection.ORDER_SATUS)
            .updateOne(
              { orderId },
              {
                $set: {
                  [key]: dateTimeString,
                },
              },
              { upsert: true }
            )
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
  getReturnedOrders: async () => {
    try {
      const returnedOrders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ returnReason: { $exists: true } })
        .toArray()
      return returnedOrders
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  changeReturnStatus: async (returnInfo) => {
    const { orderId } = returnInfo
    try {
      const response = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              returnStatus: returnInfo.newStatus,
            },
          }
        )
      return response
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  setPickUpDate: async (pickupInfo) => {
    try {
      const response = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(pickupInfo.orderId) },
          {
            $set: {
              pickupDate: pickupInfo.pickupdate,
            },
          },
          { upsert: true }
        )
      return response
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  addOffer: async (offerInfo) => {
    try {
      console.log(offerInfo)
      const offerExists = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match: {
              offerEndDate: { $exists: true },
              product_category: offerInfo.category,
            },
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
                  { $divide: [1, "$product_price"] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              product_price: 1,
              offerPrice: 1,
              offerEndDate: 1,
              offerStartDate: 1,
              product_category: 1,
              offerPercentage: { $round: ["$offerPercentage", 2] },
            },
          },
        ])
        .toArray()
      if (offerExists.length) {
        return offerExists
      }
      const response = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateMany({ product_category: offerInfo.category }, [
          {
            $addFields: {
              offerPrice: {
                $subtract: [
                  "$product_price",
                  {
                    $multiply: [
                      "$product_price",
                      offerInfo.offer_percentage / 100,
                    ],
                  },
                ],
              },
              offerPercentage: parseFloat(offerInfo.offer_percentage),
            },
          },
          {
            $set: {
              offerPrice: "$offerPrice",
              offerEndDate: offerInfo.end_date,
              offerStartDate: offerInfo.start_date,
            },
          },
        ])
      return response
    } catch (err) {
      console.log(err)
      throw err
    }
  },
  replaceOfers: (replaceInfo) => {
    try {
      const offerPercentage = parseInt(replaceInfo.offer_percentage)
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateMany({ product_category: replaceInfo.category }, [
          {
            $addFields: {
              offerPrice: {
                $subtract: [
                  "$product_price",
                  { $multiply: ["$product_price", offerPercentage / 100] },
                ],
              },
              offerPercentage: parseFloat(replaceInfo.offer_percentage),
            },
          },
          {
            $set: {
              offerPrice: "$offerPrice",
              offerEndDate: replaceInfo.end_date,
              offerStartDate: replaceInfo.start_date,
            },
          },
        ])
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  checkOfferExpiration: () => {
    try {
      // Calculate the date when the offer ends
      const offerEndDate = moment().subtract(1, "days").toDate()
      // Convert offerEndDate to a string in the format 'YYYY-MM-DD'
      const isoOfferEndDate = moment(offerEndDate).format("YYYY-MM-DD")
      // Update the documents whose offer_end_date is in the past
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateMany(
          {
            offerEndDate: { $lt: isoOfferEndDate },
          },
          {
            $unset: { offerEndDate: 1 },
            $set: {
              offerPrice: null,
            },
          }
        )
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  addOfferToProducts: async (offerInfo) => {
    try {
      const productPrice = parseInt(offerInfo.product_price)
      const offerPercentage = parseInt(offerInfo.offer_percentage)
      const result = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(offerInfo.productId) },
          {
            $set: {
              offerPrice: productPrice - productPrice * (offerPercentage / 100),
              offerEndDate: offerInfo.end_date,
            },
          }
        )
      return result
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  calculateTotalRevenue: async () => {
    try {
      const revenue = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              status: "completed",
              returnReason: { $exists: false },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$offerTotal" },
            },
          },
        ])
        .toArray()
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
  calculateTotalRevenueByDate: async (from, to) => {
    try {
      var isoFromDate = new Date(from).toISOString()
      var isoToDate = new Date(to).toISOString()
      const revenue = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              status: "completed",
              returnReason: { $exists: false },
              date: {
                $gte: new Date(isoFromDate),
                $lt: new Date(isoToDate)
              }
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$offerTotal" },
            },
          },
        ])
        .toArray()
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
      const orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments()
      return orders
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  calculateTotalOrdersByDate: async (from, to) => {
    try {
      const fromDate = new Date(from)
      const toDate = new Date(to)
      const orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            date: {
              $gte: fromDate,
              $lt: toDate
            }
          },
        },
        {
          $count: "totalOrders",
        },
      ]).toArray()
      return orders[0] ? orders[0].totalOrders : 0
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  calculateTotalNumberOfProducts: async () => {
    try {
      const products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .countDocuments()
      return products
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  calculateTotalNumberOfProductsByDate: async (from, to) => {
    try {
      const products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .countDocuments({ addedAt: {$gte: new Date(from), $lte: new Date(to)}})
      return products
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  }
,
  calculateMonthlyEarnings: async () => {
    try {
      const monthlyIncome = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              status: "completed",
              returnReason: { $exists: false },
              date: {
                $gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
                $lt: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() + 1,
                  1
                ),
              },
            },
          },
          {
            $group: {
              _id: null,
              monthlyRevenue: { $sum: "$offerTotal" },
            },
          },
        ])
        .toArray()
      if (monthlyIncome.length) {
        return monthlyIncome[0].monthlyRevenue
      } else {
        return 0
      }
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  calculateAverageOrderValue: async() => {
    try {
      const aov = await db.get().collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            status: "completed",
            returnReason: { $exists: false },
            reasonToCancel: { $exists: false }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: "$offerTotal" }
          }
        },
        {
          $project: {
            _id: 0,
            AOV: { $divide: [ "$totalAmount", "$totalOrders" ] }
          }
        }
      ])
      .toArray()
      return aov[0].AOV
    } catch (error) {
      console.log(error)
    }

  },
  refundAmont: async (refundInfo) => {
    try {
      const userId = objectId(refundInfo.userId)
      const refundAmount = parseInt(refundInfo.amount)
      const orderId = refundInfo.orderId
      const currentDate = new Date()
      const optionsDate = { month: "long", day: "numeric", year: "numeric" }
      const optionsTime = { hour: "numeric", minute: "2-digit" }
      const dateString = currentDate.toLocaleDateString(undefined, optionsDate)
      const timeString = currentDate.toLocaleTimeString(undefined, optionsTime)
      const dateTimeString = `${dateString} at ${timeString}`
      const result = await db
        .get()
        .collection(collection.WALLET)
        .updateOne(
          { userid: userId },
          {
            $inc: { balance: refundAmount },
            $push: {
              transactions: {
                $each: [
                  {
                    orderId,
                    amount: refundAmount,
                    type: "credited",
                    date: dateTimeString,
                  },
                ],
              },
            },
            $set: {
              updatedAt: dateTimeString,
            },
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
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              refundStatus: "completed",
            },
          },
          { upsert: true }
        )
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  addSubCategory: async (subCategoryInfo) => {
    try {
      subCategoryInfo.active = true
      const result = await db
        .get()
        .collection(collection.SUB_CATEGORIES)
        .insertOne(subCategoryInfo)
      if (result.acknowledged) return result
    } catch (error) {
      console.log(error)
    }
  },
  getAllSubCategories: async () => {
    try {
      const subCategory = await db
        .get()
        .collection(collection.SUB_CATEGORIES)
        .find({})
        .toArray()
      return subCategory
    } catch (error) {
      console.log(error)
    }
  },
  deleteSubCategory: async (categoryId) => {
    try {
      return await db
        .get()
        .collection(collection.SUB_CATEGORIES)
        .deleteOne({ _id: objectId(categoryId) })
    } catch (error) {
      console.log(error)
    }
  },
  addCouponTemplate: async (couponInfo, image) => {
    const { title, description, brand, percentage, price_limit, mycategory } =
      couponInfo
    const couponStruct = {
      title,
      description,
      brand,
      percentage: parseInt(percentage),
      price_limit: parseInt(price_limit),
      category: mycategory,
      image,
    }
    try {
      return await db
        .get()
        .collection(collection.COUPON_TEMPLATE)
        .insertOne(couponStruct)
    } catch (error) {
      console.log(error)
    }
  },
  getAllCoupons: async () => {
    try {
      const coupons = await db
        .get()
        .collection(collection.COUPON_TEMPLATE)
        .find({})
        .toArray()
      return coupons
    } catch (error) {
      console.log(error)
    }
  },
  calculateMonthlySalesForGraph: async () => {
    try {
      const sales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: {
                month: { $month: "$date" },
                year: { $year: "$date" },
              },
              totalRevenue: { $sum: "$offerTotal" },
            },
          },
          {
            $project: {
              _id: 0,
              month: "$_id.month",
              year: "$_id.year",
              totalRevenue: 1,
            },
          },
          {
            $sort: {
              year: 1,
              month: 1,
            },
          },
        ])
        .toArray()
      const revenueByMonth = Array(12).fill(0)
      sales.forEach(({ month, totalRevenue }) => {
        revenueByMonth[month - 1] = totalRevenue
      })
      return revenueByMonth
    } catch (error) {
      console.log(error)
    }
  },
  NumberOfProductsAddedInEveryMonth: async () => {
    try {
      const products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: {
                month: { $month: "$addedAt" },
                year: { $year: "$addedAt" },
              },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              month: "$_id.month",
              year: "$_id.year",
              count: 1,
            },
          },
          {
            $sort: {
              year: 1,
              month: 1,
            },
          },
        ])
        .toArray()
      const productsByMonth = Array(12).fill(0)
      products.forEach(({ month, count }) => {
        productsByMonth[month - 1] = count
      })
      return productsByMonth
    } catch (error) {
      console.log(error)
    }
  },
  findNumberOfMonthlyVisitors: async () => {
    try {
      const visitors = await db
        .get()
        .collection(collection.VISITORS)
        .aggregate([
          {
            $group: {
              _id: {
                year: { $toInt: { $substr: ["$month", 0, 4] } },
                month: { $toInt: { $substr: ["$month", 5, 2] } },
              },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              month: "$_id.month",
              year: "$_id.year",
              count: 1,
            },
          },
          {
            $sort: {
              year: 1,
              month: 1,
            },
          },
        ])
        .toArray()

      const visitorsByMonth = Array(12).fill(0)
      visitors.forEach(({ month, count }) => {
        visitorsByMonth[month - 1] = count
      })
      return visitorsByMonth
    } catch (error) {
      console.log(error)
    }
  },
  orderStatitics: async () => {
    try {
      const orderStat = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: null,
              placedCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "placed"] },
                        { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                        { $not: [{ $ifNull: ["$returnReason", false] }] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              confirmedCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "confirmed"] },
                        { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                        { $not: [{ $ifNull: ["$returnReason", false] }] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              shippedCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "shipped"] },
                        { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                        { $not: [{ $ifNull: ["$returnReason", false] }] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              outForDeliveryCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "delivery"] },
                        { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                        { $not: [{ $ifNull: ["$returnReason", false] }] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              completedCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "completed"] },
                        { $not: [{ $ifNull: ["$reasonTocancell", false] }] },
                        { $not: [{ $ifNull: ["$returnReason", false] }] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              reasonToCancelCount: {
                $sum: {
                  $cond: [{ $ifNull: ["$reasonTocancell", false] }, 1, 0],
                },
              },
              returnReasonCount: {
                $sum: { $cond: [{ $ifNull: ["$returnReason", false] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              placedCount: 1,
              confirmedCount: 1,
              shippedCount: 1,
              outForDeliveryCount: 1,
              completedCount: 1,
              reasonToCancelCount: 1,
              returnReasonCount: 1,
            },
          },
        ])
        .toArray()
      const valuesArray = Object.values(orderStat[0])
      return valuesArray
    } catch (error) {
      console.log(error)
    }
  },
  paymentStat: async () => {
    try {
      const payment = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: null,
              codCount: {
                $sum: { $cond: [{ $eq: ["$paymentMethod", "cod"] }, 1, 0] },
              },
              paypalCount: {
                $sum: { $cond: [{ $eq: ["$paymentMethod", "paypal"] }, 1, 0] },
              },
              walletCount: {
                $sum: { $cond: [{ $eq: ["$paymentMethod", "wallet"] }, 1, 0] },
              },
              razorpayCount: {
                $sum: {
                  $cond: [{ $eq: ["$paymentMethod", "razorpay"] }, 1, 0],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              codCount: 1,
              paypalCount: 1,
              walletCount: 1,
              razorpayCount: 1,
            },
          },
        ])
        .toArray()
      const valuesArray = Object.values(payment[0])
      valuesArray[1] = 49
      return valuesArray
    } catch (error) {
      console.log(error)
    }
  },
  mostSellingProducts: async () => {
    try {
      const mostSelling = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$products" },
          {
            $group: {
              _id: "$products.item",
              sold: { $sum: "$products.quantity" },
            },
          },
          { $sort: { sold: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "product_details",
            },
          },
        ])
        .toArray()
      return mostSelling
    } catch (error) {
      console.log(error)
    }
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
export default adminHelpers
