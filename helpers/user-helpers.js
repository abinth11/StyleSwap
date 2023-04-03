import db from "../config/connection.js"
import collection from "../config/collections.js"
import { ObjectId } from "mongodb"
import Razorpay from "razorpay"
import paypal from "paypal-rest-sdk"
import crypto from "crypto"
let sotoredAmount
const userHelpers = {
 
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
  getAllAddresses: async (userId) => {
    try {
      const addresses = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .find({ userId })
        .toArray()
      return addresses
    } catch (error) {
      console.log(error)
      throw new Error("Failed to fetch all orders of the user")
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
 


  createCouponForUsers: async (userId) => {
    //? get all available coupon templates from the database
    const couponTemplates = await db
      .get()
      .collection(collection.COUPON_TEMPLATE)
      .find({})
      .toArray()
    //* randomly select a coupon template from the list
    const randomIndex = Math.floor(Math.random() * couponTemplates.length)

    const selectedCouponTemplate = couponTemplates[randomIndex]
    console.log(selectedCouponTemplate)

    //? calculate the expiry date for the new coupon
    const MIN_EXPIRY_DAYS = 15
    const MAX_EXPIRY_DAYS = 30
    const expiryDays =
      Math.floor(Math.random() * (MAX_EXPIRY_DAYS - MIN_EXPIRY_DAYS + 1)) +
      MIN_EXPIRY_DAYS
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + expiryDays)

    //? creating a unique coupon code usin crypto algorithm
    function generateCouponCode(length) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      const bytes = crypto.randomBytes(length)
      const result = new Array(length)

      for (let i = 0; i < length; i++) {
        const byte = bytes[i]
        result[i] = chars[byte % chars.length]
      }

      return result.join("")
    }

    //* create a new coupon based on the selected template's rules
    const newCoupon = {
      userId: userId,
      couponCode: generateCouponCode(10),
      name: selectedCouponTemplate.title,
      brand: selectedCouponTemplate.brand,
      discountPercentage: selectedCouponTemplate.percentage,
      minimumPurchaseAmount: selectedCouponTemplate.price_limit,
      expirationDate: expiryDate,
      image: selectedCouponTemplate.image,
      numberOfUses: 1,
      used: false,
    }
    console.log(newCoupon)
    // todo inserting the creted coupon into the database
    const response = await db
      .get()
      .collection(collection.COUPONS)
      .insertOne(newCoupon)
    if (response.acknowledged) {
      return newCoupon
    }
  },
  getUserCoupons: async (userId) => {
    try {
      const coupon = await db
        .get()
        .collection(collection.COUPONS)
        .find({ userId })
        .toArray()
      return coupon
    } catch (error) {
      console.log(error)
    }
  },
  redeemCoupon: async (couponCode, amount) => {
    try {
      const couponCollection = db.get().collection(collection.COUPONS)
      const coupon = await couponCollection.findOne({ couponCode: couponCode })
      const total = parseInt(amount)
      if (!coupon) {
        return { valid: false, message: "Invalid coupon code" }
      }
      if (coupon.used) {
        return { valid: false, message: "Coupon code already used" }
      }
      if (coupon.expirationDate < new Date()) {
        return { valid: false, message: "Coupon code expired" }
      }
      if (total < coupon.minimumPurchaseAmount) {
        return {
          valid: false,
          message: `Minimum purchase amount is ${coupon.minimumPurchaseAmount}`,
        }
      }
      if (coupon.numberOfUses < 1) {
        return {
          valid: false,
          message: `You are already entered coupon code, try again after 24 hours`,
        }
      }
      const min = 5,
        max = coupon.discountPercentage
      const discountPercentage = Math.floor(
        Math.random() * (max - min + 1) + min
      )
      console.log(discountPercentage)
      const discountAmount = Math.floor((amount / 100) * discountPercentage)
      console.log(discountAmount)
      if (coupon.numberOfUses >= 1) {
        await db
          .get()
          .collection(collection.COUPONS)
          .updateOne(
            { couponCode },
            { $inc: { numberOfUses: -1 }, $set: { lastApplied: new Date() } },
            { upsert: true }
          )
      }
      const responseObject = {
        valid: true,
        coupon,
        discountAmount,
        originalAmount: total,
        priceAfterDiscount: total - discountAmount,
      }
      return responseObject
    } catch (error) {
      console.log(error)
    }
  },
  resetCouponCount: async () => {
    try {
      const currentTime = new Date()
      // const resetThreshold = new Date(currentTime - 24 * 60 * 60 * 1000); // 24 hours ago
      const resetThreshold = new Date("2023-04-23T05:26:00.864Z")
      // console.log(resetThreshold);

      // Query the couponResetHistory collection for coupons that were last reset more than 24 hours ago
      const couponsToReset = await db
        .get()
        .collection(collection.COUPONS)
        .find({ lastApplied: { $lt: resetThreshold }, used: false })
        .toArray()
      // console.log(couponsToReset);

      // Get an array of coupon codes to update
      const couponCodesToReset = couponsToReset.map(
        (coupon) => coupon.couponCode
      )

      // Update the numberOfUses field for the selected coupons
      await db
        .get()
        .collection(collection.COUPONS)
        .updateMany(
          { couponCode: { $in: couponCodesToReset } },
          { $set: { numberOfUses: 1 } }
        )

      // Update the couponResetHistory collection with the new reset time for the updated coupons
      // await db
      //   .get()
      //   .collection(collection.COUPON_RESET_HISTORY)
      //   .updateMany(
      //     { couponCode: { $in: couponCodesToReset } },
      //     { $set: { lastResetTime: currentTime } }
      //   );
    } catch (error) {
      console.log(error)
    }
  },


  getMensProducts: async () => {
    try {
      const products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ product_category: "Mens" })
        .toArray()
      return products
    } catch (error) {
      console.log(error)
    }
  },
  getWomensProducts: async () => {
    try {
      const products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ product_category: "Womens" })
        .toArray()
      return products
    } catch (error) {
      console.log(error)
    }
  },
  getKidsProducts: async () => {
    try {
      const products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ product_category: "Kids" })
        .toArray()
      return products
    } catch (error) {
      console.log(error)
    }
  },
  addRatingForProducts: async (ratingInfo, userInfos) => {
    try {
      const { _id: userId, name, email, active} = userInfos
      const { comment, rating, productId } = ratingInfo
      //? check if the user has purchased the product to add rating
      const purchased = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              userId: ObjectId(userId), // Replace with the user ID you want to check
              status: "completed", // Only take orders with completed status
            },
          },
          {
            $unwind: "$products", // Unwind the products array
          },
          {
            $match: {
              "products.item": ObjectId(productId), // Replace with the product ID you want to check
            },
          },
          {
            $project: {
              _id: 0,
              orderId: "$_id",
              productId: "$products.item",
            },
          },
        ])
        .toArray()
      if (purchased.length === 0) {
        return {
          Message: "Please purchase the product to add a reiveiw",
          notPurchased: true,
        }
      }
      const alreadyPosted = await db
        .get()
        .collection(collection.PRODUCT_RATING)
        .findOne({
          productId: ObjectId(productId),
          "userDetails.userId": userId,
        })
      console.log(alreadyPosted)
      if (alreadyPosted) {
        return {
          Message: "Review already posted",
          alreadyPosted: true,
        }
      }
      const ratingSchema = {
        productId: ObjectId(productId),
        userDetails: {
          userId,
          name,
          email,
          active
        },
        rating: parseInt(rating),
        comment,
        addedAt: new Date(),
      }
      const response = await db
        .get()
        .collection(collection.PRODUCT_RATING)
        .insertOne(ratingSchema)
      return { Message: "Added your review", status: true, response }
    } catch (error) {
      console.log(error)
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
 
}

export default userHelpers
