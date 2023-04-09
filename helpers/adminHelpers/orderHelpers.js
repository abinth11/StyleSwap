import db from "../../config/connection.js"
import collection from "../../config/collections.js"
import { ObjectId as objectId } from "mongodb"
export const orderHelpers = {
    getAllUserOrdersCount: async () => {
        try {
          const count = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({})
          return { count}
        } catch (error) {
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
            const dateString = now.toDateString() 
            const timeString = now.toLocaleTimeString() 
            const dateTimeString = `${timeString} ${dateString}` 
            const key = `${newStatus}`
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
            } 
            return response
          }
        } catch (error) {
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
          throw new Error(error)
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
          throw new Error(error)
        }
      },
      paginateUsingLimitAndSkip:async (limit,skip,pageNumber) => {
        try {
          const pageNo = parseInt(pageNumber)
          const data = await db.get().collection(collection.ORDER_COLLECTION)
          .find({})
          .sort({date: -1})
          .skip(skip*(pageNo-1))
          .limit(limit)
          .toArray()      
          return data
    
        } catch (error) {
          throw new Error(error)
        }
      }

}