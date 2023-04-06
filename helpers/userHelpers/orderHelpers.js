import db from "../../config/connection.js"
import collection from "../../config/collections.js"
import { ObjectId } from "mongodb"
export const orderHelpers = {
  getCurrentUserOrders: async (orderId) => {
    try {
      const order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: ObjectId(orderId),
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
      throw new Error("Failed to fetch current user orders")
    }
  },
  cancellUserOrder: (orderId, reason) => {
    try {
      return new Promise((resolve) => {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: ObjectId(orderId) },
            {
              $set: {
                status: "cancelled",
                reasonTocancell: reason,
              },
            },
            { upsert: true }
          )
          .then(() => {
            resolve()
          })
      })
    } catch (error) {
      console.log(error)
      throw new Error("Failed to cancel order")
    }
  },
  getOrderedGroup: async (userId) => {
    try {
      const orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: ObjectId(userId) })
        .toArray()
      return orders
    } catch (errors) {
      console.log(errors)
    }
  },
  getOrderStatus: async (orderId) => {
    try {
      const orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ _id: ObjectId(orderId) })
        .toArray()
      return orders[0]
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getStatusDates: async (orderId) => {
    console.log(orderId)
    try {
      const dates = await db
        .get()
        .collection(collection.ORDER_SATUS)
        .findOne({ orderId })
      return dates
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getAddressforTrackingPage: async (orderId) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const deliveryAddress = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: ObjectId(orderId),
            },
          },
          {
            $lookup: {
              from: collection.ADDRESS_COLLECTION,
              localField: "deliveryAddressId",
              foreignField: "_id",
              as: "address",
            },
          },
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
        ])
        .toArray()
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getOrdersProfile: async (orderId) => {
    try {
      const orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: ObjectId(orderId) })
        .toArray()
      return orders
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  getProductsWithSameId: async (orderId) => {
    try {
      const products = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: ObjectId(orderId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              proId: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "proId",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $project: {
              proId: 1,
              quantity: 1,
              products: { $arrayElemAt: ["$products", 0] },
            },
          },
        ])
        .toArray()
      return products
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  returnProduct: async (returnInfo) => {
    try {
      return new Promise((resolve) => {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: ObjectId(returnInfo.orderId) },
            {
              $set: {
                returnReason: returnInfo.reason,
                returnStatus: "pending",
              },
            },
            { upsert: true }
          )
          .then((response) => {
            resolve(response)
          })
      })
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
}
